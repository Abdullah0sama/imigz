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

variable "S3_BUCKET" {
  default = "imigz-699144434216"
  type = string
}

variable "db_name" {
  default = "imigz"
  type = string
}

variable "db_username" {
  default = "postgres"
  type = string
}


variable "db_password" {
  type = string
  sensitive = true
}

variable "accountId" {
  type = string
  default = "699144434216"
}
variable "imigz_task_public_env" {
  type = object({
    HOST                  = string
    PORT                  = string

    DATABASE_HOST         = string
    DATABASE_USER         = string
    DATABASE_NAME         = string

    AWS_S3_BUCKET         = string
    AWS_S3_REGION         = string
    AWS_CLOUDFRONT        = string

    CALLBACK              = string
  })
}