#!/usr/bin/env bash
set -e

# Blind Spot - Google Cloud Run Deployment Script
# PromptWars 2026 Submission

PROJECT_ID=${GCP_PROJECT_ID:-$(gcloud config get-value project 2>/dev/null)}
SERVICE_NAME="blind-spot"
REGION=${GCP_REGION:-"us-central1"}

if [ -z "$PROJECT_ID" ]; then
  echo "Error: GCP_PROJECT_ID is not set and no active gcloud project found."
  echo "Usage: GCP_PROJECT_ID=your-project-id ./deploy.sh"
  exit 1
fi

echo "=================================================="
echo "Deploying BLIND SPOT to Google Cloud Run"
echo "Project: $PROJECT_ID"
echo "Service: $SERVICE_NAME"
echo "Region:  $REGION"
echo "=================================================="

# 1. Build and submit container image via Google Cloud Build
IMAGE_TAG="gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest"
echo "Submitting build to Cloud Build..."
gcloud builds submit --tag "${IMAGE_TAG}" .

# 2. Deploy to Google Cloud Run
echo "Deploying container to Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
  --image "${IMAGE_TAG}" \
  --platform managed \
  --region "${REGION}" \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars NODE_ENV=production

echo "=================================================="
echo "Deployment Complete!"
echo "Check your live service URL above."
echo "=================================================="
