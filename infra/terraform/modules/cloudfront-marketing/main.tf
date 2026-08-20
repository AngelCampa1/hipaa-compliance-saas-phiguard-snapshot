data "aws_caller_identity" "current" {}

# ---------------------------------------------------------------------------
# S3 Bucket for Marketing Static Assets
# No public access — accessed exclusively via CloudFront OAC
# ---------------------------------------------------------------------------
resource "aws_s3_bucket" "marketing" {
  bucket        = "${var.project_name}-marketing-${var.environment}"
  force_destroy = false

  tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}

resource "aws_s3_bucket_public_access_block" "marketing" {
  bucket = aws_s3_bucket.marketing.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "marketing" {
  bucket = aws_s3_bucket.marketing.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_kms_key" "marketing" {
  description             = "${var.project_name} marketing S3 encryption key"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}

resource "aws_kms_alias" "marketing" {
  name          = "alias/${var.project_name}-marketing-${var.environment}"
  target_key_id = aws_kms_key.marketing.key_id
}

resource "aws_s3_bucket_server_side_encryption_configuration" "marketing" {
  bucket = aws_s3_bucket.marketing.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.marketing.arn
    }
    bucket_key_enabled = true
  }
}

# ---------------------------------------------------------------------------
# CloudFront Origin Access Control (OAC)
# Replaces legacy OAI — AWS recommended approach
# ---------------------------------------------------------------------------
resource "aws_cloudfront_origin_access_control" "marketing" {
  name                              = "${var.project_name}-marketing-oac-${var.environment}"
  description                       = "OAC for ${var.project_name} marketing S3 bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# Bucket policy — allow CloudFront OAC to read objects
resource "aws_s3_bucket_policy" "marketing" {
  bucket = aws_s3_bucket.marketing.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontOAC"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.marketing.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.marketing.arn
          }
        }
      }
    ]
  })
}

# ---------------------------------------------------------------------------
# S3 Bucket for CloudFront Access Logs (KMS-encrypted)
# ---------------------------------------------------------------------------
resource "aws_s3_bucket" "cf_logs" {
  bucket        = "${var.project_name}-marketing-cf-logs-${var.environment}"
  force_destroy = false

  tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}

resource "aws_s3_bucket_public_access_block" "cf_logs" {
  bucket = aws_s3_bucket.cf_logs.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "cf_logs" {
  bucket = aws_s3_bucket.cf_logs.id

  # CloudFront access log delivery requires SSE-S3 — SSE-KMS is not supported
  # by the CloudFront log delivery service principal.
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_ownership_controls" "cf_logs" {
  bucket = aws_s3_bucket.cf_logs.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_versioning" "cf_logs" {
  bucket = aws_s3_bucket.cf_logs.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "cf_logs" {
  bucket = aws_s3_bucket.cf_logs.id

  rule {
    id     = "expire-logs-90d"
    status = "Enabled"

    expiration {
      days = 90
    }

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

resource "aws_s3_bucket_policy" "cf_logs" {
  bucket = aws_s3_bucket.cf_logs.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "DenyNonTLS"
        Effect    = "Deny"
        Principal = "*"
        Action    = "s3:*"
        Resource = [
          aws_s3_bucket.cf_logs.arn,
          "${aws_s3_bucket.cf_logs.arn}/*",
        ]
        Condition = {
          Bool = {
            "aws:SecureTransport" = "false"
          }
        }
      }
    ]
  })
}

# ---------------------------------------------------------------------------
# CloudFront Distribution
# Note: ACM certificate MUST be in us-east-1 — CloudFront requirement.
#       Pass the ARN via var.acm_certificate_arn; do not create it here.
# ---------------------------------------------------------------------------
resource "aws_cloudfront_distribution" "marketing" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${var.project_name} marketing site — ${var.environment}"
  default_root_object = "index.html"

  web_acl_id = var.cloudfront_waf_arn

  aliases = ["phiguard.app", "www.phiguard.app"]

  # Price class 100 — US + Europe only (aligns with target market)
  price_class = "PriceClass_100"

  origin {
    domain_name              = aws_s3_bucket.marketing.bucket_regional_domain_name
    origin_id                = "marketing-s3-origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.marketing.id
  }

  logging_config {
    bucket          = aws_s3_bucket.cf_logs.bucket_regional_domain_name
    include_cookies = false
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "marketing-s3-origin"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    # Managed CachingOptimized policy (id stable across all AWS regions)
    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6"

    response_headers_policy_id = aws_cloudfront_response_headers_policy.marketing.id

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.rewrite_uri.arn
    }
  }

  # 404s served as genuine 404s with a custom error page
  custom_error_response {
    error_code            = 404
    response_code         = 404
    response_page_path    = "/404.html"
    error_caching_min_ttl = 10
  }

  # 5xx errors served with a custom error page; short TTL to recover quickly
  custom_error_response {
    error_code            = 500
    response_code         = 500
    response_page_path    = "/500"
    error_caching_min_ttl = 5
  }

  custom_error_response {
    error_code            = 502
    response_code         = 502
    response_page_path    = "/500"
    error_caching_min_ttl = 5
  }

  custom_error_response {
    error_code            = 503
    response_code         = 503
    response_page_path    = "/500"
    error_caching_min_ttl = 5
  }

  custom_error_response {
    error_code            = 504
    response_code         = 504
    response_page_path    = "/500"
    error_caching_min_ttl = 5
  }

  viewer_certificate {
    acm_certificate_arn      = var.acm_certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021" # HIPAA: TLS 1.2+ only
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}

# ---------------------------------------------------------------------------
# Route53 Records — phiguard.app + www.phiguard.app → CloudFront
# ---------------------------------------------------------------------------
resource "aws_route53_record" "apex" {
  zone_id = var.route53_zone_id
  name    = "phiguard.app"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.marketing.domain_name
    zone_id                = aws_cloudfront_distribution.marketing.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www" {
  zone_id = var.route53_zone_id
  name    = "www.phiguard.app"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.marketing.domain_name
    zone_id                = aws_cloudfront_distribution.marketing.hosted_zone_id
    evaluate_target_health = false
  }
}
