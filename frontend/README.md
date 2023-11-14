# Frontend

## Requirement

- NodeJs 16

## Development 

### Install

```
npm install
```

### Running

```
npm run dev
```

## Production

### Build

```
npm run build
```

### Deploy to S3

```
aws s3 sync . s3://notepad-tugas-dev --acl public-read --delete
```