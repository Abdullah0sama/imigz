resource "aws_ecs_cluster" "appCluster" {
  name = "imigz-app-cluster"
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
  
  task_role_arn = aws_iam_role.task_role.arn
  execution_role_arn = aws_iam_role.task_execution_role.arn

  depends_on = [
    aws_iam_role.task_role,
    aws_iam_role.task_execution_role
  ]

  container_definitions = jsonencode([
    {
      name = "imigz"
      image = "abdullah0sama/imigz"
      memory = 512
      cpu = 512
      essential = true
      environment = [for tkey, val in var.imigz_task_public_env: {
        name = tkey
        value = val
      }]
      
      secrets = [
        {
          name = "DATABASE_PASSWORD"
          valueFrom = "arn:aws:ssm:us-east-1:${var.accountId}:parameter/prod/imigz/DATABASE_PASSWORD"
        },
        {
          name = "JWT_SECRET"
          valueFrom = "arn:aws:ssm:us-east-1:${var.accountId}:parameter/prod/imigz/JWT_SECRET"
        },
        {
          name = "GITHUB_CLIENT_ID"
          valueFrom = "arn:aws:ssm:us-east-1:${var.accountId}:parameter/prod/imigz/GITHUB_CLIENT_ID"
        },
        {
          name = "GITHUB_CLIENT_SECRET"
          valueFrom = "arn:aws:ssm:us-east-1:${var.accountId}:parameter/prod/imigz/GITHUB_CLIENT_SECRET"
        },

      ]

      healthCheck = {
        command = [ "CMD-SHELL", "curl -f http://localhost:3000/health || exit 1" ]
        interval = 20
        timeout = 5
        retries = 3
      }
      portMappings = [
        {
          containerPort = 3000
          hostPort      = 0 # For dynamic port mapping 
        }
      ]
    }
  ])
}


resource "aws_ecs_service" "imigz" {
  name = "imigz"
  cluster = aws_ecs_cluster.appCluster.id
  task_definition = aws_ecs_task_definition.imigz.arn
  desired_count = 2

  scheduling_strategy = "REPLICA"
  
  capacity_provider_strategy {
    capacity_provider = aws_ecs_capacity_provider.cap_prov.name
    base = 2
    weight = 1
  }

  # Defaults
  deployment_maximum_percent = 200
  deployment_minimum_healthy_percent = 100

  
  ordered_placement_strategy {
    type = "spread"
    field  = "attribute:ecs.availability-zone"
  }

  iam_role = "arn:aws:iam::699144434216:role/aws-service-role/ecs.amazonaws.com/AWSServiceRoleForECS"

  load_balancer {
    container_port = 3000
    container_name = "imigz"
    target_group_arn = aws_lb_target_group.backend.arn
  }
  
  depends_on = [
    
  ]
  # force_new_deployment = true

  # triggers = {
  #   redeployment = timestamp()
  # }

}

# resource "aws_appautoscaling_target" "name" {
  
# }