data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# ---------------------------------------------------------------------------
# KMS key policy template
# - Grants the account root full control
# - Denies key deletion / scheduled deletion without MFA
# ---------------------------------------------------------------------------
locals {
  key_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "EnableRootAccess"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action   = "kms:*"
        Resource = "*"
      },
      {
        Sid    = "DenyKeyDeletionWithoutMFA"
        Effect = "Deny"
        Principal = {
          AWS = "*"
        }
        Action = [
          "kms:ScheduleKeyDeletion",
          "kms:DeleteImportedKeyMaterial"
        ]
        Resource = "*"
        Condition = {
          BoolIfExists = {
            "aws:MultiFactorAuthPresent" = "false"
          }
        }
      }
    ]
  })
}

# ---------------------------------------------------------------------------
# CMK: General application encryption
# ---------------------------------------------------------------------------
resource "aws_kms_key" "app" {
  description             = "${var.project_name} general app encryption — ${var.environment}"
  deletion_window_in_days = 30
  enable_key_rotation     = true
  policy                  = local.key_policy

  tags = {
    Name        = "${var.project_name}-app-key-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}

resource "aws_kms_alias" "app" {
  name          = "alias/${var.project_name}-app-${var.environment}"
  target_key_id = aws_kms_key.app.key_id
}

# ---------------------------------------------------------------------------
# CMK: RDS encryption
# ---------------------------------------------------------------------------
resource "aws_kms_key" "rds" {
  description             = "${var.project_name} RDS encryption — ${var.environment}"
  deletion_window_in_days = 30
  enable_key_rotation     = true
  policy                  = local.key_policy

  tags = {
    Name        = "${var.project_name}-rds-key-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}

resource "aws_kms_alias" "rds" {
  name          = "alias/${var.project_name}-rds-${var.environment}"
  target_key_id = aws_kms_key.rds.key_id
}

# ---------------------------------------------------------------------------
# CMK: S3 attachments bucket
# ---------------------------------------------------------------------------
resource "aws_kms_key" "s3_attachments" {
  description             = "${var.project_name} S3 attachments bucket encryption — ${var.environment}"
  deletion_window_in_days = 30
  enable_key_rotation     = true
  policy                  = local.key_policy

  tags = {
    Name        = "${var.project_name}-s3-attachments-key-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}

resource "aws_kms_alias" "s3_attachments" {
  name          = "alias/${var.project_name}-s3-attachments-${var.environment}"
  target_key_id = aws_kms_key.s3_attachments.key_id
}

# ---------------------------------------------------------------------------
# CMK: S3 audit exports bucket
# ---------------------------------------------------------------------------
resource "aws_kms_key" "s3_audit" {
  description             = "${var.project_name} S3 audit exports bucket encryption — ${var.environment}"
  deletion_window_in_days = 30
  enable_key_rotation     = true
  policy                  = local.key_policy

  tags = {
    Name        = "${var.project_name}-s3-audit-key-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}

resource "aws_kms_alias" "s3_audit" {
  name          = "alias/${var.project_name}-s3-audit-${var.environment}"
  target_key_id = aws_kms_key.s3_audit.key_id
}

# ---------------------------------------------------------------------------
# CMK: CloudWatch Logs encryption
# ---------------------------------------------------------------------------
resource "aws_kms_key" "logs" {
  description             = "${var.project_name} CloudWatch Logs encryption — ${var.environment}"
  deletion_window_in_days = 30
  enable_key_rotation     = true
  # CloudWatch Logs service principal needs explicit kms:* grants
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "EnableRootAccess"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action   = "kms:*"
        Resource = "*"
      },
      {
        Sid    = "AllowCloudWatchLogs"
        Effect = "Allow"
        Principal = {
          Service = "logs.${data.aws_region.current.name}.amazonaws.com"
        }
        Action = [
          "kms:Encrypt",
          "kms:Decrypt",
          "kms:ReEncrypt*",
          "kms:GenerateDataKey*",
          "kms:Describe*"
        ]
        Resource = "*"
        Condition = {
          ArnLike = {
            "kms:EncryptionContext:aws:logs:arn" = "arn:aws:logs:*:${data.aws_caller_identity.current.account_id}:*"
          }
        }
      },
      {
        Sid    = "AllowCloudTrailLogDelivery"
        Effect = "Allow"
        Principal = {
          Service = "cloudtrail.amazonaws.com"
        }
        Action = [
          "kms:GenerateDataKey*",
          "kms:Decrypt"
        ]
        Resource = "*"
        Condition = {
          StringEquals = {
            "aws:SourceArn" = "arn:aws:cloudtrail:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:trail/${var.project_name}-trail-${var.environment}"
          }
          StringLike = {
            "kms:EncryptionContext:aws:cloudtrail:arn" = "arn:aws:cloudtrail:*:${data.aws_caller_identity.current.account_id}:trail/*"
          }
        }
      },
      {
        Sid    = "AllowCloudTrailDescribeKey"
        Effect = "Allow"
        Principal = {
          Service = "cloudtrail.amazonaws.com"
        }
        Action   = "kms:DescribeKey"
        Resource = "*"
        Condition = {
          StringEquals = {
            "aws:SourceArn" = "arn:aws:cloudtrail:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:trail/${var.project_name}-trail-${var.environment}"
          }
        }
      },
      {
        Sid    = "DenyKeyDeletionWithoutMFA"
        Effect = "Deny"
        Principal = {
          AWS = "*"
        }
        Action = [
          "kms:ScheduleKeyDeletion",
          "kms:DeleteImportedKeyMaterial"
        ]
        Resource = "*"
        Condition = {
          BoolIfExists = {
            "aws:MultiFactorAuthPresent" = "false"
          }
        }
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-logs-key-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}

resource "aws_kms_alias" "logs" {
  name          = "alias/${var.project_name}-logs-${var.environment}"
  target_key_id = aws_kms_key.logs.key_id
}
