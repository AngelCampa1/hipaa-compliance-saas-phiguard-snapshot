# ADR 0011: ECS Task Definition Lifecycle: Ignore Changes After Initial Deploy

**Status:** Accepted  
**Date:** 2026-04-18

## Context

The ECS task definitions for the web service (`aws_ecs_task_definition.web`) and the nightly audit export (`aws_ecs_task_definition.audit_export`) use:

```hcl
lifecycle {
  ignore_changes = [task_definition, desired_count]
}
```

This means Terraform does not manage the active task definition revision after initial creation. Container image updates and `desired_count` changes were owned by the former deployment pipeline, not by `terraform apply`.

## Decision

This ADR documents the former AWS ECS deployment path and is no longer the authoritative deploy model. Wrangler scripts are now the authoritative deployment path for Cloudflare Worker updates. The former container deployment pipeline:

1. Builds and pushes a new Docker image to ECR.
2. Registers a new ECS task definition revision with the updated image digest.
3. Calls `aws ecs update-service` to deploy the new revision.

`terraform apply` provisions the initial task definition and ECS service configuration (CPU, memory, IAM roles, log groups, VPC networking). It is **not** the deployment mechanism for application code.

Without `ignore_changes`, every `terraform apply` would overwrite the currently deployed task definition revision with the one in Terraform state (which references a static `var.container_image`), causing unintended rollbacks.

## Consequences

- Terraform state for `task_definition` and `desired_count` will drift from actual AWS state after each CI deployment. This is expected and intentional.
- Infrastructure changes (CPU/memory, IAM policy additions, new environment variables) still require a Terraform apply followed by a CI deploy to take effect.
- `terraform plan` will show no diff for the ignored attributes, masking any drift in those fields.

## Alternatives Considered

- **Terraform manages deployments**: Would require encoding the image tag in Terraform variables and running `terraform apply` for every deploy. This couples infra and app deployment, slowing down CI and adding Terraform state locking contention.
- **Separate task definition module with `create_before_destroy`**: More complex; benefits are marginal given the ECS service rollback mechanism already handles blue/green at the task level.
