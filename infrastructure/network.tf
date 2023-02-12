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

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main_vpc.owner_id
}

resource "aws_route_table" "public_subnet_1_route_table" {
  vpc_id = aws_vpc.main_vpc
}

resource "aws_route" "public_1_internet_route" {
  route_table_id = aws_route_table.public_subnet_1_route_table.id
  gateway_id = aws_internet_gateway.igw.id
  destination_cidr_block = "0.0.0.0/0"
}

resource "aws_route_table" "public_subnet_2_route_table" {
  vpc_id = aws_vpc.main_vpc
}

resource "aws_route" "public_2_internet_route" {
  route_table_id = aws_route_table.public_subnet_2_route_table.id
  gateway_id = aws_internet_gateway.igw.id
  destination_cidr_block = "0.0.0.0/0"
}


resource "aws_subnet" "public_subnet_1" {
  vpc_id                  = aws_vpc.main_vpc.id
  count = 
  map_public_ip_on_launch = true
  cidr_block              = "10.0.1.0/24"
  availability_zone       = data.aws_availability_zones.available_zones.names[0]
}

resource "aws_subnet" "public_subnet_2" {
  vpc_id                  = aws_vpc.main_vpc.id
  map_public_ip_on_launch = true
  cidr_block              = "10.0.2.0/24"
  availability_zone       = data.aws_availability_zones.available_zones.names[1]
}

resource "aws_subnet" "private_subnet_1" {
  vpc_id                  = aws_vpc.main_vpc.id
  map_public_ip_on_launch = false
  cidr_block              = "10.0.3.0/24"
  availability_zone       = data.aws_availability_zones.available_zones.names[0]
}

