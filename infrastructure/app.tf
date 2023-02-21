# terraform {
#   required_providers {
#     aws = {
#       source  = "hashicorp/aws",
#       version = "~> 4.16"
#     }
#   }
#   required_version = ">= 1.2.0"
# }

# provider "aws" {
#   region = "us-east-1"
# }

data "aws_iam_policy_document" "ecs_agent" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com", "ec2.amazonaws.com"]
    }
  }
}


resource "aws_iam_role" "ecs_agent" {
  name               = "ecs_agent"
  assume_role_policy = data.aws_iam_policy_document.ecs_agent.json
}

resource "aws_iam_role_policy_attachment" "name" {
  role       = aws_iam_role.ecs_agent.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

resource "aws_iam_instance_profile" "ecs_agent" {
  name = "esc-agent"
  role = aws_iam_role.ecs_agent.name
}

resource "aws_launch_template" "app-template" {
  name          = "main-app-template"
  image_id      = "ami-05e7fa5a3b6085a75"
  instance_type = "t2.micro"

  iam_instance_profile {
    arn = aws_iam_instance_profile.ecs_agent.arn
  }

  key_name = "udakey"
  # key_name = "supersec"
  
  # block_device_mappings {
  #   device_name = "/dev/sda1"
  #   ebs {
  #     volume_size = 10
  #   }
  # }

  user_data = (base64encode(<<EOF
      #!/bin/bash 
      echo "ECS_CLUSTER=${aws_ecs_cluster.appCluster.name}" >> /etc/ecs/ecs.config
  EOF
  ))
  vpc_security_group_ids = [aws_security_group.web-app.id]
}


resource "aws_autoscaling_group" "asg" {

  min_size         = 1
  desired_capacity = 1
  max_size         = 2

  launch_template {
    id = aws_launch_template.app-template.id
    version = "$Latest"
  }
  vpc_zone_identifier = aws_subnet.public_subnets.*.id
  protect_from_scale_in = true
}



resource "aws_ecs_cluster" "appCluster" {
  name = "imigiz-app-cluster"
}

resource "aws_ecs_capacity_provider" "cap_prov" {
  name = "capacity_prov"
  auto_scaling_group_provider {
    auto_scaling_group_arn = aws_autoscaling_group.asg.arn
    managed_termination_protection = "ENABLED"
    managed_scaling {
      maximum_scaling_step_size = 1000
      minimum_scaling_step_size = 1
      status                    = "ENABLED"
      target_capacity           = 100
    }
  }
}

resource "aws_ecs_cluster_capacity_providers" "capacity_providers" {
  cluster_name = aws_ecs_cluster.appCluster.name
  capacity_providers = [ aws_ecs_capacity_provider.cap_prov.name ]
  default_capacity_provider_strategy {
    capacity_provider = aws_ecs_capacity_provider.cap_prov.name
  }
}

resource "aws_ecs_task_definition" "imigz" {
  family = "main_task"

  container_definitions = jsonencode([
    {
      name = "first"
      image = "abdullah0sama/imigz"
      memory = 150
      cpu = 100
      portMappings = [
        {
          containerPort = 3000
          hostPort      = 80
        }
      ]
    }
  ])
}
