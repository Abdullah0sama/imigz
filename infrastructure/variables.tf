variable "availability_zones" {
  description = "Availability zone"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "public_subnets_cidr" {
  type    = list(string)
  default = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnets_cidr" {
  type    = list(string)
  default = ["10.0.3.0/24", "10.0.4.0/24"]
}

variable "imigz_task_public_env" {
  type = object({
    HOST                  = string
    PORT                  = string
    DATABASE_HOST         = string
    DATABASE_USER         = string
    DATABASE_PASSWORD     = string
    DATABASE_NAME         = string
    AWS_S3_BUCKET         = string
    AWS_S3_REGION         = string
    AWS_CLOUDFRONT        = string
    GITHUB_CLIENT_ID      = string
    GITHUB_CLIENT_SECRET  = string
  })
}