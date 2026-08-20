import { createFileRoute, Link } from '@tanstack/react-router'
import { PLANS, getMinimumPlanForFeatures } from '@phiguard/billing'
import { Button, PhiguardLogo } from '@phiguard/ui'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

const advancedModules = [
  'Policies',
  'Training',
  'Vendor reviews',
  'Risk assessments',
]
const advancedModulesPlanName = PLANS[getMinimumPlanForFeatures(['multi_location_rollup'])].name

const landingCopy = {
  eyebrow: 'HIPAA operations for clinics',
  heading: 'Run recurring HIPAA work from one operations hub.',
  intro:
    'PHIGuard helps clinics turn compliance into assigned tasks, retained evidence, incident records, a signed BAA baseline, and an audit history that shows what changed and when.',
  essentials: [
    'Recurring HIPAA tasks that keep ownership visible',
    'Evidence, incidents, and audit records in one workspace',
    'Append-only audit history for compliance follow-through',
  ],
  audience:
    'Small clinics and healthcare teams that need a practical system for HIPAA follow-through, not another folder of stale documents.',
  sections: [
    {
      heading: 'How it works',
      body: 'Assign HIPAA tasks, attach proof, record incidents, and keep the operating record visible as the work happens.',
    },
    {
      heading: 'What stays on file',
      body: 'Evidence and audit events stay connected to the clinic work they support, making reviews faster to prepare.',
    },
    {
      heading: 'Advanced modules',
      body: `${advancedModulesPlanName}-plan teams can add ${advancedModules.join(', ')} for a broader compliance program.`,
    },
  ],
}

function LandingPage() {
  return (
    <main className="min-h-screen bg-surface-50 text-text-primary">
      <header className="border-b border-border-default bg-surface-0">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="inline-flex items-center gap-3 no-underline">
            <PhiguardLogo className="h-9" title="PHIGuard" />
          </Link>
          <Button asChild variant="outline" size="sm">
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-700">
            {landingCopy.eyebrow}
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl font-bold leading-tight text-text-primary sm:text-5xl lg:text-6xl">
            {landingCopy.heading}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-text-secondary">
            {landingCopy.intro}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/signup">Start free trial</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border-default bg-surface-0 p-6 shadow-sm">
          <p className="text-sm font-semibold text-text-secondary">What it solves</p>
          <ul className="mt-5 space-y-4">
            {landingCopy.essentials.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-brand-600" />
                <span className="text-base leading-7 text-text-primary">{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-xl bg-surface-50 p-4">
            <p className="text-sm font-semibold text-text-primary">For</p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {landingCopy.audience}
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-border-default bg-surface-0">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-12 md:grid-cols-3">
          {landingCopy.sections.map((section) => (
            <div key={section.heading}>
              <h2 className="text-base font-semibold text-text-primary">
                {section.heading}
              </h2>
              <p className="mt-3 text-sm leading-6 text-text-secondary">{section.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
