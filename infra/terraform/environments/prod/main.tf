terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

provider "cloudflare" {
  # Reads CLOUDFLARE_API_TOKEN from environment — set via TF_VAR_cloudflare_api_token in CI
  # or export CLOUDFLARE_API_TOKEN=... locally
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = var.environment
      Project     = var.project_name
      ManagedBy   = "terraform"
    }
  }
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Environment = var.environment
      Project     = var.project_name
      ManagedBy   = "terraform"
    }
  }
}

# ---------------------------------------------------------------------------
# Data Sources
# ---------------------------------------------------------------------------
data "aws_caller_identity" "current" {}

# ---------------------------------------------------------------------------
# ALB metric lookup for the production load balancer owned by modules/alb.
# Observability is initialized before the network/ALB modules for log group
# dependencies, so CloudWatch dashboards read the existing/provisioned ALB by
# tags instead of taking a direct module output.
# ---------------------------------------------------------------------------
data "aws_lb" "main" {
  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# ===========================================================================
# Module: KMS
# Must be created before all other modules that use encryption
# ===========================================================================
module "kms" {
  source = "../../modules/kms"

  environment  = var.environment
  project_name = var.project_name
}

# ===========================================================================
# Module: Observability (log groups — created before network/ECS)
# ===========================================================================
module "observability" {
  source = "../../modules/observability"

  environment      = var.environment
  project_name     = var.project_name
  logs_kms_key_arn = module.kms.logs_key_arn
  sns_alert_email  = var.sns_alert_email
  rds_instance_id  = "${var.project_name}-postgres-${var.environment}"
  waf_web_acl_name = "${var.project_name}-web-acl-${var.environment}"
  alb_arn_suffix   = data.aws_lb.main.arn_suffix

  depends_on = [module.kms]
}

# ===========================================================================
# Module: Network
# ===========================================================================
module "network" {
  source = "../../modules/network"

  environment        = var.environment
  project_name       = var.project_name
  flow_log_group_arn = module.observability.vpc_log_group_arn

  depends_on = [module.observability]
}

# ===========================================================================
# Module: S3
# ===========================================================================
module "s3" {
  source = "../../modules/s3"

  environment            = var.environment
  project_name           = var.project_name
  s3_attachments_key_arn = module.kms.s3_attachments_key_arn
  s3_audit_key_arn       = module.kms.s3_audit_key_arn

  depends_on = [module.kms]
}

# ===========================================================================
# ALB Security Group (inline — ALB module consumes it)
# ===========================================================================
resource "aws_security_group" "alb" {
  name        = "${var.project_name}-alb-sg-${var.environment}"
  description = "Controls inbound traffic to the Application Load Balancer"
  vpc_id      = module.network.vpc_id

  ingress {
    description = "HTTPS from internet"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP redirect"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all outbound traffic to ECS"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-alb-sg-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}

module "ecs" {
  source = "../../modules/ecs"

  environment             = var.environment
  project_name            = var.project_name
  aws_region              = var.aws_region
  vpc_id                  = module.network.vpc_id
  private_subnet_ids      = module.network.private_subnet_ids
  alb_security_group_id   = aws_security_group.alb.id
  attachments_bucket_arn  = module.s3.attachments_bucket_arn
  attachments_bucket_name = module.s3.attachments_bucket_name
  audit_bucket_arn        = module.s3.audit_bucket_arn
  app_kms_key_arn         = module.kms.app_key_arn
  s3_attachments_key_arn  = module.kms.s3_attachments_key_arn
  s3_audit_key_arn        = module.kms.s3_audit_key_arn
  app_log_group_name      = module.observability.app_log_group_name
  secrets_arns            = module.secrets.secret_arns
  desired_count           = var.ecs_desired_count
  # ALB target group wired after ALB module creates it — ECS service attaches to the TG
  target_group_arn        = module.alb.target_group_arn

  depends_on = [module.network, module.kms, module.s3, module.observability, module.secrets, module.alb]
}

# ===========================================================================
# Module: ALB
# Internet-facing Application Load Balancer with HTTPS listener (TLS 1.2+),
# HTTP→HTTPS redirect, WAF association, and Route53 alias for app.phiguard.app.
# ===========================================================================
module "alb" {
  source = "../../modules/alb"

  environment           = var.environment
  project_name          = var.project_name
  vpc_id                = module.network.vpc_id
  public_subnet_ids     = module.network.public_subnet_ids
  alb_security_group_id = aws_security_group.alb.id
  certificate_arn       = var.acm_app_certificate_arn
  waf_web_acl_arn       = module.waf.web_acl_arn
  route53_zone_id       = var.route53_zone_id
  domain_name           = "phiguard.app"

  depends_on = [module.network, module.waf]
}

# ===========================================================================
# Module: RDS
# ===========================================================================
module "rds" {
  source = "../../modules/rds"

  environment           = var.environment
  project_name          = var.project_name
  vpc_id                = module.network.vpc_id
  private_subnet_ids    = module.network.private_subnet_ids
  ecs_security_group_id = module.ecs.ecs_security_group_id
  kms_key_arn           = module.kms.rds_key_arn
  db_password           = var.rds_db_password
  instance_class        = var.rds_instance_class

  depends_on = [module.network, module.kms, module.ecs]
}

# ===========================================================================
# Module: WAF
# ===========================================================================
module "waf" {
  source = "../../modules/waf"

  environment       = var.environment
  project_name      = var.project_name
  waf_log_group_arn = module.observability.waf_log_group_arn

  depends_on = [module.observability]
}

module "cloudfront_waf" {
  source = "../../modules/waf"

  providers = {
    aws = aws.us_east_1
  }

  environment       = var.environment
  project_name      = var.project_name
  waf_log_group_arn = module.observability.waf_log_group_arn
  scope             = "CLOUDFRONT"
  name_suffix       = "-cloudfront"

  depends_on = [module.observability]
}

# ===========================================================================
# Module: CloudTrail
# HIPAA §164.312(b) + §164.308(a)(1) — AWS API activity audit trail
# ===========================================================================
module "cloudtrail" {
  source = "../../modules/cloudtrail"

  environment  = var.environment
  project_name = var.project_name
  kms_key_arn  = module.kms.logs_key_arn
  account_id   = data.aws_caller_identity.current.account_id

  depends_on = [module.kms, module.observability]
}

# ===========================================================================
# Module: CloudFront Marketing
# ===========================================================================
module "cloudfront_marketing" {
  source = "../../modules/cloudfront-marketing"

  environment         = var.environment
  project_name        = var.project_name
  acm_certificate_arn = var.acm_certificate_arn
  route53_zone_id     = var.route53_zone_id
  cloudfront_waf_arn  = module.cloudfront_waf.web_acl_arn
}

# ===========================================================================
# Module: Secrets Manager
# ===========================================================================
module "secrets" {
  source = "../../modules/secrets"

  environment                       = var.environment
  project_name                      = var.project_name
  kms_key_arn                       = module.kms.app_key_arn
  database_url_placeholder          = var.database_url_placeholder
  better_auth_secret_placeholder    = var.better_auth_secret_placeholder
  better_auth_url_placeholder       = var.better_auth_url_placeholder
  resend_api_key_placeholder        = var.resend_api_key_placeholder
  resend_webhook_secret_placeholder = var.resend_webhook_secret_placeholder
  s3_bucket_attachments_placeholder = module.s3.attachments_bucket_name

  # R2 endpoint + bucket name are derivable from the r2_lead_magnets module.
  # R2 access keys must be supplied as real prod variables; placeholder values
  # are rejected by environment-level validation before secrets are created.
  r2_access_key_id_placeholder       = var.r2_access_key_id_placeholder
  r2_secret_access_key_placeholder   = var.r2_secret_access_key_placeholder
  r2_endpoint_placeholder            = module.r2_lead_magnets.r2_endpoint
  r2_lead_magnets_bucket_placeholder = module.r2_lead_magnets.bucket_name

  depends_on = [module.kms, module.s3, module.r2_lead_magnets]
}

# ===========================================================================
# Module: R2 Lead Magnets (Cloudflare)
# Private R2 bucket for hosted lead magnet PDFs; delivery via signed URLs
# ===========================================================================
module "r2_lead_magnets" {
  source = "../../modules/r2-lead-magnets"

  cloudflare_account_id = var.cloudflare_account_id
}

