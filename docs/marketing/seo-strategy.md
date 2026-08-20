# PHIGuard SEO Strategy

Last updated: 2026-04-20
Owner: Marketing

## Positioning

phiguard.app competes on one axis: **HIPAA-native** task management for small clinics (3-50 staff), with BAA and pricing-model claims pulled from `packages/knowledge/src/commercial.ts`. Every SEO target should reinforce that positioning. We are not trying to rank for generic project management queries. We are trying to own the intersection of "HIPAA" + "task / compliance / practice management."

## Priority Clusters

Three clusters, sequenced by intent and ROI.

### Cluster 1 - HIPAA-compliant alternatives (highest commercial intent)

Users typing these are evaluating their current tool and looking for something that fixes a specific HIPAA gap. Commercial intent is near-purchase.

URL pattern: `/alternatives/[competitor]-alternative`

| Keyword | Intent | Difficulty | Mapped URL |
|---|---|---|---|
| HIPAA compliant alternative to Asana | Commercial | Medium | /alternatives/asana-alternative |
| HIPAA compliant alternative to Monday.com | Commercial | Medium | /alternatives/monday-alternative |
| HIPAA compliant alternative to ClickUp | Commercial | Medium | /alternatives/clickup-alternative |
| HIPAA compliant alternative to Trello | Commercial | Low | /alternatives/trello-alternative |
| HIPAA compliant alternative to Notion | Commercial | Medium | /alternatives/notion-alternative |
| HIPAA compliant alternative to Smartsheet | Commercial | Low | /alternatives/smartsheet-alternative |
| HIPAA compliant alternative to Wrike | Commercial | Low | /alternatives/wrike-alternative |
| HIPAA compliant alternative to Jira | Commercial | Low | /alternatives/jira-alternative |
| HIPAA compliant alternative to Basecamp | Commercial | Low | /alternatives/basecamp-alternative |
| HIPAA compliant alternative to Airtable | Commercial | Medium | /alternatives/airtable-alternative |
| HIPAA compliant alternative to Todoist | Commercial | Low | /alternatives/todoist-alternative |
| HIPAA compliant alternative to Microsoft Planner | Commercial | Low | /alternatives/microsoft-planner-alternative |

### Cluster 2 - Practice-type vertical pages (qualified organic)

Users typing these self-identify by practice type. Conversion intent is strong: they are looking for a tool that fits their specialty.

URL pattern: `/practice-types/[practice]`

| Keyword | Intent | Difficulty | Mapped URL |
|---|---|---|---|
| HIPAA task management for dental practice | Commercial | Low | /practice-types/dental-practice |
| HIPAA task management for primary care | Commercial | Low | /practice-types/primary-care |
| HIPAA task management for pediatric practice | Commercial | Low | /practice-types/pediatric-practice |
| HIPAA task management for OB/GYN | Commercial | Low | /practice-types/obgyn-practice |
| HIPAA task management for dermatology | Commercial | Low | /practice-types/dermatology-practice |
| HIPAA task management for cardiology | Commercial | Low | /practice-types/cardiology-practice |
| HIPAA task management for orthopedic practice | Commercial | Low | /practice-types/orthopedics-practice |
| HIPAA task management for therapy / mental health | Commercial | Medium | /practice-types/mental-health-practice |
| HIPAA task management for chiropractic | Commercial | Low | /practice-types/chiropractic-practice |
| HIPAA task management for physical therapy | Commercial | Low | /practice-types/physical-therapy-practice |

### Cluster 3 - HIPAA compliance ops (informational / top-of-funnel)

Users typing these are building a compliance program. Lower commercial intent but significant volume and strong authority-building value. Lead magnets and nurture capture conversion here.

| Keyword | Intent | Difficulty | Mapped URL |
|---|---|---|---|
| HIPAA compliance checklist | Informational | High | /resources/new-hire-checklist + listicle |
| HIPAA risk analysis template | Informational | Medium | /resources/risk-analysis-template |
| BAA template | Informational | Medium | /resources/baa-template |
| HIPAA breach decision tree | Informational | Low | /resources/breach-decision-tree |
| HIPAA incident response plan | Informational | Medium | /resources/incident-response-plan |
| Vendor BAA tracker | Informational | Low | /resources/vendor-baa-tracker |
| HIPAA compliance software comparison | Commercial | Medium | /compare/hipaa-compliance-software |
| HIPAA task management guide | Informational | Low | /guides/hipaa-task-management |

## Cannibalization Check

- `/hipaa` (feature page) vs `/guides/hipaa-task-management` vs `/resources/*` - separate keyword intents (brand feature / educational / lead magnet), safe to keep all three.
- `/compare` (hub) vs `/alternatives/*` - hub targets "HIPAA compliance software comparison"; alternatives pages target branded "X alternative" queries. No cannibalization.
- `/pricing` is the only commercial landing page for `hipaa task management pricing` - primary keyword target.

## Publishing Cadence

Target 4 new content pieces per month, distributed across clusters:
- 2 alternatives pages (Cluster 1)
- 1 practice-type page (Cluster 2)
- 1 resource or guide (Cluster 3)

After first 6 months, shift weight toward long-form guides and comparison content as programmatic coverage saturates.

## Measurement

- **Primary**: organic clicks per cluster (GSC), conversions from organic (PostHog).
- **Secondary**: impressions per cluster, average rank for top 10 mapped keywords, indexed page count.
- **Cadence**: monthly review. Flag any page with impressions and zero clicks for 60+ days as a rewrite candidate.

## OG Images

Per-cluster OG images live in `apps/marketing/public/og/` and are generated by `pnpm --filter @phiguard/marketing gen:og` (satori + resvg). Templates reference them via `ogImage="https://phiguard.app/og/{cluster}.png"`. Clusters wired today: `default`, `alternatives`, `practice-types`, `comparisons`, `resources`. Edit `scripts/generate-og-images.mjs` and re-run the script to update copy.

## Image Optimization (astro:assets)

When adding imagery to long-form guides, import via `astro:assets` to get responsive `<picture>` + WebP automatically:

```astro
---
import { Image } from 'astro:assets'
import hero from '../../assets/guides/hipaa-task-management/hero.png'
---
<Image src={hero} alt="HIPAA task routing flow" widths={[480, 960, 1440]} />
```

Design assets go under `src/assets/<cluster>/<slug>/` (not `public/`, so Astro can process them). Alt text: one sentence, descriptive, no keyword stuffing. No image files committed yet - add per guide as they land.

## Out of Scope (for now)

- Paid SEO tools (Ahrefs/Semrush) - revisit after 6 months of baseline.
- Link building campaigns - focus on content depth first.
- Programmatic geo pages (`/locations/*`) - deferred. Practice type is a stronger vertical than city.
- AI SEO / AEO optimization - revisit after core content is published; JSON-LD coverage already strong.
