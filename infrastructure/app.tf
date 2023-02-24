
data "aws_iam_policy_document" "ecs_agent" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com", "ec2.amazonaws.com", "ecs.amazonaws.com"]
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
  desired_capacity = 2
  max_size         = 4

  launch_template {
    id = aws_launch_template.app-template.id
    version = "$Latest"
  }
  vpc_zone_identifier = aws_subnet.public_subnets.*.id
  protect_from_scale_in = true
}

resource "aws_lb" "loadbalancer" {
  name = "imigz-lb"
  load_balancer_type = "application"
  security_groups = [ aws_security_group.loadbalancer.id ]
  subnets = aws_subnet.public_subnets.*.id
}

resource "aws_lb_target_group" "backend" {
  port = 80
  protocol = "HTTP"
  vpc_id = aws_vpc.main_vpc.id
  target_type = "instance"
  health_check {
    path = "/health"
    protocol = "HTTP"
    port = "traffic-port" # For dynamic port mapping
    interval = 30
    timeout = 20
    healthy_threshold = 2
    unhealthy_threshold = 3
    enabled = true
  }
}

resource "aws_lb_listener" "backend" {
  load_balancer_arn = aws_lb.loadbalancer.arn
  port = 80
  protocol = "HTTP"

  default_action {
    type = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
}