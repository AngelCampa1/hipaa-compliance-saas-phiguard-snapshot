variable "environment" {
  description = "Deployment environment name (e.g. prod, staging)"
  type        = string
}

variable "project_name" {
  description = "Project name used as a prefix for resource names and tags"
  type        = string
}

variable "waf_log_group_arn" {
  description = "ARN of the CloudWatch log group for WAF logs (must begin with 'aws-waf-logs-')"
  type        = string
}

variable "scope" {
  description = "WAF scope. Use REGIONAL for ALB/API resources and CLOUDFRONT for CloudFront distributions."
  type        = string
  default     = "REGIONAL"

  validation {
    condition     = contains(["REGIONAL", "CLOUDFRONT"], var.scope)
    error_message = "scope must be REGIONAL or CLOUDFRONT."
  }
}

variable "name_suffix" {
  description = "Optional suffix used to distinguish multiple web ACLs in the same environment."
  type        = string
  default     = ""
}
