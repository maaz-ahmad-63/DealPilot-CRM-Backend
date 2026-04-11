#!/bin/bash

# Production Deployment Script for Render

set -e

echo "========================================="
echo "🚀 Deploying to Render"
echo "========================================="
echo ""

# Check if render-deploy.env exists
if [ ! -f render-deploy.env ]; then
    echo "❌ render-deploy.env not found"
    echo ""
    echo "Create render-deploy.env with your Render environment variables:"
    echo ""
    echo "MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dealpilot"
    echo "REDIS_URL=redis://:password@host:port"
    echo "JWT_SECRET=your_secret_key"
    echo "FRONTEND_URL=https://your-frontend.vercel.app"
    echo "TWILIO_ACCOUNT_SID=your_sid"
    echo "TWILIO_AUTH_TOKEN=your_token"
    echo ""
    exit 1
fi

# Load environment variables
export $(cat render-deploy.env | xargs)

# Get your Render deploy hook URL from:
# https://dashboard.render.com/web/[service-id]/settings/deploys

if [ -z "$RENDER_DEPLOY_HOOK" ]; then
    echo "❌ RENDER_DEPLOY_HOOK not set"
    echo ""
    echo "Add to render-deploy.env:"
    echo "RENDER_DEPLOY_HOOK=https://api.render.com/deploy/srv-XXXXX?key=XXXXX"
    echo ""
    exit 1
fi

echo "📤 Triggering Render deployment..."
curl -X POST "$RENDER_DEPLOY_HOOK" \
    -H "Content-Type: application/json" \
    -d '{"clear_cache": false}'

echo ""
echo "========================================="
echo "✅ Deployment Triggered!"
echo "========================================="
echo ""
echo "Monitor at: https://dashboard.render.com"
echo ""
