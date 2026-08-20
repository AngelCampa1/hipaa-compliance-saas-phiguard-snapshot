output "app_url" {
  description = "Application URL (TanStack Start app)"
  value       = "https://my.phiguard.app"
}

output "marketing_url" {
  description = "Marketing site URL"
  value       = "https://phiguard.app"
}

output "ecr_repository_url" {
  description = "ECR repository URL for legacy app image pushes"
  value       = module.ecs.ecr_repository_url
}

output "rds_endpoint" {
  description = "RDS Postgres endpoint — use this to construct DATABASE_URL"
  value       = module.rds.db_endpoint
  sensitive   = true
}

output "rds_db_name" {
  description = "RDS database name"
  value       = module.rds.db_name
}

output "attachments_bucket_name" {
  description = "S3 attachments bucket name"
  value       = module.s3.attachments_bucket_name
}

output "audit_bucket_name" {
  description = "S3 audit exports bucket name"
  value       = module.s3.audit_bucket_name
}

output "cloudfront_domain" {
  description = "CloudFront distribution domain name for marketing site"
  value       = module.cloudfront_marketing.cloudfront_domain
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID for legacy cache invalidation"
  value       = module.cloudfront_marketing.cloudfront_distribution_id
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = module.ecs.cluster_name
}

output "ecs_service_name" {
  description = "ECS service name"
  value       = module.ecs.service_name
}

output "waf_web_acl_arn" {
  description = "WAF Web ACL ARN — associated with the ALB by the alb module"
  value       = module.waf.web_acl_arn
}

output "alb_arn" {
  description = "ALB ARN"
  value       = module.alb.alb_arn
}

output "alb_dns_name" {
  description = "ALB DNS name (for troubleshooting)"
  value       = module.alb.alb_dns_name
}

output "secret_arns" {
  description = "Map of secret name to Secrets Manager ARN"
  value       = module.secrets.secret_arns
  sensitive   = true
}
