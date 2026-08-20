output "trail_arn" {
  description = "ARN of the CloudTrail trail"
  value       = aws_cloudtrail.main.arn
}
output "log_group_arn" {
  description = "CloudWatch log group ARN for CloudTrail events"
  value       = aws_cloudwatch_log_group.cloudtrail.arn
}
