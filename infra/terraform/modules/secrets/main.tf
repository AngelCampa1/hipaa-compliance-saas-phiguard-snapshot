# ---------------------------------------------------------------------------
# Secrets Manager — PHIGuard Application Secrets
#
# IMPORTANT: Initial secret values are placeholder strings.
# Operators MUST replace them via AWS Console or CLI before go-live:
#
#   aws secretsmanager put-secret-value \
#     --secret-id <arn> \
#     --secret-string "actual-value"
#
# Terraform uses lifecycle { ignore_changes = [secret_string] } so it will
# NOT overwrite manually-updated secrets on subsequent `terraform apply` runs.
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# DATABASE_URL
# ---------------------------------------------------------------------------
resource "aws_secretsmanager_secret" "database_url" {
  name        = "${var.project_name}/${var.environment}/DATABASE_URL"
  description = "Postgres connection string for the PHIGuard application"
  kms_key_id  = var.kms_key_arn

  tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
    DataClass   = "PHI-Adjacent"
  }
}

resource "aws_secretsmanager_secret_version" "database_url" {
  secret_id     = aws_secretsmanager_secret.database_url.id
  secret_string = var.database_url_placeholder

  lifecycle {
    ignore_changes = [secret_string]
  }
}

# ---------------------------------------------------------------------------
# BETTER_AUTH_SECRET
# ---------------------------------------------------------------------------
resource "aws_secretsmanager_secret" "better_auth_secret" {
  name        = "${var.project_name}/${var.environment}/BETTER_AUTH_SECRET"
  description = "32-byte hex secret for better-auth session signing"
  kms_key_id  = var.kms_key_arn

  tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}

resource "aws_secretsmanager_secret_version" "better_auth_secret" {
  secret_id     = aws_secretsmanager_secret.better_auth_secret.id
  secret_string = var.better_auth_secret_placeholder

  lifecycle {
    ignore_changes = [secret_string]
  }
}

# ---------------------------------------------------------------------------
# BETTER_AUTH_URL
# ---------------------------------------------------------------------------
resource "aws_secretsmanager_secret" "better_auth_url" {
  name        = "${var.project_name}/${var.environment}/BETTER_AUTH_URL"
  description = "Application base URL used by better-auth (e.g., https://my.phiguard.app)"
  kms_key_id  = var.kms_key_arn

  tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}

resource "aws_secretsmanager_secret_version" "better_auth_url" {
  secret_id     = aws_secretsmanager_secret.better_auth_url.id
  secret_string = var.better_auth_url_placeholder

  lifecycle {
    ignore_changes = [secret_string]
  }
}

# ---------------------------------------------------------------------------
# S3_BUCKET_ATTACHMENTS
# ---------------------------------------------------------------------------
resource "aws_secretsmanager_secret" "s3_bucket_attachments" {
  name        = "${var.project_name}/${var.environment}/S3_BUCKET_ATTACHMENTS"
  description = "Name of the S3 attachments bucket"
  kms_key_id  = var.kms_key_arn

  tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}

resource "aws_secretsmanager_secret_version" "s3_bucket_attachments" {
  secret_id     = aws_secretsmanager_secret.s3_bucket_attachments.id
  secret_string = var.s3_bucket_attachments_placeholder

  lifecycle {
    ignore_changes = [secret_string]
  }
}

# ---------------------------------------------------------------------------
# RESEND_API_KEY
# ---------------------------------------------------------------------------
resource "aws_secretsmanager_secret" "resend_api_key" {
  name        = "${var.project_name}/${var.environment}/RESEND_API_KEY"
  description = "Resend transactional email API key — evaluate BAA requirement before go-live"
  kms_key_id  = var.kms_key_arn

  tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}

resource "aws_secretsmanager_secret_version" "resend_api_key" {
  secret_id     = aws_secretsmanager_secret.resend_api_key.id
  secret_string = var.resend_api_key_placeholder

  lifecycle {
    ignore_changes = [secret_string]
  }
}

# ---------------------------------------------------------------------------
# R2_ACCESS_KEY_ID — Cloudflare R2 access key for lead-magnets bucket
# ---------------------------------------------------------------------------
resource "aws_secretsmanager_secret" "r2_access_key_id" {
  name        = "${var.project_name}/${var.environment}/R2_ACCESS_KEY_ID"
  description = "Cloudflare R2 access key ID scoped to the lead-magnets bucket"
  kms_key_id  = var.kms_key_arn

  tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
    DataClass   = "Public"
  }
}

resource "aws_secretsmanager_secret_version" "r2_access_key_id" {
  secret_id     = aws_secretsmanager_secret.r2_access_key_id.id
  secret_string = var.r2_access_key_id_placeholder

  lifecycle {
    ignore_changes = [secret_string]
  }
}

# ---------------------------------------------------------------------------
# R2_SECRET_ACCESS_KEY — Cloudflare R2 secret access key
# ---------------------------------------------------------------------------
resource "aws_secretsmanager_secret" "r2_secret_access_key" {
  name        = "${var.project_name}/${var.environment}/R2_SECRET_ACCESS_KEY"
  description = "Cloudflare R2 secret access key scoped to the lead-magnets bucket"
  kms_key_id  = var.kms_key_arn

  tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
    DataClass   = "Public"
  }
}

resource "aws_secretsmanager_secret_version" "r2_secret_access_key" {
  secret_id     = aws_secretsmanager_secret.r2_secret_access_key.id
  secret_string = var.r2_secret_access_key_placeholder

  lifecycle {
    ignore_changes = [secret_string]
  }
}

# ---------------------------------------------------------------------------
# R2_ENDPOINT — S3-compatible R2 endpoint URL
# ---------------------------------------------------------------------------
resource "aws_secretsmanager_secret" "r2_endpoint" {
  name        = "${var.project_name}/${var.environment}/R2_ENDPOINT"
  description = "S3-compatible R2 endpoint (https://<account>.r2.cloudflarestorage.com)"
  kms_key_id  = var.kms_key_arn

  tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
    DataClass   = "Public"
  }
}

resource "aws_secretsmanager_secret_version" "r2_endpoint" {
  secret_id     = aws_secretsmanager_secret.r2_endpoint.id
  secret_string = var.r2_endpoint_placeholder

  lifecycle {
    ignore_changes = [secret_string]
  }
}

# ---------------------------------------------------------------------------
# R2_LEAD_MAGNETS_BUCKET — R2 bucket name
# ---------------------------------------------------------------------------
resource "aws_secretsmanager_secret" "r2_lead_magnets_bucket" {
  name        = "${var.project_name}/${var.environment}/R2_LEAD_MAGNETS_BUCKET"
  description = "R2 bucket name holding lead-magnet PDFs"
  kms_key_id  = var.kms_key_arn

  tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
    DataClass   = "Public"
  }
}

resource "aws_secretsmanager_secret_version" "r2_lead_magnets_bucket" {
  secret_id     = aws_secretsmanager_secret.r2_lead_magnets_bucket.id
  secret_string = var.r2_lead_magnets_bucket_placeholder

  lifecycle {
    ignore_changes = [secret_string]
  }
}

# ---------------------------------------------------------------------------
# RESEND_WEBHOOK_SECRET
# ---------------------------------------------------------------------------
resource "aws_secretsmanager_secret" "resend_webhook_secret" {
  name        = "${var.project_name}/${var.environment}/RESEND_WEBHOOK_SECRET"
  description = "Svix signing secret for verifying Resend webhook request signatures"
  kms_key_id  = var.kms_key_arn

  tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}

resource "aws_secretsmanager_secret_version" "resend_webhook_secret" {
  secret_id     = aws_secretsmanager_secret.resend_webhook_secret.id
  secret_string = var.resend_webhook_secret_placeholder

  lifecycle {
    ignore_changes = [secret_string]
  }
}
