# ADR 0010 - ALB and WAF Association Provisioned

**Status:** Superseded by implementation
**Date:** 2026-04-18
**Updated:** 2026-05-20

Historical status: this ADR records the former legacy cloud provider ALB and regional WAF
deployment path. It is not the current production edge security model.
Production frontend and API traffic now terminates through the selected application runtime
with the application edge protections; wrangler deploy scripts and hosting provider runbooks
are authoritative for the live hosting surface.

## Context

PHIGuard's former legacy cloud provider web application deployment used ECS Fargate. Public HTTPS
traffic reached the service through an Application Load Balancer (ALB), and the
regional WAF Web ACL had to be associated with that ALB for managed rules and
rate limits to apply.

During the initial infrastructure bootstrap, the ALB and its WAF association were
deferred. That deferral is no longer current.

## Decision

The production infrastructure tooling stack now provisions the ALB through `modules/alb` and
associates `module.waf.web_acl_arn` with the ALB inside that module. The root
environment should not define a second `aws_wafv2_web_acl_association` for the ALB,
because duplicate associations create drift and apply failures.

The ALB module owns:

- `aws_lb`
- `aws_lb_listener` for HTTPS and HTTP redirect
- `aws_lb_target_group`
- `aws_wafv2_web_acl_association` for the regional WAF

`module.observability` currently receives the ALB ARN suffix from an
`aws_lb.main` tag lookup because the observability module is initialized before
the network and ALB modules for log-group dependencies. That lookup must resolve
to the same ALB owned by `modules/alb`; it is not a separate ALB owner.

## Security Impact

With the ALB module present, production traffic is covered by the managed rule sets
and rate-based rules defined in `modules/waf/main.tf`. WAF logging remains enabled
through the regional WAF log group.

The production stack is constrained to `us-east-1` so the ALB, regional WAF, WAF log
group, and CloudFront certificate/logging assumptions stay aligned.

## Follow-Up

Before changing the ALB/WAF ownership model, update this ADR and keep a single
infrastructure tooling owner for each WAF association.
