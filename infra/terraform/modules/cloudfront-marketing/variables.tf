variable "environment" {
  description = "Deployment environment name (e.g. prod, staging)"
  type        = string
}

variable "project_name" {
  description = "Project name used as a prefix for resource names and tags"
  type        = string
}

variable "acm_certificate_arn" {
  description = "ARN of the ACM certificate for phiguard.app in us-east-1 (required by CloudFront). Must be created and validated separately."
  type        = string
}

variable "route53_zone_id" {
  description = "Route53 hosted zone ID for phiguard.app"
  type        = string
}

variable "cloudfront_waf_arn" {
  description = "ARN of a CLOUDFRONT-scope WAF ACL in us-east-1 to associate with the distribution."
  type        = string

  validation {
    condition     = length(trimspace(var.cloudfront_waf_arn)) > 0
    error_message = "cloudfront_waf_arn is required so the marketing CloudFront distribution is not deployed without WAF protection."
  }
}
