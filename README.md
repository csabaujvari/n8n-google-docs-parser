# n8n-google-docs-parser

## (1) Build the container image with Cloud Build:

```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/docx-pandoc-run
```

## (2) Deploy to Cloud Run with boosted resources:

```bash
gcloud run deploy docx-pandoc-run \
  --image gcr.io/YOUR_PROJECT_ID/docx-pandoc-run \
  --platform managed \
  --region europe-west1 \
  --memory 2Gi \
  --cpu 2 \
  --concurrency 1 \
  --allow-unauthenticated
```
