---
title: "Is AWS HIPAA Compliant for Healthcare Workloads"
vendor: "Amazon Web Services (AWS)"
seoTitle: "Is AWS HIPAA Compliant"
description: "What healthcare developers and organizations need to know about AWS HIPAA compliance — including how to sign the AWS Business Associate Addendum, which services are HIPAA-eligible, and what security controls must be in place."
metaDescription: "Is AWS HIPAA compliant AWS offers a BAA covering 150+ HIPAA-eligible services. Learn how to sign the AWS BAA and which services are covered before building..."
publishedAt: 2026-04-28
updatedAt: 2026-04-28
verificationDate: 2026-04-28
summary: "Amazon Web Services (AWS) requires a plan-and-use review, not a blanket HIPAA label. What healthcare developers and organizations need to know about AWS HIPAA compliance — including how to sign the AWS Business Associate Addendum, which services are HIPAA-eligible, and what security controls must be in place. Clinics should verify BAA availability, covered services, admin settings, retention, access controls, integrations, and whether staff can keep PHI out of."
keyTakeaways:
  - "AWS offers a free BAA (Business Associate Addendum) available to all customers through AWS Artifact in the console."
  - "More than 150 AWS services are HIPAA-eligible, but not all services qualify — always check the current HIPAA Eligible Services Reference."
  - "PHI must only reside on or be transmitted through HIPAA-eligible services — using non-eligible services with PHI creates exposure regardless of the BAA."
  - "Required security controls include encryption at rest and in transit, access logging, VPC isolation, and IAM least-privilege policies."
  - "The BAA covers AWS's infrastructure obligations; the clinic or developer remains responsible for application-level security and HIPAA compliance."
sources:
  - title: "HIPAA Compliance on AWS"
    url: "https://aws.amazon.com/compliance/hipaa-compliance/"
    publisher: "AWS"
  - title: "HIPAA Eligible Services Reference"
    url: "https://aws.amazon.com/compliance/hipaa-eligible-services-reference/"
    publisher: "AWS"
  - title: "Business Associates"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
faq:
  - q: "How do I sign the AWS HIPAA BAA?"
    a: "Sign in to the AWS console, navigate to AWS Artifact, and accept the AWS Business Associate Addendum. The process is self-service and available to all AWS customers. There is no additional cost. Retain documentation of when the BAA was executed."
  - q: "Can I use any AWS service for HIPAA workloads after signing the BAA?"
    a: "No. The BAA covers only HIPAA-eligible services. Using a non-eligible service — for example, storing PHI in an AWS service that is not on the eligible services list — creates a violation regardless of the BAA. Always check the current HIPAA Eligible Services Reference before architecting a healthcare workload."
  - q: "Is Amazon S3 HIPAA eligible?"
    a: "Amazon S3 is on AWS's HIPAA eligible services list. PHI stored in S3 must be encrypted at rest (using SSE-S3, SSE-KMS, or client-side encryption), with access logging enabled and bucket policies restricting access to authorized principals only."
  - q: "Does the AWS BAA cover my application's HIPAA compliance?"
    a: "No. The BAA covers AWS's infrastructure. Application-level security — authentication, authorization, audit logging within the application, and data handling practices — is the developer's responsibility. The AWS BAA is necessary but not sufficient for a HIPAA-compliant application."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-pm-tool-comparison-guide"
relatedCommercialPath: "/hipaa"
---

## Short answer

Is AWS HIPAA compliant for healthcare workloads Yes — with the right setup. AWS offers a Business Associate Addendum that covers more than 150 services, signed for free through AWS Artifact. The BAA alone is not sufficient: PHI must only touch HIPAA-eligible services, and the workload must implement appropriate security controls. Developers and healthcare organizations using AWS for PHI workloads need the BAA plus a compliant architecture.

## How to sign the AWS BAA

The AWS Business Associate Addendum is available through AWS Artifact, a self-service compliance portal in the AWS console:

1. Sign in to the AWS Management Console.
2. Navigate to **AWS Artifact** (search for it in the services menu).
3. Select **Agreements** and locate the AWS Business Associate Addendum.
4. Review the current terms and accept the agreement.
5. Document the date of acceptance in your compliance records.

There is no charge for the BAA. It applies to HIPAA-eligible services used across all AWS regions covered by the agreement. AWS updates the BAA periodically; review the current version and note when you accepted it.

## Which services are HIPAA eligible

AWS maintains a published list of HIPAA-eligible services. This list has grown substantially over time and now includes more than 150 services. Common services on the eligible list include:

- Amazon EC2 (compute)
- Amazon RDS (managed relational databases)
- Amazon S3 (object storage)
- Amazon DynamoDB (NoSQL database)
- Amazon Lambda (serverless compute)
- Amazon VPC (network isolation)
- Amazon CloudTrail (audit logging)
- Amazon CloudWatch (monitoring and logging)
- Amazon ECS and EKS (container orchestration)
- AWS KMS (encryption key management)

Services that are not on the HIPAA eligible list must not receive, store, or process PHI. This catches many teams off guard: a developer might use an experimental AWS service or a newer product that has not yet been reviewed and added to the eligible list. Check the current list at the AWS HIPAA Eligible Services Reference page before adding any service to a healthcare workload.

## Required security controls

Signing the BAA changes AWS's contractual obligations. Building a HIPAA-compliant workload requires implementing security controls at the application and infrastructure layer. These are not optional:

**Encryption at rest:**
All PHI stored in AWS services must be encrypted at rest. For S3, use server-side encryption with AWS KMS (SSE-KMS). For RDS, enable encryption at the database level (select during instance creation — it cannot be added after the fact without migration). For EBS volumes, enable encryption at creation.

**Encryption in transit:**
All data transmission must use TLS 1.2 or higher. Enforce HTTPS-only connections to application endpoints. Configure S3 bucket policies to deny HTTP requests. Disable outdated TLS versions on load balancers and API gateways.

**Access logging and audit trails:**
Enable AWS CloudTrail for all regions to log API activity. Enable S3 access logging for buckets containing PHI. Enable VPC Flow Logs for network traffic analysis. Retain logs for a period appropriate to your HIPAA retention obligations.

**IAM least privilege:**
Grant only the minimum permissions required for each role, service, or application component. Avoid wildcard permissions in IAM policies for PHI-bearing systems. Use IAM roles (not access keys where possible) for service-to-service authentication.

**VPC isolation:**
Run PHI workloads inside a VPC with appropriate subnet segmentation. Use security groups and network ACLs to restrict traffic. PHI-bearing databases should not be directly internet-accessible.

**Multi-factor authentication:**
Require MFA for all IAM users with console access, particularly those who can access PHI-bearing services or modify security configurations.

## The eligible services gap problem

The most common architectural mistake in AWS HIPAA workloads is inadvertently routing PHI through a non-eligible service. Common scenarios:

- Using a non-eligible AWS analytics service to process logs that contain PHI
- Sending application error messages that include PHI to a logging or monitoring service not on the eligible list
- Using a newer AWS AI/ML service (not yet eligible) to process documents that contain patient information
- Caching PHI in a non-eligible caching layer

Before deploying any new AWS service in a healthcare workload, check its current eligibility status. When in doubt, keep PHI out until eligibility is confirmed.

## What the BAA does not cover

The AWS BAA governs AWS's obligations as a business associate for the eligible services covered. It does not:

- Cover third-party services deployed on AWS (a SaaS product running on AWS has its own BAA obligations with you — the underlying AWS infrastructure BAA is between AWS and the SaaS provider, not between AWS and your clinic)
- Address application-level security practices
- Replace your clinic's or development organization's HIPAA compliance program
- Cover AWS services not on the HIPAA eligible services list

## Compliance operations for AWS-hosted healthcare workloads

The technical BAA and security controls are the infrastructure layer. The operational compliance program — risk assessments documenting the AWS architecture, workforce training for developers handling PHI, incident response procedures for infrastructure events, and ongoing vendor BAA tracking — is a separate discipline.
