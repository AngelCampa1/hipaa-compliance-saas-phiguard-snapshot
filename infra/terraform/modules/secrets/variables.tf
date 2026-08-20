variable "environment" {
  description = "Deployment environment name (e.g. prod, staging)"
  type        = string
}

variable "project_name" {
  description = "Project name used as a prefix for resource names and tags"
  type        = string
}

variable "kms_key_arn" {
  description = "ARN of the KMS CMK used to encrypt secrets at rest"
  type        = string
}

variable "database_url_placeholder" {
  description = "Initial DATABASE_URL secret string. Terraform creates the secret with this value; rotate immediately via Secrets Manager console. Provide via TF_VAR_database_url_placeholder in CI."
  type        = string
  sensitive   = true
}

variable "better_auth_secret_placeholder" {
  description = "Initial BETTER_AUTH_SECRET (32-byte hex). Rotate immediately after first deploy. Provide via TF_VAR_better_auth_secret_placeholder in CI."
  type        = string
  sensitive   = true
}

variable "better_auth_url_placeholder" {
  description = "Initial BETTER_AUTH_URL (e.g. https://my.phiguard.app). Provide via TF_VAR_better_auth_url_placeholder in CI."
  type        = string
  sensitive   = true
}

variable "resend_api_key_placeholder" {
  description = "Initial RESEND_API_KEY. Rotate immediately after first deploy. Provide via TF_VAR_resend_api_key_placeholder in CI."
  type        = string
  sensitive   = true
}

variable "resend_webhook_secret_placeholder" {
  description = "Placeholder RESEND_WEBHOOK_SECRET (Svix signing secret). Replace via Secrets Manager console after initial deploy."
  type        = string
  sensitive   = true
  default     = "REPLACE_ME_resend_webhook_secret"
}

variable "s3_bucket_attachments_placeholder" {
  description = "Placeholder S3_BUCKET_ATTACHMENTS name. Populated from S3 module output in main.tf."
  type        = string
  sensitive   = false
  default     = "REPLACE_ME_attachments_bucket_name"
}

# ---------------------------------------------------------------------------
# R2 lead-magnets credentials
#
# R2 access keys are NOT derivable from the Cloudflare API token created by
# the r2-lead-magnets module. Production callers must pass real values through
# environment-level variables; placeholder defaults are only for module wiring
# in non-production scaffolding.
# ---------------------------------------------------------------------------

variable "r2_access_key_id_placeholder" {
  description = "Initial R2_ACCESS_KEY_ID. Production environments must pass a real Cloudflare R2 access key."
  type        = string
  sensitive   = true
  default     = "REPLACE_ME_r2_access_key_id"
}

variable "r2_secret_access_key_placeholder" {
  description = "Initial R2_SECRET_ACCESS_KEY. Production environments must pass a real Cloudflare R2 secret access key."
  type        = string
  sensitive   = true
  default     = "REPLACE_ME_r2_secret_access_key"
}

variable "r2_endpoint_placeholder" {
  description = "R2 S3-compatible endpoint (https://<account_id>.r2.cloudflarestorage.com). Populated from the r2_lead_magnets module output in main.tf."
  type        = string
  sensitive   = false
  default     = "REPLACE_ME_r2_endpoint"
}

variable "r2_lead_magnets_bucket_placeholder" {
  description = "R2 bucket name holding lead-magnet PDFs. Populated from the r2_lead_magnets module output in main.tf."
  type        = string
  sensitive   = false
  default     = "REPLACE_ME_r2_lead_magnets_bucket"
}
