import { afterEach, describe, it, expect, vi } from 'vitest'
import {
  CalendarEventNotFoundError,
  deleteTaskCalendarEvent,
  syncTaskToCalendar,
  updateTaskCalendarEvent,
} from '../calendar-sync.js'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('syncTaskToCalendar', () => {
  it('creates a Google calendar event for the task due date', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'google-event-123',
        htmlLink: 'https://calendar.google.com/event?eid=123',
      }),
    } as unknown as Response)

    const result = await syncTaskToCalendar(
      {
        connectionId: 'conn-123',
        taskId: 'task-456',
        dueAt: new Date('2026-05-01T09:00:00Z'),
      },
      {
        fetch: fetchImpl,
        loadConnection: async () => ({
          provider: 'google',
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresAt: new Date('2026-05-01T10:00:00Z'),
        }),
        now: () => new Date('2026-05-01T08:00:00Z'),
      },
    )

    expect(result).toEqual({
      provider: 'google',
      providerEventId: 'google-event-123',
      providerUrl: 'https://calendar.google.com/event?eid=123',
    })
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer access-token',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          summary: 'PHIGuard task due',
          start: { dateTime: '2026-05-01T09:00:00.000Z' },
          end: { dateTime: '2026-05-01T09:30:00.000Z' },
          extendedProperties: {
            private: {
              phiguardTaskId: 'task-456',
              phiguardConnectionId: 'conn-123',
            },
          },
        }),
      }),
    )
    expect(JSON.stringify(fetchImpl.mock.calls)).not.toContain('HIPAA policy review')
  })

  it('creates a Microsoft calendar event for the task due date', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'ms-event-123',
        webLink: 'https://outlook.office.com/calendar/item/123',
      }),
    } as unknown as Response)

    const result = await syncTaskToCalendar(
      {
        connectionId: 'conn-123',
        taskId: 'task-456',
        dueAt: new Date('2026-05-01T09:00:00Z'),
        durationMinutes: 45,
      },
      {
        fetch: fetchImpl,
        loadConnection: async () => ({
          provider: 'microsoft',
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresAt: new Date('2026-05-01T10:00:00Z'),
        }),
        now: () => new Date('2026-05-01T08:00:00Z'),
      },
    )

    expect(result).toEqual({
      provider: 'microsoft',
      providerEventId: 'ms-event-123',
      providerUrl: 'https://outlook.office.com/calendar/item/123',
    })
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://graph.microsoft.com/v1.0/me/events',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer access-token',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          subject: 'PHIGuard task due',
          start: {
            dateTime: '2026-05-01T09:00:00.000Z',
            timeZone: 'UTC',
          },
          end: {
            dateTime: '2026-05-01T09:45:00.000Z',
            timeZone: 'UTC',
          },
          singleValueExtendedProperties: [
            {
              id: 'String {00020329-0000-0000-C000-000000000046} Name phiguardTaskId',
              value: 'task-456',
            },
            {
              id: 'String {00020329-0000-0000-C000-000000000046} Name phiguardConnectionId',
              value: 'conn-123',
            },
          ],
        }),
      }),
    )
    expect(JSON.stringify(fetchImpl.mock.calls)).not.toContain('HIPAA policy review')
  })

  it('refreshes an expiring token before creating the event', async () => {
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_ID', 'test-client')
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_SECRET', 'test-secret')
    vi.stubEnv('GOOGLE_OAUTH_REDIRECT_URI', 'http://localhost/callback')

    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'fresh-access-token',
          refresh_token: 'fresh-refresh-token',
          expires_in: 3600,
          scope: 'openid email https://www.googleapis.com/auth/calendar.events',
        }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'google-event-123' }),
      } as unknown as Response)
    const saveConnectionTokens = vi.fn()

    await syncTaskToCalendar(
      {
        connectionId: 'conn-123',
        taskId: 'task-456',
        dueAt: new Date('2026-05-01T09:00:00Z'),
      },
      {
        fetch: fetchImpl,
        loadConnection: async () => ({
          provider: 'google',
          accessToken: 'stale-access-token',
          refreshToken: 'refresh-token',
          expiresAt: new Date('2026-05-01T08:00:30Z'),
        }),
        saveConnectionTokens,
        now: () => new Date('2026-05-01T08:00:00Z'),
      },
    )

    expect(saveConnectionTokens).toHaveBeenCalledWith('conn-123', {
      accessToken: 'fresh-access-token',
      refreshToken: 'fresh-refresh-token',
      expiresAt: new Date('2026-05-01T09:00:00Z'),
      scopes: ['openid', 'email', 'https://www.googleapis.com/auth/calendar.events'],
    })
    expect(fetchImpl).toHaveBeenLastCalledWith(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer fresh-access-token',
        }),
      }),
    )
  })

  it('preserves existing scopes when refreshed token response omits scope', async () => {
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_ID', 'test-client')
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_SECRET', 'test-secret')
    vi.stubEnv('GOOGLE_OAUTH_REDIRECT_URI', 'http://localhost/callback')

    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'fresh-access-token',
          expires_in: 3600,
        }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'google-event-123' }),
      } as unknown as Response)
    const saveConnectionTokens = vi.fn()

    await syncTaskToCalendar(
      {
        connectionId: 'conn-123',
        taskId: 'task-456',
        dueAt: new Date('2026-05-01T09:00:00Z'),
      },
      {
        fetch: fetchImpl,
        loadConnection: async () => ({
          provider: 'google',
          accessToken: 'stale-access-token',
          refreshToken: 'refresh-token',
          expiresAt: new Date('2026-05-01T08:00:30Z'),
          scopes: ['openid', 'email', 'https://www.googleapis.com/auth/calendar.events'],
        }),
        saveConnectionTokens,
        now: () => new Date('2026-05-01T08:00:00Z'),
      },
    )

    expect(saveConnectionTokens).toHaveBeenCalledWith('conn-123', {
      accessToken: 'fresh-access-token',
      refreshToken: 'refresh-token',
      expiresAt: new Date('2026-05-01T09:00:00Z'),
      scopes: ['openid', 'email', 'https://www.googleapis.com/auth/calendar.events'],
    })
  })

  it('does not save refreshed tokens when the provider omits access_token', async () => {
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_ID', 'test-client')
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_SECRET', 'test-secret')
    vi.stubEnv('GOOGLE_OAUTH_REDIRECT_URI', 'http://localhost/callback')

    const fetchImpl = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        refresh_token: 'fresh-refresh-token',
        expires_in: 3600,
        scope: 'openid email https://www.googleapis.com/auth/calendar.events',
      }),
    } as unknown as Response)
    const saveConnectionTokens = vi.fn()

    await expect(
      syncTaskToCalendar(
        {
          connectionId: 'conn-123',
          taskId: 'task-456',
          dueAt: new Date('2026-05-01T09:00:00Z'),
        },
        {
          fetch: fetchImpl,
          loadConnection: async () => ({
            provider: 'google',
            accessToken: 'stale-access-token',
            refreshToken: 'refresh-token',
            expiresAt: new Date('2026-05-01T08:00:30Z'),
          }),
          saveConnectionTokens,
          now: () => new Date('2026-05-01T08:00:00Z'),
        },
      ),
    ).rejects.toThrow('OAuth token refresh failed: google did not return an access token')

    expect(saveConnectionTokens).not.toHaveBeenCalled()
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('does not save refreshed tokens when the provider returns an invalid expiry', async () => {
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_ID', 'test-client')
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_SECRET', 'test-secret')
    vi.stubEnv('GOOGLE_OAUTH_REDIRECT_URI', 'http://localhost/callback')

    const fetchImpl = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: 'fresh-access-token',
        refresh_token: 'fresh-refresh-token',
        expires_in: 0,
        scope: 'openid email https://www.googleapis.com/auth/calendar.events',
      }),
    } as unknown as Response)
    const saveConnectionTokens = vi.fn()

    await expect(
      syncTaskToCalendar(
        {
          connectionId: 'conn-123',
          taskId: 'task-456',
          dueAt: new Date('2026-05-01T09:00:00Z'),
        },
        {
          fetch: fetchImpl,
          loadConnection: async () => ({
            provider: 'google',
            accessToken: 'stale-access-token',
            refreshToken: 'refresh-token',
            expiresAt: new Date('2026-05-01T08:00:30Z'),
          }),
          saveConnectionTokens,
          now: () => new Date('2026-05-01T08:00:00Z'),
        },
      ),
    ).rejects.toThrow('OAuth token refresh failed: google did not return a valid expiry')

    expect(saveConnectionTokens).not.toHaveBeenCalled()
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })
})

describe('deleteTaskCalendarEvent', () => {
  it('deletes a Google calendar event by provider event id', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => '',
    } as unknown as Response)

    await deleteTaskCalendarEvent(
      {
        connectionId: 'conn-123',
        providerEventId: 'google-event-123',
      },
      {
        fetch: fetchImpl,
        loadConnection: async () => ({
          provider: 'google',
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresAt: new Date('2026-05-01T10:00:00Z'),
        }),
        now: () => new Date('2026-05-01T08:00:00Z'),
      },
    )

    expect(fetchImpl).toHaveBeenCalledWith(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events/google-event-123',
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({
          Authorization: 'Bearer access-token',
        }),
      }),
    )
  })

  it('deletes a Microsoft calendar event by provider event id', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => '',
    } as unknown as Response)

    await deleteTaskCalendarEvent(
      {
        connectionId: 'conn-123',
        providerEventId: 'ms-event-123',
      },
      {
        fetch: fetchImpl,
        loadConnection: async () => ({
          provider: 'microsoft',
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresAt: new Date('2026-05-01T10:00:00Z'),
        }),
        now: () => new Date('2026-05-01T08:00:00Z'),
      },
    )

    expect(fetchImpl).toHaveBeenCalledWith(
      'https://graph.microsoft.com/v1.0/me/events/ms-event-123',
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({
          Authorization: 'Bearer access-token',
        }),
      }),
    )
  })
})

describe('updateTaskCalendarEvent', () => {
  it('updates a Google calendar event with a generic due-date payload', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'google-event-123',
        htmlLink: 'https://calendar.google.com/event?eid=123',
      }),
    } as unknown as Response)

    const result = await updateTaskCalendarEvent(
      {
        connectionId: 'conn-123',
        taskId: 'task-456',
        providerEventId: 'google-event-123',
        dueAt: new Date('2026-05-03T14:00:00Z'),
      },
      {
        fetch: fetchImpl,
        loadConnection: async () => ({
          provider: 'google',
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresAt: new Date('2026-05-03T15:00:00Z'),
        }),
        now: () => new Date('2026-05-03T13:00:00Z'),
      },
    )

    expect(result).toEqual({
      provider: 'google',
      providerEventId: 'google-event-123',
      providerUrl: 'https://calendar.google.com/event?eid=123',
    })
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events/google-event-123',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          summary: 'PHIGuard task due',
          start: { dateTime: '2026-05-03T14:00:00.000Z' },
          end: { dateTime: '2026-05-03T14:30:00.000Z' },
          extendedProperties: {
            private: {
              phiguardTaskId: 'task-456',
              phiguardConnectionId: 'conn-123',
            },
          },
        }),
      }),
    )
    expect(JSON.stringify(fetchImpl.mock.calls)).not.toContain('Patient John')
  })

  it('updates a Microsoft calendar event with a generic due-date payload', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'ms-event-123',
        webLink: 'https://outlook.office.com/calendar/item/123',
      }),
    } as unknown as Response)

    const result = await updateTaskCalendarEvent(
      {
        connectionId: 'conn-123',
        taskId: 'task-456',
        providerEventId: 'ms-event-123',
        dueAt: new Date('2026-05-03T14:00:00Z'),
      },
      {
        fetch: fetchImpl,
        loadConnection: async () => ({
          provider: 'microsoft',
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresAt: new Date('2026-05-03T15:00:00Z'),
        }),
        now: () => new Date('2026-05-03T13:00:00Z'),
      },
    )

    expect(result).toEqual({
      provider: 'microsoft',
      providerEventId: 'ms-event-123',
      providerUrl: 'https://outlook.office.com/calendar/item/123',
    })
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://graph.microsoft.com/v1.0/me/events/ms-event-123',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          subject: 'PHIGuard task due',
          start: {
            dateTime: '2026-05-03T14:00:00.000Z',
            timeZone: 'UTC',
          },
          end: {
            dateTime: '2026-05-03T14:30:00.000Z',
            timeZone: 'UTC',
          },
          singleValueExtendedProperties: [
            {
              id: 'String {00020329-0000-0000-C000-000000000046} Name phiguardTaskId',
              value: 'task-456',
            },
            {
              id: 'String {00020329-0000-0000-C000-000000000046} Name phiguardConnectionId',
              value: 'conn-123',
            },
          ],
        }),
      }),
    )
    expect(JSON.stringify(fetchImpl.mock.calls)).not.toContain('Patient John')
  })

  it('throws a typed missing-event error when Google update returns not found', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => 'not found',
    } as unknown as Response)

    await expect(
      updateTaskCalendarEvent(
        {
          connectionId: 'conn-123',
          taskId: 'task-456',
          providerEventId: 'missing-event',
          dueAt: new Date('2026-05-03T14:00:00Z'),
        },
        {
          fetch: fetchImpl,
          loadConnection: async () => ({
            provider: 'google',
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
            expiresAt: new Date('2026-05-03T15:00:00Z'),
          }),
          now: () => new Date('2026-05-03T13:00:00Z'),
        },
      ),
    ).rejects.toBeInstanceOf(CalendarEventNotFoundError)
  })
})
