REGION   = "ap-southeast-1"
APP_NAME = "notepad-tugas-dev"

## Dev
APP_DOMAIN           = "notepad.tugas.dev"
SES_DOMAIN           = "tugas.dev"
STAGE                = "prod"

COGNITO_GROUPS = [
  {
    name        = "administrator",
    description = "Administrator Access Permission Group",
    precedence  = 1,
  },
  {
    name        = "user",
    description = "User Access Permission Group",
    precedence  = 20,
  },
]