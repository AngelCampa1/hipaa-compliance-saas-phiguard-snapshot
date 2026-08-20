---
title: "Best HIPAA Compliant Analytics Tools for Healthcare Websites"
seoTitle: "Best HIPAA Analytics Tools"
category: "HIPAA Compliant Analytics Tools"
description: "GA4 has no BAA. Healthcare websites that track users in ways that reveal health conditions need privacy-first or BAA-backed analytics alternatives."
metaDescription: "Best HIPAA compliant analytics tools for healthcare. GA4 explained, privacy-first alternatives compared, and BAA availability reviewed."
publishedAt: 2026-04-28
updatedAt: 2026-04-28
verificationDate: 2026-04-28
summary: "Google Analytics 4 cannot be used on healthcare websites where URL parameters, page names, or user behavior could reveal a patient's health condition or treatment status. This review covers compliant alternatives and explains why the GA4 BAA question is more complicated than vendors acknowledge."
keyTakeaways:
  - "Google Analytics 4 does not offer a BAA and cannot be used for tracking that reveals health conditions or treatment status."
  - "URL parameters, page titles, and referral paths on healthcare sites can constitute PHI if they link a user to a health condition."
  - "Privacy-first analytics tools like Plausible and Fathom collect no personal identifiers — making the BAA question less relevant for many healthcare marketing use cases."
  - "PostHog is self-hostable and offers enterprise BAA coverage for product analytics on HIPAA-regulated applications."
  - "Microsoft Clarity does not offer a BAA and should not be deployed on pages or flows that could capture PHI."
rankedItems:
  - name: "Plausible Analytics"
    description: "Privacy-first, no personal identifiers collected. No BAA needed for anonymized traffic data. EU-hosted option available."
    url: "https://plausible.io"
  - name: "Fathom Analytics"
    description: "Privacy-first model similar to Plausible. No cookies, no personal data collection. Simpler alternative to GA4."
  - name: "PostHog"
    description: "BAA available on enterprise tier. Self-hostable for full data control. Product analytics for HIPAA-regulated applications."
  - name: "Mixpanel"
    description: "BAA available for qualifying healthcare customers. User-level event analytics with healthcare compliance tier."
  - name: "Microsoft Clarity"
    description: "No BAA available. Session replay and heatmap tool. Not appropriate for healthcare sites where user behavior could reveal PHI."
sources:
  - title: "Health Breach Notification Rule: The Basics for Business"
    url: "https://www.ftc.gov/business-guidance/resources/health-breach-notification-rule-basics-business"
    publisher: "FTC"
  - title: "Business Associates"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
faq:
  - q: "Can we use Google Analytics 4 on our healthcare website?"
    a: "GA4 does not offer a BAA. On a general marketing homepage with no patient-identifiable content, GA4 may not create a HIPAA obligation if no PHI enters the analytics pipeline. However, on pages where URL parameters, form fields, or page names could reveal a user's health condition — condition-specific landing pages, symptom checkers, appointment booking flows — GA4 creates HIPAA risk. Most healthcare legal advisors recommend against GA4 on any healthcare website."
  - q: "What makes a URL parameter PHI on a healthcare site?"
    a: "A URL parameter that identifies a specific individual in connection with a health condition is PHI. Example: a URL like /schedule?condition=diabetes&patientid=12345 is PHI. Even without a patient ID, /conditions/hiv-treatment seen alongside a user's IP address may be enough to constitute PHI under some interpretations. The more specific the health content, the greater the risk."
  - q: "Does Plausible Analytics require a BAA?"
    a: "Plausible collects no personal identifiers — no IP addresses, no user IDs, no cookies. For aggregate website traffic measurement on a healthcare marketing site, Plausible avoids the PHI question entirely. A BAA is not required when no PHI is collected. Confirm this fits your specific measurement needs before relying on it."
  - q: "Can we use session replay tools like Hotjar or Microsoft Clarity on our healthcare website?"
    a: "Session replay tools capture user behavior in detail — keystrokes, mouse movement, form interactions. On healthcare sites, these tools frequently capture PHI in form fields, URL parameters, and page content. Neither Hotjar nor Microsoft Clarity offers a BAA. Their use on healthcare websites is a high-risk compliance exposure."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
---

## The GA4 problem for healthcare websites

In 2023, the HHS Office for Civil Rights issued guidance clarifying that tracking technologies on healthcare websites can violate HIPAA when they collect and transmit PHI to third parties without patient authorization. Google Analytics, Meta Pixel, and similar tracking tools that send user behavior data to advertising platforms were specifically named as potential compliance risks.

Google Analytics 4 does not offer a BAA. That means any PHI that enters the GA4 data pipeline — user identifiers combined with health condition page visits, appointment booking event data, or URL parameters containing health information — is transmitted to Google's infrastructure without HIPAA coverage.

The challenge for healthcare marketers: most healthcare websites include pages where the URL path or page content is inherently health-specific. A condition information page (e.g., /services/diabetes-management) visited by a user whose identity Google can resolve through its advertising identifiers creates potential PHI exposure. Google's advertising systems are designed to connect users across sessions and devices — exactly the type of re-identification that HIPAA seeks to prevent.

The responsible path for healthcare practices: use analytics tools that either collect no personal identifiers (making PHI creation impossible) or use tools with BAA coverage. Avoid general-purpose advertising analytics on any page where health conditions are discussed.

## Our picks

### Plausible Analytics

BAA status: not required for anonymized, aggregate-only data collection.

Plausible is a privacy-first analytics platform that does not collect IP addresses, does not use cookies, and does not create user profiles. The data it collects is aggregate: total page visits, referral sources, geographic regions at country level, device types. No individual user identity is ever created.

For healthcare marketing sites that need basic traffic measurement — are our pages getting visitors, which channels drive the most traffic, which pages have the highest exit rates — Plausible answers those questions without creating PHI.

The EU-hosted option provides additional data sovereignty for practices that prefer non-US infrastructure for analytics data.

Plausible does not replace GA4 for conversion funnel analysis, user journey mapping, or advertising attribution. It is intentionally simpler. For practices where basic traffic data is sufficient, that simplicity is the feature.

Pricing is flat-rate per month based on page view volume. It is significantly less expensive than enterprise analytics alternatives.

Clinic fit: any healthcare practice that needs basic traffic measurement on a marketing website without creating PHI in the analytics pipeline.

### Fathom Analytics

BAA status: not required for anonymized, aggregate-only data collection.

Fathom operates on the same privacy-first model as Plausible: no cookies, no personal identifiers, no user profiles. It provides aggregate traffic data at the site and page level without identifying individual visitors.

Fathom's interface is clean and focused on the metrics most marketing teams actually use: total visitors, unique visitors, top pages, referral sources, and goal completions. Goal tracking works without individual user identification — conversions are counted in aggregate rather than attributed to specific users.

Fathom is GDPR compliant by design and does not require cookie consent banners in most jurisdictions. For healthcare practices that receive EU patient inquiries, this is a meaningful operational simplification.

Pricing is flat-rate per month based on page view volume, similar to Plausible.

Clinic fit: healthcare marketing sites that want a straightforward, privacy-safe GA4 alternative with goal tracking.

### PostHog

BAA status: available on enterprise tier. Self-hostable for full data control.

PostHog is a product analytics platform — more powerful than Plausible or Fathom, and more appropriate for product analytics inside a HIPAA-regulated application than for a marketing website.

Two deployment models are relevant for healthcare: the cloud-hosted enterprise tier with BAA coverage, and self-hosted deployment where the practice controls all infrastructure. Self-hosted PostHog keeps all analytics data on the practice's own servers — eliminating the business associate relationship with PostHog itself.

PostHog's feature set covers user-level event tracking, session replay, feature flags, and A/B testing. For a healthcare application where you need to understand how providers or patients use specific features, PostHog provides the analytical depth that privacy-first tools cannot.

Session replay within a HIPAA-regulated application requires careful configuration — PHI fields must be masked before session data is recorded.

Pricing for the enterprise cloud tier with BAA is custom-quoted. Self-hosted is open source and free, with costs limited to infrastructure.

Clinic fit: engineering teams building HIPAA-regulated healthcare applications who need product analytics with either self-hosted data control or BAA coverage.

### Mixpanel

BAA status: available for qualifying healthcare customers.

Mixpanel is a user-level event analytics platform. It tracks individual user journeys — from first visit through conversion and retention — with detailed funnel analysis and cohort segmentation. This level of individual user tracking creates PHI in healthcare contexts, which is why the BAA is a prerequisite.

Mixpanel's healthcare BAA tier covers the analytics data processed through their platform. The analytics capability is stronger than Plausible or Fathom — user journey analysis, cohort retention, and funnel conversion are meaningful insights for healthcare product teams.

For marketing analytics on a healthcare website where individual user identification is the goal, Mixpanel with a BAA is one of the few options that provides this capability compliantly.

Pricing for the healthcare BAA tier is higher than standard Mixpanel plans. Request healthcare pricing and BAA documentation simultaneously.

Clinic fit: healthcare product teams tracking patient or provider behavior within a HIPAA-regulated application.

### Microsoft Clarity — no BAA available

Microsoft Clarity is a free session replay and heatmap tool. It captures detailed user behavior including mouse movement, scrolling, and form interactions. It does not offer a BAA.

On a healthcare website, session replay tools capture PHI routinely: form fields where users enter health information, URL parameters that identify health conditions, and the content of pages describing specific conditions or treatments. Without a BAA, this data is transmitted to Microsoft's infrastructure without HIPAA coverage.

Microsoft Clarity should not be deployed on any healthcare website or application page where user behavior could capture or reveal PHI. That includes appointment booking pages, symptom checkers, condition-specific content pages, and any page behind an authenticated patient session.

## How to evaluate analytics tools for HIPAA compliance

**Map the data you collect against PHI definitions.** Does the tool create individual user profiles? Does it capture URL parameters? Does it record form field input? Each of these capabilities creates PHI risk on healthcare websites.

**Determine whether a BAA is required.** Analytics tools that collect no personal identifiers do not create PHI and do not require a BAA. Tools that create individual user profiles or capture health-specific user behavior require a BAA.

**Assess advertising integrations.** Many analytics tools include integrations with Google Ads, Meta Ads, or other advertising platforms. These integrations transmit user behavior data to advertising networks — creating PHI exposure even if the analytics tool itself is otherwise compliant.

**Review session replay capabilities.** If the analytics tool includes session replay — even as an optional feature — confirm whether it is enabled and whether PHI fields are masked.

**Audit existing analytics implementations.** If your practice has been using GA4, Meta Pixel, or other tracking tools on healthcare website pages, a compliance audit of the current implementation is appropriate before migrating to a compliant alternative.

## PHIGuard as your compliance operations layer

PHIGuard manages the compliance documentation for your analytics vendor decisions — tracking which tools are approved for use on your marketing site versus your patient-facing application, and assigning the periodic review task to confirm that analytics implementations remain compliant as tools and configurations change.

As the analytics landscape evolves — new tools, new advertising integrations, new regulatory guidance — PHIGuard is where your compliance decisions are recorded and reviewed.
