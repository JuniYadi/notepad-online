@echo off

echo "Deploy Frontend to Production"

cd frontend
call npm run build
aws s3 sync dist s3://notepad-tugas-dev --acl public-read --delete
aws cloudfront create-invalidation --distribution-id E1NE0FLW5P6Q4P --paths "/index.html"