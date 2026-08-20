variable "environment" { type = string }
variable "project_name" { type = string }
variable "kms_key_arn" {
  type        = string
  description = "KMS key ARN for encrypting CloudTrail logs (use the logs CMK)"
}
variable "account_id" {
  type        = string
  description = "AWS account ID — used to scope the S3 bucket policy"
}
