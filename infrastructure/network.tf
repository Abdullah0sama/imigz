terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws",
      version = "~> 4.16"
    }
  }
  required_version = ">= 1.2.0"
}

provider "aws" {
  region = "us-east-1"
}

data "aws_availability_zones" "available_zones" {
  state = "available"
  filter {
    name   = "opt-in-status"
    values = ["opt-in-not-required"]
  }
}


resource "aws_vpc" "main_vpc" {
  cidr_block = "10.0.0.0/16"
}



resource "aws_subnet" "public_subnets" {
  vpc_id                  = aws_vpc.main_vpc.id
  count                   = length(var.availability_zones)
  map_public_ip_on_launch = true
  cidr_block              = element(var.public_subnets_cidr, count.index)
  availability_zone       = var.availability_zones[count.index]
}

resource "aws_subnet" "private_subnets" {
  count                   = length(var.availability_zones)
  vpc_id                  = aws_vpc.main_vpc.id
  map_public_ip_on_launch = false
  cidr_block              = var.private_subnets_cidr[count.index]
  availability_zone       = var.availability_zones[count.index]
}


resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main_vpc.id
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main_vpc.id
}

resource "aws_route" "public_internet_route" {
  route_table_id         = aws_route_table.public.id
  gateway_id             = aws_internet_gateway.igw.id
  destination_cidr_block = "0.0.0.0/0"
}

resource "aws_route_table_association" "public" {
  count          = length(var.public_subnets_cidr)
  route_table_id = aws_route_table.public.id
  subnet_id      = element(aws_subnet.public_subnets.*.id, count.index)
}


resource "aws_security_group" "web-app" {
  description = "Allow http, https, ssh"

  vpc_id = aws_vpc.main_vpc.id
  ingress = [
    # {
    #   from_port        = 80
    #   to_port          = 80
    #   protocol         = "tcp"
    #   cidr_blocks      = ["0.0.0.0/0"]
    #   description      = "Http"
    #   ipv6_cidr_blocks = ["::/0"]
    #   prefix_list_ids  = []
    #   security_groups  = []
    #   self             = false
    # },
    # {
    #   from_port        = 443
    #   to_port          = 443
    #   protocol         = "tcp"
    #   cidr_blocks      = ["0.0.0.0/0"]
    #   description      = "https"
    #   ipv6_cidr_blocks = ["::/0"]
    #   prefix_list_ids  = []
    #   security_groups  = []
    #   self             = false
    # },
    {
      from_port        = 22
      to_port          = 22
      protocol         = "tcp"
      cidr_blocks      = ["0.0.0.0/0"]
      description      = "ssh"
      ipv6_cidr_blocks = ["::/0"]
      prefix_list_ids  = []
      security_groups  = []
      self             = false
    },
    {
      from_port        = 49153
      to_port          = 65535
      protocol         = "tcp"
      cidr_blocks      = ["0.0.0.0/0"]
      description      = "Allow traffic from alb"
      ipv6_cidr_blocks = ["::/0"]
      prefix_list_ids  = []
      security_groups  = [ aws_security_group.loadbalancer.id ]
      self             = false
    }
  ]
  egress {
    description = "Allow all outgoing"
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = [ "0.0.0.0/0" ]
  }
}

resource "aws_security_group" "loadbalancer" {
  description = "load balancer security group"
  vpc_id = aws_vpc.main_vpc.id

  ingress = [
    {
      from_port        = 80
      to_port          = 80
      protocol         = "tcp"
      cidr_blocks      = ["0.0.0.0/0"]
      description      = "Http"
      ipv6_cidr_blocks = ["::/0"]
      prefix_list_ids  = []
      security_groups  = []
      self             = false
    }
  ]

  egress = [
    # {
    #   from_port        = 80
    #   to_port          = 80
    #   protocol         = "tcp"
    #   cidr_blocks      = ["0.0.0.0/0"]
    #   description      = "Http"
    #   ipv6_cidr_blocks = ["::/0"]
    #   prefix_list_ids  = []
    #   security_groups  = []
    #   self             = false
    # }

    {
      from_port        = 49153
      to_port          = 65535
      protocol         = "tcp"
      cidr_blocks      = ["0.0.0.0/0"]
      description      = "Allow traffic from to instances"
      ipv6_cidr_blocks = ["::/0"]
      prefix_list_ids  = []
      security_groups  = [ ]
      self             = false
    }
  ]
}