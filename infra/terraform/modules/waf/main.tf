# ---------------------------------------------------------------------------
# WAFv2 Web ACL — REGIONAL scope (attached to ALB)
#
# Rules:
#   1. AWS Managed Common Rule Set — blocks common web attack patterns
#   2. AWS Managed Known Bad Inputs Rule Set — blocks SQLi, LFI, XSS patterns
#   3. Rate-based rule — 2000 req / 5 min per IP (blocks scraping + brute force)
#
# Default action: ALLOW (rules block specific bad traffic)
# All WAF decisions logged to CloudWatch Logs
# ---------------------------------------------------------------------------
resource "aws_wafv2_web_acl" "main" {
  name        = "${var.project_name}-web-acl${var.name_suffix}-${var.environment}"
  description = "WAF Web ACL for ${var.project_name}${var.name_suffix} — ${var.environment}"
  scope       = var.scope

  default_action {
    allow {}
  }

  # Rule 1: AWS Managed Common Rule Set
  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 10

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.project_name}-common-rules${var.name_suffix}-${var.environment}"
      sampled_requests_enabled   = false
    }
  }

  # Rule 2: AWS Managed Known Bad Inputs Rule Set
  rule {
    name     = "AWSManagedRulesKnownBadInputsRuleSet"
    priority = 20

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.project_name}-known-bad-inputs${var.name_suffix}-${var.environment}"
      sampled_requests_enabled   = false
    }
  }

  # Rule 3: Rate-based limiting — 2000 requests per 5-minute window per IP
  # Protects against brute-force login attacks and scraping
  rule {
    name     = "RateLimitPerIP"
    priority = 30

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = 2000
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.project_name}-rate-limit${var.name_suffix}-${var.environment}"
      sampled_requests_enabled   = false
    }
  }

  # Rule 4: Strict rate limit on auth endpoints — 100 req / 5-min per IP
  # Prevents credential stuffing and brute-force attacks against /api/auth/*
  rule {
    name     = "RateLimitAuthEndpoints"
    priority = 31

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = 100
        aggregate_key_type = "IP"

        scope_down_statement {
          byte_match_statement {
            search_string         = "/api/auth/"
            positional_constraint = "STARTS_WITH"
            field_to_match {
              uri_path {}
            }
            text_transformation {
              priority = 0
              type     = "LOWERCASE"
            }
          }
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.project_name}-rate-limit-auth${var.name_suffix}-${var.environment}"
      sampled_requests_enabled   = false
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${var.project_name}-web-acl${var.name_suffix}-${var.environment}"
    sampled_requests_enabled   = false
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}

# ---------------------------------------------------------------------------
# WAF Logging Configuration
# Note: CloudWatch log group name MUST start with "aws-waf-logs-"
# This is enforced by AWS — the observability module creates the group.
# ---------------------------------------------------------------------------
resource "aws_wafv2_web_acl_logging_configuration" "main" {
  log_destination_configs = [var.waf_log_group_arn]
  resource_arn            = aws_wafv2_web_acl.main.arn

  # Redact bearer credentials and session cookies before logging
  redacted_fields {
    single_header {
      name = "authorization"
    }
  }

  redacted_fields {
    single_header {
      name = "cookie"
    }
  }
}
