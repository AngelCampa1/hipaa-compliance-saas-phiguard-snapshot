output "web_acl_arn" {
  description = "ARN of the WAFv2 Web ACL"
  value       = aws_wafv2_web_acl.main.arn
}

output "web_acl_id" {
  description = "ID of the WAFv2 Web ACL"
  value       = aws_wafv2_web_acl.main.id
}

output "web_acl_name" {
  description = "Name of the WAFv2 Web ACL — used for AWS/WAFV2 CloudWatch metric dimensions"
  value       = aws_wafv2_web_acl.main.name
}
