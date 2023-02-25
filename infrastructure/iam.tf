
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


data "aws_iam_policy_document" "task_trust_policy" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "task_role" {
  name = "imigzTaskRole"
  assume_role_policy = data.aws_iam_policy_document.task_trust_policy.json
}


resource "aws_iam_role" "task_execution_role" {
  name = "taskExecutionRole"
  assume_role_policy = data.aws_iam_policy_document.task_trust_policy.json
}

resource "aws_iam_role_policy" "access_s3" {
  role = aws_iam_role.task_role.id
  policy = <<EOT
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:*"],
      "Resource": "arn:aws:s3:::${var.S3_BUCKET}/*"
    }
  ]
}
  EOT
}

resource "aws_iam_role_policy" "storage_params_permissions" {
  role = aws_iam_role.task_execution_role.id
  policy = <<EOT
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameters"
      ],
      "Resource": [
        "arn:aws:ssm:us-east-1:${var.accountId}:parameter/prod/imigz/*"
      ]
    }
  ]
}
EOT
}