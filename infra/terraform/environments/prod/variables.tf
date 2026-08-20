variable "database_url_placeholder" {
  description = "Initial DATABASE_URL secret string. Terraform creates the secret with this value; rotate immediately via Secrets Manager console. Provide via TF_VAR_database_url_placeholder in CI."
  type        = string
  sensitive   = true

  validation {
    condition     = !strcontains(lower(var.database_url_placeholder), "replace_me")
    error_message = "database_url_placeholder must be set to a real bootstrap value before applying prod."
  }
}

variable "better_auth_secret_placeholder" {
  description = "Initial BETTER_AUTH_SECRET (32-byte hex). Rotate immediately after first deploy. Provide via TF_VAR_better_auth_secret_placeholder in CI."
  type        = string
  sensitive   = true

  validation {
    condition     = can(regex("^[0-9a-fA-F]{64}$", var.better_auth_secret_placeholder))
    error_message = "better_auth_secret_placeholder must be a 32-byte hex string."
  }
}

variable "better_auth_url_placeholder" {
  description = "Initial BETTER_AUTH_URL (for example, https://my.phiguard.app). Provide via TF_VAR_better_auth_url_placeholder in CI."
  type        = string
  sensitive   = true

  validation {
    condition     = startswith(var.better_auth_url_placeholder, "https://")
    error_message = "better_auth_url_placeholder must be an https:// URL."
  }
}

variable "resend_api_key_placeholder" {
  description = "Initial RESEND_API_KEY. Rotate immediately after first deploy. Provide via TF_VAR_resend_api_key_placeholder in CI."
  type        = string
  sensitive   = true

  validation {
    condition = (
      !strcontains(lower(var.resend_api_key_placeholder), "replace_me") &&
      !strcontains(lower(var.resend_api_key_placeholder), "re_placeholder")
    )
    error_message = "resend_api_key_placeholder must be set to a real bootstrap value before applying prod."
  }
}

variable "resend_webhook_secret_placeholder" {
  description = "Initial RESEND_WEBHOOK_SECRET (Svix signing secret). Provide via TF_VAR_resend_webhook_secret_placeholder in CI."
  type        = string
  sensitive   = true

  validation {
    condition     = !strcontains(lower(var.resend_webhook_secret_placeholder), "replace_me")
    error_message = "resend_webhook_secret_placeholder must be set to a real Svix signing secret before applying prod."
  }
}

variable "r2_access_key_id_placeholder" {
  description = "Initial R2_ACCESS_KEY_ID for lead magnet downloads. Provide via TF_VAR_r2_access_key_id_placeholder in CI."
  type        = string
  sensitive   = true

  validation {
    condition     = !strcontains(lower(var.r2_access_key_id_placeholder), "replace_me")
    error_message = "r2_access_key_id_placeholder must be set to a real R2 access key before applying prod."
  }
}

variable "r2_secret_access_key_placeholder" {
  description = "Initial R2_SECRET_ACCESS_KEY for lead magnet downloads. Provide via TF_VAR_r2_secret_access_key_placeholder in CI."
  type        = string
  sensitive   = true

  validation {
    condition     = !strcontains(lower(var.r2_secret_access_key_placeholder), "replace_me")
    error_message = "r2_secret_access_key_placeholder must be set to a real R2 secret access key before applying prod."
  }
}

variable "environment" {
  description = "Deployment environment name"
  type        = string
  default     = "prod"
}

variable "project_name" {
  description = "Project name used as a prefix for all resource names"
  type        = string
  default     = "phiguard"
}

variable "aws_region" {
  description = "AWS region for all resources (CloudFront ACM cert must be us-east-1 — handled separately)"
  type        = string
  default     = "us-east-1"

  validation {
    condition     = var.aws_region == "us-east-1"
    error_message = "The prod Terraform stack must run in us-east-1 so CloudFront WAF logging, CloudFront ACM, and regional WAF log groups stay aligned."
  }
}

variable "rds_instance_class" {
  description = "RDS instance class for the Postgres database"
  type        = string
  default     = "db.t3.medium"
}

variable "rds_db_password" {
  description = "Master password for the RDS instance — provide via TF_VAR_rds_db_password environment variable in CI"
  type        = string
  sensitive   = true
}

variable "ecs_desired_count" {
  description = "Desired number of ECS task replicas"
  type        = number
  default     = 2
}

variable "acm_certificate_arn" {
  description = "ARN of the ACM TLS certificate for phiguard.app (must be in us-east-1 for CloudFront)"
  type        = string
}

variable "acm_app_certificate_arn" {
  description = "ARN of the ACM TLS certificate for app.phiguard.app (used by the ALB; must be in the same region as the ALB)"
  type        = string
}

variable "route53_zone_id" {
  description = "Route53 hosted zone ID for the phiguard.app domain"
  type        = string
}

variable "sns_alert_email" {
  description = "Email address to receive security alarm notifications (optional)"
  type        = string
  default     = ""
}

variable "cloudflare_account_id" {
  description = "Cloudflare account ID for R2 bucket provisioning — provide via TF_VAR_cloudflare_account_id in CI"
  type        = string
  sensitive   = true
}
