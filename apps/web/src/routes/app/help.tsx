import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { BookOpen, Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { z } from 'zod'
import { HelpArticle, HelpTopicCard, SupportCallout } from '../../components/help-guidance'
import {
  HELP_CATEGORIES,
  HELP_TOPICS,
  getHelpTopic,
  getHelpTopicsByCategory,
  searchHelpTopics,
  type HelpCategory,
} from '../../lib/help-content'
import { cn } from '@phiguard/ui'
import { trackProductEvent } from '../../lib/product-analytics-browser'

const searchSchema = z.object({
  category: z
    .enum([
      'getting-started',
      'tasks',
      'checklists',
      'program',
      'reports',
      'settings',
      'support',
    ])
    .optional(),
  topic: z.string().optional(),
  q: z.string().optional(),
})

export const Route = createFileRoute('/app/help')({
  validateSearch: searchSchema,
  component: HelpCenterPage,
})

function HelpCenterPage() {
  const search = Route.useSearch()
  const navigate = useNavigate()
  const [query, setQuery] = useState(search.q ?? '')
  const lastTrackedSearchRef = useRef('')
  const selectedTopic = getHelpTopic(search.topic)

  useEffect(() => {
    setQuery(search.q ?? '')
  }, [search.q])

  const visibleTopics = useMemo(() => {
    const categoryTopics = getHelpTopicsByCategory(search.category as HelpCategory | undefined)
    return searchHelpTopics(query, categoryTopics)
  }, [query, search.category])

  useEffect(() => {
    if (!selectedTopic) return
    trackProductEvent('help_topic_opened', {
      route: '/app/help',
      category: selectedTopic.category,
      topic: selectedTopic.id,
    })
  }, [selectedTopic])

  useEffect(() => {
    const trimmedQuery = query.trim()
    if (trimmedQuery.length < 2) return

    const category = search.category ?? 'all'
    const searchKey = `${category}:${trimmedQuery.toLowerCase()}:${visibleTopics.length}`
    const timeout = window.setTimeout(() => {
      if (lastTrackedSearchRef.current === searchKey) return
      lastTrackedSearchRef.current = searchKey
      const status = visibleTopics.length > 0 ? 'results' : 'empty'
      trackProductEvent('help_search_performed', {
        route: '/app/help',
        category,
        status,
        count: visibleTopics.length,
      })
      if (visibleTopics.length === 0) {
        trackProductEvent('help_search_empty', {
          route: '/app/help',
          category,
          status,
        })
      }
    }, 600)

    return () => window.clearTimeout(timeout)
  }, [query, search.category, visibleTopics.length])

  function trackHelpCategorySelected(category: string) {
    trackProductEvent('help_category_selected', {
      route: '/app/help',
      category,
    })
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-xl border border-border-default bg-surface-0 p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
              Help Center
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-text-primary">
              Help guides for PHIGuard
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-text-secondary">
              Use these guides when a page is unclear. Each one tells you what to click,
              what happens next, and when to ask someone for help.
            </p>
          </div>
          <div className="rounded-lg bg-brand-50 p-4 text-sm leading-6 text-text-secondary lg:max-w-sm">
            <div className="flex items-center gap-2 font-semibold text-text-primary">
              <BookOpen className="h-4 w-4 text-brand-700" />
              Plain language
            </div>
            <p className="mt-2">
              These guides avoid jargon where possible. When a term matters,
              the steps explain what to do with it.
            </p>
          </div>
        </div>

        <label htmlFor="help-search" className="mt-6 block text-sm font-medium text-text-primary">
          Search help
        </label>
        <div className="relative mt-2 max-w-xl">
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
          />
          <input
            id="help-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder='Try "open PDF", "invite teammate", or "create task"'
            className="w-full rounded-md border border-border-default bg-surface-0 py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-600"
          />
        </div>
      </section>

      <div className="sm:hidden">
        <label htmlFor="help-category" className="sr-only">Help category</label>
        <select
          id="help-category"
          value={search.category ?? ''}
          onChange={(event) => {
            trackHelpCategorySelected(event.target.value || 'all')
            void navigate({
              to: '/app/help',
              search: {
                category: (event.target.value as typeof search.category) || undefined,
                topic: undefined,
                q: undefined,
              },
            })
          }}
          className="w-full rounded-md border border-border-default bg-surface-0 px-3 py-2 text-sm text-text-primary"
        >
          <option value="">All guides</option>
          {HELP_CATEGORIES.map((category) => (
            <option key={category.id} value={category.id}>{category.label}</option>
          ))}
        </select>
      </div>

      <nav aria-label="Help categories" className="hidden flex-wrap gap-2 sm:flex">
        <Link
          to="/app/help"
          search={{ category: undefined, topic: undefined, q: undefined }}
          onClick={() => trackHelpCategorySelected('all')}
          className={cn(
            'rounded-full border px-3 py-2 text-sm font-medium transition',
            !search.category
              ? 'border-brand-600 bg-brand-50 text-brand-700'
              : 'border-border-default bg-surface-0 text-text-secondary hover:bg-surface-50',
          )}
        >
          All guides
        </Link>
        {HELP_CATEGORIES.map((category) => (
          <Link
            key={category.id}
            to="/app/help"
            search={{ category: category.id, topic: undefined, q: undefined }}
            onClick={() => trackHelpCategorySelected(category.id)}
            className={cn(
              'rounded-full border px-3 py-2 text-sm font-medium transition',
              search.category === category.id
                ? 'border-brand-600 bg-brand-50 text-brand-700'
                : 'border-border-default bg-surface-0 text-text-secondary hover:bg-surface-50',
            )}
          >
            {category.label}
          </Link>
        ))}
      </nav>

      {selectedTopic ? (
        <HelpArticle topic={selectedTopic} />
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleTopics.map((topic) => (
              <HelpTopicCard key={topic.id} topic={topic} />
            ))}
          </section>

          {visibleTopics.length === 0 && (
            <section className="rounded-xl border border-border-default bg-surface-0 p-8 text-center shadow-sm">
              <h2 className="text-lg font-semibold text-text-primary">No guides matched that search</h2>
              <p className="mt-2 text-sm text-text-secondary">
                Try a simpler word such as task, checklist, PDF, billing, or invite.
              </p>
            </section>
          )}
        </>
      )}

      <SupportCallout />

      <section className="rounded-xl border border-border-default bg-surface-0 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text-primary">Start here</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {HELP_TOPICS.filter((topic) =>
            ['first-day', 'start-checklist', 'open-pdf-download'].includes(topic.id),
          ).map((topic) => (
            <Link
              key={topic.id}
              to="/app/help"
              search={{ topic: topic.id, category: topic.category, q: undefined }}
              className="rounded-lg border border-border-default p-4 text-sm font-medium text-text-primary hover:border-brand-300 hover:bg-brand-50"
            >
              {topic.title}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
