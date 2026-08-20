# PHIGuard LinkedIn Editorial Brief

This package is prepared content only. Do not call Postiz, schedule posts, upload media, or touch any live queue while drafting or reviewing.

## Package Scope

- Date range: 2026-05-27 through 2026-06-14 inclusive.
- Cadence: 15 posts per day for 19 days.
- Total: 285 manually written posts.
- CSV schema: `date,suggested_time_cst,post_number,pillar,source_url_or_repo_path,post_text,cta_type,review_status,notes`.
- Do not create posts from a generator or batch-templated text.

## Audience

Write for practice administrators, office managers, privacy officers, compliance leads, and owners at small medical clinics with roughly 3-50 staff. They are busy, budget-aware, and often responsible for HIPAA operations without a full compliance department.

The reader should feel like the post understands the practical clinic problem: someone must assign the work, document the decision, prove follow-through, and keep PHI out of the wrong tools.

## Product Positioning

PHIGuard is HIPAA-native task management and compliance operations software for small clinics. The core contrast is not generic project management. It is clinic compliance work with BAA details checked against source material, PHI-aware task handling, append-only audit history, vendor tracking, training records, incident work, policy review, risk work, and pricing details from PHIGuard source material.

Current repo-supported positioning:

- PHIGuard is built for small clinic HIPAA operations.
- BAA coverage is included on every public plan.
- Pricing is per clinic, not per seat.
- Public plans include recurring HIPAA task management, compliance starter checklists, immutable audit trail, incident tracking, and Business Associate Agreement coverage.
- Group positioning includes policies, training, risk assessments, vendor BAA tracking, multi-location reporting, SOC 2 evidence, and access review workflows.
- Security claims must stay conservative: HTTPS/TLS in transit, managed encryption at rest, role-based access patterns, append-only audit behavior, and authenticated app routes separated from public-site marketing analytics.

Use product-thesis language such as "built for," "designed to," "positioned around," and "the operating model is" instead of customer-results language.

## Hard Constraints

Do not:

- Claim PHIGuard makes a clinic HIPAA compliant.
- Say "HIPAA-compliant" as a certification or promise about PHIGuard.
- Say "certified HIPAA compliant."
- Invent clients, customers, testimonials, case studies, revenue, waitlist size, adoption, usage, or outcomes.
- Give legal advice.
- Invent PHI-like details, patient stories, realistic names, case details, dates of service, diagnoses, lab results, appointment details, or billing scenarios.
- Make unsupported competitor claims or current pricing claims unless a source path supports the statement and the wording is cautious.
- Imply a BAA alone makes a workflow safe.
- Use generic SaaS phrases such as streamline, unlock, transform, optimize, seamless, game-changing, revolutionary, powerful platform, supercharge, or workflow magic.

## Voice

Practical, calm, precise, human.

Use healthcare operations language when it earns its place: BAA, PHI, audit trail, covered entity, business associate, access review, training record, risk analysis, incident response, policy acknowledgement, evidence, retention, vendor inventory.

The best posts should sound like a sharp operator explaining what actually goes wrong in clinics and how to make the work provable.

## Post Shape

Each post must stand alone on LinkedIn and should usually be 800-1,800 characters.

Every post needs:

- A distinct hook.
- One clear argument.
- A useful operational takeaway.
- A traceable repo source path or PHIGuard URL.
- A CTA type: `discussion`, `checklist`, `soft_product`, `resource_link`, or `none`.
- A review status: `approved`, `needs_review`, or `rejected_rewritten`.

Use paragraph breaks. Avoid hashtags unless there is a specific reason. No emojis.

## Pillars

Each 15-post day should cover all seven pillars, with no pillar used fewer than two times:

- HIPAA basics
- PHI-safe task management
- BAA/vendor management
- Risk analysis and audit readiness
- Workforce training and access control
- Incident response
- Generic tool alternatives/comparisons

## Source Hierarchy

Prefer source material in this order:

1. `apps/marketing/src/content/resources/` for checklists, templates, trackers, and operational lead magnets.
2. `apps/marketing/src/content/learn/` for HIPAA operations education.
3. `apps/marketing/src/content/alternatives/` and `apps/marketing/src/content/comparisons/` for generic-tool and vendor-positioning posts.
4. `apps/marketing/src/content/practice-types/` for specialty-specific clinic angles.
5. `apps/marketing/src/content/guides/` and `apps/marketing/src/content/best/` for tool evaluation posts.
6. `packages/knowledge/src/marketing.ts`, `packages/knowledge/src/legal-trust.ts`, `packages/billing/src/plans.ts`, and `packages/brand/src/identity.ts` for product, pricing, trust, and brand claims.
7. `docs/marketing/seo-strategy.md` for cluster priorities and positioning.

## Performance-Informed Direction

Use `analytics/performance-summary.md`, `analytics/top-posts.csv`, and `analytics/daily-metrics.csv` before drafting. The export is useful for direction, not proof. Engagement was scarce: 7,046 organic impressions, 9 clicks, 19 reactions, 4 comments, 0 reposts, and 32 total engagement actions in the page metrics window. Do not turn these signals into traction, audience-demand, conversion, or product-outcome claims.

- Strongest prior pillars: patient rights/process gaps, workforce offboarding and access review, incident response, risk/audit follow-through, generic-tool limitations, vendor/subprocessor review, shared logins, and end-of-day routines.
- Weakest prior pillars: no pillar is proven weak from this data. Reduce only broad, abstract HIPAA education and sales-led product framing unless the post has a concrete operating task.
- Hooks to reuse as patterns, not templates: challenge a common shortcut, name the missing record, turn routine clinic work into a compliance operating question, and contrast "useful tool" with "not enough evidence/control." Examples to learn from, not copy: patient rights complaints start with process gaps; offboarding is a PHI-risk handoff; end-of-day close is a HIPAA routine; incidents should not close before the policy question; shared logins are not a shortcut.
- Hooks to avoid: broad "HIPAA is complicated" intros, generic fear framing, "complete HIPAA compliance" language, fake urgency, hard product pitches, and exact repeats of prior winning openings.
- Best CTA types: `checklist`, `resource_link`, and `discussion` for posts that give a concrete review step, template, tracker, or operational question.
- CTA types to reduce: consecutive `soft_product` CTAs and vague discussion prompts. Use `soft_product` only when PHIGuard naturally maps to the operating record, such as audit history, access reviews, vendor tracking, incident work, or PHI-aware task handling.
- Best-performing source clusters: resources/templates, learn/compliance operations, alternatives/comparisons, practice-type pages, and vendor/tool evaluation content.
- Underused source clusters: practice-type and vendor/subprocessor material should carry more of the first three days, especially when it can stay generic and non-PHI. Use state/city pages sparingly.
- Best time windows: the analytics do not prove exact posting-hour winners. Keep the existing spread across early morning, business hours, afternoon, and evening Central time. Put the sharpest operational-correction posts in business-hour and late-afternoon slots for the next measurement pass.
- Time windows to avoid: none proven. Do not remove a slot based on this export alone.
- Character length guidance: keep most posts at 800-1,500 characters. Use shorter posts for sharp corrections and longer posts only when the source supports a checklist or step-by-step operating record.
- Comment/reply themes worth expanding: shared logins, generic work-management tools, cleaning crew/vendor access, end-of-day routines, dermatology vendor review, incident response, old BAAs, and AI/vendor questions.
- Product mentions that performed well: no product-mention performance is strong enough to claim a winner. Product mentions should stay operational and tied to PHI-aware records, append-only audit history, access review, incident tracking, vendor BAA tracking, or training evidence.
- Product mentions that felt too sales-heavy: avoid leading with PHIGuard unless the post is clearly about the operating model. Do not imply PHIGuard makes a clinic compliant, certified, breach-proof, audit-proof, or legally protected.
- Repetition risks from the prior package: repeating the exact "not a shortcut," "not a control," "starts with," or "should not close before" structures too often; overusing generic-tool comparison posts without new operational detail; returning to patient rights or offboarding without changing role, record, or next step.
- Safety issues found in prior performance review: none flagged as negative or legally risky by the analytics worker, but safety constraints still control drafting: no fake proof, no PHIGuard compliance/certification claims, no legal advice, no PHI-like invented details, no unsupported competitor claims, and no implication that a BAA alone makes a workflow safe.

Days 1-3 drafting direction:

- Day 1: prioritize patient rights/process gaps, offboarding/access review, end-of-day routine, incident closure, shared logins, and one generic-tool limitation post. Make the first-line hooks specific operational corrections, not broad HIPAA lessons.
- Day 2: expand generic-tool limits and vendor/subprocessor review. Cover useful-but-incomplete project tools, old BAAs, AI/vendor questions, cleaning crew or facility access, vendor inventory fields, and why signed paperwork still needs workflow review.
- Day 3: repeat the winning topic families through different clinic roles and records: office manager, privacy officer, practice administrator, owner, security officer, billing lead, and front desk manager. Change the concrete record or next step each time so the day does not feel templated.

Preserve the prior manual package's quality bar. The analytics should guide topic selection and hook style, not justify repetitive drafting or stronger claims.

## Approval Checklist

Before a post is marked `approved`, confirm:

- The claim is traceable to the source path or public PHIGuard URL.
- The hook is not repeated in the same day or across nearby days.
- The post does not read like a template.
- The reader learns a practical operating move.
- The language is not legal advice.
- The post contains no PHI or patient-specific invented scenario.
- The post avoids fake proof, exaggerated promises, unsupported competitor claims, and unsupported current pricing claims.
- The CTA fits the argument.
