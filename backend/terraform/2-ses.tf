data "aws_ses_domain_identity" "ses" {
  domain   = var.SES_DOMAIN
}
