import { refreshAccessToken, type OAuthProvider } from './oauth.js'

export interface CalendarSyncOptions {
  connectionId: string
  taskId: string
  dueAt: Date
  durationMinutes?: number
}

export interface CalendarDeleteOptions {
  connectionId: string
  providerEventId: string
}

export interface CalendarUpdateOptions extends CalendarDeleteOptions {
  taskId: string
  dueAt: Date
  durationMinutes?: number
}

export interface CalendarConnection {
  provider: OAuthProvider
  accessToken: string
  refreshToken: string
  expiresAt: Date | null
  scopes?: string[]
}

export interface SavedCalendarTokens {
  accessToken: string
  refreshToken: string
  expiresAt: Date
  scopes: string[]
}

export interface CalendarSyncDependencies {
  fetch?: typeof fetch
  loadConnection: (connectionId: string) => Promise<CalendarConnection>
  saveConnectionTokens?: (connectionId: string, tokens: SavedCalendarTokens) => Promise<void> | void
  now?: () => Date
}

export interface CalendarSyncResult {
  provider: OAuthProvider
  providerEventId: string
  providerUrl?: string
}

export class CalendarEventNotFoundError extends Error {
  constructor(
    message: string,
    readonly provider: OAuthProvider,
    readonly status: number,
  ) {
    super(message)
    this.name = 'CalendarEventNotFoundError'
  }
}

const DEFAULT_DURATION_MINUTES = 30
const CALENDAR_EVENT_TITLE = 'PHIGuard task due'
const TOKEN_REFRESH_SKEW_MS = 60_000

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000)
}

function buildGoogleEventPayload(options: {
  connectionId: string
  taskId: string
  dueAt: Date
  durationMinutes?: number
}) {
  const start = options.dueAt
  const end = addMinutes(start, options.durationMinutes ?? DEFAULT_DURATION_MINUTES)

  return {
    summary: CALENDAR_EVENT_TITLE,
    start: { dateTime: start.toISOString() },
    end: { dateTime: end.toISOString() },
    extendedProperties: {
      private: {
        phiguardTaskId: options.taskId,
        phiguardConnectionId: options.connectionId,
      },
    },
  }
}

function buildMicrosoftEventPayload(options: {
  connectionId: string
  taskId: string
  dueAt: Date
  durationMinutes?: number
}) {
  const start = options.dueAt
  const end = addMinutes(start, options.durationMinutes ?? DEFAULT_DURATION_MINUTES)

  return {
    subject: CALENDAR_EVENT_TITLE,
    start: {
      dateTime: start.toISOString(),
      timeZone: 'UTC',
    },
    end: {
      dateTime: end.toISOString(),
      timeZone: 'UTC',
    },
    singleValueExtendedProperties: [
      {
        id: 'String {00020329-0000-0000-C000-000000000046} Name phiguardTaskId',
        value: options.taskId,
      },
      {
        id: 'String {00020329-0000-0000-C000-000000000046} Name phiguardConnectionId',
        value: options.connectionId,
      },
    ],
  }
}

function shouldRefreshToken(expiresAt: Date | null, now: Date) {
  if (!expiresAt) return false
  return expiresAt.getTime() - now.getTime() <= TOKEN_REFRESH_SKEW_MS
}

async function resolveAccessToken(
  connectionId: string,
  connection: CalendarConnection,
  deps: Required<Pick<CalendarSyncDependencies, 'fetch' | 'now'>> &
    Pick<CalendarSyncDependencies, 'saveConnectionTokens'>,
) {
  if (!shouldRefreshToken(connection.expiresAt, deps.now())) {
    return connection.accessToken
  }

  const refreshed = await refreshAccessToken(
    connection.provider,
    connection.refreshToken,
    deps.fetch,
    deps.now,
  )
  const tokensToSave = {
    ...refreshed,
    scopes: refreshed.scopes.length > 0 ? refreshed.scopes : (connection.scopes ?? []),
  }
  await deps.saveConnectionTokens?.(connectionId, tokensToSave)
  return refreshed.accessToken
}

async function createGoogleEvent(
  fetchImpl: typeof fetch,
  accessToken: string,
  options: CalendarSyncOptions,
): Promise<CalendarSyncResult> {
  const response = await fetchImpl(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildGoogleEventPayload(options)),
    },
  )

  if (!response.ok) {
    throw new Error(
      `Google Calendar event creation failed: ${response.status} ${await response.text()}`,
    )
  }

  const data = (await response.json()) as { id?: string; htmlLink?: string }
  if (!data.id) throw new Error('Google Calendar event creation did not return an event id')

  return {
    provider: 'google',
    providerEventId: data.id,
    providerUrl: data.htmlLink,
  }
}

async function createMicrosoftEvent(
  fetchImpl: typeof fetch,
  accessToken: string,
  options: CalendarSyncOptions,
): Promise<CalendarSyncResult> {
  const response = await fetchImpl('https://graph.microsoft.com/v1.0/me/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildMicrosoftEventPayload(options)),
  })

  if (!response.ok) {
    throw new Error(
      `Microsoft Calendar event creation failed: ${response.status} ${await response.text()}`,
    )
  }

  const data = (await response.json()) as { id?: string; webLink?: string }
  if (!data.id) throw new Error('Microsoft Calendar event creation did not return an event id')

  return {
    provider: 'microsoft',
    providerEventId: data.id,
    providerUrl: data.webLink,
  }
}

async function updateGoogleEvent(
  fetchImpl: typeof fetch,
  accessToken: string,
  options: CalendarUpdateOptions,
): Promise<CalendarSyncResult> {
  const response = await fetchImpl(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(
      options.providerEventId,
    )}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildGoogleEventPayload(options)),
    },
  )

  if (!response.ok) {
    if (response.status === 404 || response.status === 410) {
      throw new CalendarEventNotFoundError(
        `Google Calendar event update failed: ${response.status}`,
        'google',
        response.status,
      )
    }
    throw new Error(
      `Google Calendar event update failed: ${response.status} ${await response.text()}`,
    )
  }

  const data = (await response.json()) as { id?: string; htmlLink?: string }
  if (!data.id) throw new Error('Google Calendar event update did not return an event id')

  return {
    provider: 'google',
    providerEventId: data.id,
    providerUrl: data.htmlLink,
  }
}

async function updateMicrosoftEvent(
  fetchImpl: typeof fetch,
  accessToken: string,
  options: CalendarUpdateOptions,
): Promise<CalendarSyncResult> {
  const response = await fetchImpl(
    `https://graph.microsoft.com/v1.0/me/events/${encodeURIComponent(options.providerEventId)}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildMicrosoftEventPayload(options)),
    },
  )

  if (!response.ok) {
    if (response.status === 404 || response.status === 410) {
      throw new CalendarEventNotFoundError(
        `Microsoft Calendar event update failed: ${response.status}`,
        'microsoft',
        response.status,
      )
    }
    throw new Error(
      `Microsoft Calendar event update failed: ${response.status} ${await response.text()}`,
    )
  }

  const data = (await response.json()) as { id?: string; webLink?: string }
  if (!data.id) throw new Error('Microsoft Calendar event update did not return an event id')

  return {
    provider: 'microsoft',
    providerEventId: data.id,
    providerUrl: data.webLink,
  }
}

async function deleteGoogleEvent(
  fetchImpl: typeof fetch,
  accessToken: string,
  options: CalendarDeleteOptions,
) {
  const response = await fetchImpl(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(
      options.providerEventId,
    )}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )

  if (!response.ok && response.status !== 404 && response.status !== 410) {
    throw new Error(
      `Google Calendar event deletion failed: ${response.status} ${await response.text()}`,
    )
  }
}

async function deleteMicrosoftEvent(
  fetchImpl: typeof fetch,
  accessToken: string,
  options: CalendarDeleteOptions,
) {
  const response = await fetchImpl(
    `https://graph.microsoft.com/v1.0/me/events/${encodeURIComponent(options.providerEventId)}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )

  if (!response.ok && response.status !== 404 && response.status !== 410) {
    throw new Error(
      `Microsoft Calendar event deletion failed: ${response.status} ${await response.text()}`,
    )
  }
}

export async function syncTaskToCalendar(
  options: CalendarSyncOptions,
  dependencies: CalendarSyncDependencies,
): Promise<CalendarSyncResult> {
  const fetchImpl = dependencies.fetch ?? fetch
  const now = dependencies.now ?? (() => new Date())
  const connection = await dependencies.loadConnection(options.connectionId)
  const accessToken = await resolveAccessToken(options.connectionId, connection, {
    fetch: fetchImpl,
    now,
    saveConnectionTokens: dependencies.saveConnectionTokens,
  })

  if (connection.provider === 'google') {
    return createGoogleEvent(fetchImpl, accessToken, options)
  }

  return createMicrosoftEvent(fetchImpl, accessToken, options)
}

export async function deleteTaskCalendarEvent(
  options: CalendarDeleteOptions,
  dependencies: CalendarSyncDependencies,
): Promise<void> {
  const fetchImpl = dependencies.fetch ?? fetch
  const now = dependencies.now ?? (() => new Date())
  const connection = await dependencies.loadConnection(options.connectionId)
  const accessToken = await resolveAccessToken(options.connectionId, connection, {
    fetch: fetchImpl,
    now,
    saveConnectionTokens: dependencies.saveConnectionTokens,
  })

  if (connection.provider === 'google') {
    await deleteGoogleEvent(fetchImpl, accessToken, options)
    return
  }

  await deleteMicrosoftEvent(fetchImpl, accessToken, options)
}

export async function updateTaskCalendarEvent(
  options: CalendarUpdateOptions,
  dependencies: CalendarSyncDependencies,
): Promise<CalendarSyncResult> {
  const fetchImpl = dependencies.fetch ?? fetch
  const now = dependencies.now ?? (() => new Date())
  const connection = await dependencies.loadConnection(options.connectionId)
  const accessToken = await resolveAccessToken(options.connectionId, connection, {
    fetch: fetchImpl,
    now,
    saveConnectionTokens: dependencies.saveConnectionTokens,
  })

  if (connection.provider === 'google') {
    return updateGoogleEvent(fetchImpl, accessToken, options)
  }

  return updateMicrosoftEvent(fetchImpl, accessToken, options)
}
