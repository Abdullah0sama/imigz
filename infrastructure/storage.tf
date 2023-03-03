
resource "aws_s3_bucket" "main" {
  bucket = var.S3_BUCKET
}


resource "aws_db_subnet_group" "rds_subnets" {
  name = "main"
  subnet_ids = aws_subnet.public_subnets.*.id
}

resource "aws_db_instance" "db" {
  instance_class = "db.t3.micro"
  engine = "postgres"
  allocated_storage = 20
  db_name = var.db_name
  publicly_accessible = true
  username = var.db_username
  password = var.db_password
  db_subnet_group_name = aws_db_subnet_group.rds_subnets.name
  vpc_security_group_ids = [ aws_security_group.rdssg.id ]
  skip_final_snapshot = true
}


output "aws_s3_bucket" {
  value = aws_s3_bucket.main.bucket_domain_name
}


output "rds_hostname" {
  value = aws_db_instance.db.address
}

output "rds_port" {
  value = aws_db_instance.db.port
}