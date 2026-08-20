---
title: "Is WordPress HIPAA Compliant for Healthcare Websites"
vendor: "WordPress"
seoTitle: "Is WordPress HIPAA Compliant"
description: "What medical clinics need to know about WordPress and HIPAA compliance — the critical difference between WordPress.com and self-hosted WordPress, BAA availability, and when a clinic website creates PHI exposure."
metaDescription: "Is WordPress HIPAA compliant WordPress.com has no BAA. Self-hosted WordPress depends on your host. Learn what clinics must do before collecting patient..."
publishedAt: 2026-04-28
updatedAt: 2026-04-28
verificationDate: 2026-04-28
summary: "WordPress requires a plan-and-use review, not a blanket HIPAA label. Clinics should distinguish WordPress.com from self-hosted WordPress, confirm whether any BAA path exists for the chosen hosting and plugin stack, and avoid patient-facing data collection unless every PHI workflow is covered, configured, and documented."
keyTakeaways:
  - "WordPress.com (Automattic's hosted platform) does not offer a HIPAA BAA. Do not collect PHI through any WordPress.com feature."
  - "Self-hosted WordPress is software — compliance depends on the hosting provider, not on WordPress itself."
  - "Clinics using self-hosted WordPress must use a HIPAA-compliant host with a signed BAA if any PHI is collected."
  - "Standard contact forms, appointment request forms, and symptom inquiry forms on a clinic website can create PHI exposure if they collect patient health information."
  - "The form plugin (Contact Form 7, Gravity Forms, WPForms) is a separate compliance question from the hosting environment — both must be assessed."
sources:
  - title: "Privacy Policy"
    url: "https://automattic.com/privacy/"
    publisher: "Automattic"
  - title: "HIPAA Compliant WordPress Hosting"
    url: "https://wpengine.com/support/wp-engines-security-environment/"
    publisher: "WP Engine"
  - title: "Business Associates"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
faq:
  - q: "What is the difference between WordPress.com and self-hosted WordPress?"
    a: "WordPress.com is a hosted blogging and website service run by Automattic. You sign up, Automattic hosts everything, and you have no control over the underlying server. Self-hosted WordPress means you download the WordPress software from WordPress.org and install it on a server — either your own hardware or a hosting provider like WP Engine, Kinsta, or a clinic's own server. These are fundamentally different arrangements for compliance purposes."
  - q: "Does the hosting provider's HIPAA compliance cover WordPress plugins?"
    a: "A HIPAA-compliant host provides a BAA for the hosting infrastructure — the server, storage, network, and related services. It does not automatically extend coverage to third-party WordPress plugins that process form submissions or store data. Each plugin that handles PHI must be assessed independently. Some form plugins (Gravity Forms with appropriate configuration, Formidable Forms) may have their own compliance considerations."
  - q: "Can a clinic use a standard contact form on its website without a HIPAA BAA?"
    a: "A general contact form that collects only name and email for non-health-related inquiries is not collecting PHI. A form that asks about symptoms, medications, health conditions, appointment types, or any health-related information is collecting PHI at the point of submission and requires a HIPAA-covered form tool on a HIPAA-compliant host."
  - q: "What should a clinic look for in a HIPAA-compliant WordPress host?"
    a: "A signed BAA, encryption at rest and in transit, access controls, audit logging, and a clear statement of what services are covered under the BAA. Ask specifically whether the BAA covers managed database services, email handling, and any CDN or caching layers in the hosting stack."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-pm-tool-comparison-guide"
relatedCommercialPath: "/hipaa"
---

## Short answer

Is WordPress HIPAA compliant The answer depends entirely on which WordPress you mean. **WordPress.com** — the hosted service run by Automattic — does not offer a HIPAA BAA and cannot be used for any PHI-collecting functionality. **Self-hosted WordPress** — the open-source software installed on a server — is just software. HIPAA compliance for a self-hosted WordPress site depends on the hosting provider and its BAA, not on WordPress itself.

This distinction trips up many small clinics. Understanding it is the first step toward making a compliant decision.

## WordPress.com: no BAA, no HIPAA coverage

WordPress.com is the consumer and business hosting platform run by Automattic. It is a convenient all-in-one website solution — Automattic provides the hosting, the software, the CDN, the email handling, and the database. This is the platform many small clinic websites land on.

Automattic does not offer a HIPAA BAA for WordPress.com accounts. No plan — not Personal, Business, or Commerce — provides HIPAA compliance. If a clinic website runs on WordPress.com and collects any PHI through a contact form, appointment request form, symptom checker, or any other feature, that data is being processed by a system with no HIPAA contractual protection.

This is a clear, documented limitation. Automattic's privacy policy governs how your data is handled — and it is not a Business Associate Agreement.

## Self-hosted WordPress: the right question is your host

Self-hosted WordPress (the software distributed at WordPress.org) is installed on a server. The server is managed by either the clinic's own IT team or a hosting provider. WordPress itself is open-source software — it has no data processing obligations, no BAA to offer, and no HIPAA compliance in any direct sense.

The HIPAA compliance question for a self-hosted WordPress site is: **who hosts the server, and do they offer a BAA**

If the hosting provider offers a HIPAA BAA and the clinic has executed that agreement, then the hosting infrastructure is covered. From there, the clinic must ensure that:

- The specific services covered under the BAA match how the site operates (database, backups, email handling, CDN, object storage)
- The form tools used to collect patient data also meet HIPAA requirements
- Access controls to the WordPress admin panel are appropriate
- Audit logging is enabled at the server and application level

**WP Engine's healthcare tier** is one example of a managed WordPress hosting provider that offers a HIPAA BAA for qualifying accounts. Other managed WordPress hosts may also offer healthcare compliance options — verify with each provider before committing.

## When a clinic website creates PHI exposure

Not every clinic website collects PHI. A site that lists services, provides contact information, posts blog content, and displays staff profiles is not collecting patient health information.

PHI enters the picture through forms and interactive features:

**Appointment request forms.** A form that asks for the patient's name, phone number, preferred appointment time, and the reason for the visit collects PHI at the point of submission. "Reason for visit" combined with patient identity is health information.

**Symptom or condition questionnaires.** Any form that asks patients to describe their symptoms, current medications, or health history is collecting clinical health information — PHI by definition.

**Insurance verification forms.** Collecting insurance carrier, member ID, and subscriber information from a named patient is collecting payment-for-healthcare information — a category of PHI.

**Prescription refill requests.** A form that asks patients to request medication refills by name, medication, and dosage collects PHI.

**Patient portal login pages.** If the WordPress site serves as a front door to a patient portal, login credentials combined with the portal's health data create a PHI-handling relationship with the web server.

General contact forms ("Name / Email / Message" with no health context) are lower risk, but should still be evaluated based on the types of messages patients are likely to submit.

## The form plugin problem

Even on a HIPAA-compliant host, the form plugin used on a WordPress site is a separate compliance consideration.

Popular WordPress form plugins include Contact Form 7, Gravity Forms, WPForms, Ninja Forms, and Formidable Forms. These plugins handle the submission processing — they receive the form data, store it in the WordPress database, and often email it to a staff member.

The email component is particularly problematic: form plugins that email submissions to clinic staff are sending PHI through a standard email system, which may not be encrypted in transit or stored securely at the receiving end.

For PHI-collecting forms on a HIPAA-compliant WordPress host:

- Use a form plugin that stores submissions only within the WordPress database (on the compliant host) rather than emailing them
- If email notification is required, use a HIPAA-compliant email service for that notification
- Consider a dedicated HIPAA-compliant form service (like Formstack Workspace) embedded in the WordPress site rather than a standard WordPress form plugin

## What a compliant WordPress healthcare site requires

For clinics committed to self-hosted WordPress with PHI-collecting features:

1. A HIPAA-compliant managed WordPress hosting provider with a signed BAA covering hosting, database, and backups
2. Form tools that are either HIPAA-covered directly or configured to route PHI only through covered services
3. HTTPS enforced across the entire site (no HTTP mixed content)
4. Access controls on the WordPress admin panel: unique credentials per admin user, multi-factor authentication, user roles scoped to least privilege
5. Regular security updates applied to WordPress core, themes, and plugins (vulnerabilities in WordPress plugins are a significant attack surface)
6. Audit logging at the server and application level with appropriate retention

## PHIGuard and the clinic's internal compliance operations
