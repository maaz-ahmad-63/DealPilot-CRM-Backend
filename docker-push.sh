#!/bin/bash

# Build and push Docker image to registry

set -e

REGISTRY="${1:-docker.io}"
USERNAME="${2:-your-username}"
IMAGE_NAME="dealpilot-backend"
TAG="${3:-latest}"

FULL_IMAGE="${REGISTRY}/${USERNAME}/${IMAGE_NAME}:${TAG}"

echo "========================================="
echo "🐳 Building and Pushing Docker Image"
echo "========================================="
echo ""
echo "Registry:    $REGISTRY"
echo "Username:    $USERNAME"
echo "Image:       $IMAGE_NAME"
echo "Tag:         $TAG"
echo "Full Image:  $FULL_IMAGE"
echo ""

# Build image
echo "🔨 Building Docker image..."
docker build -t "$FULL_IMAGE" ./backend

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful"
echo ""

# Login to registry
echo "🔐 Logging in to registry..."
docker login "$REGISTRY"

if [ $? -ne 0 ]; then
    echo "❌ Login failed"
    exit 1
fi

echo "✅ Login successful"
echo ""

# Push image
echo "📤 Pushing image to registry..."
docker push "$FULL_IMAGE"

if [ $? -ne 0 ]; then
    echo "❌ Push failed"
    exit 1
fi

echo "✅ Push successful"
echo ""

# Tag as latest
if [ "$TAG" != "latest" ]; then
    echo "🔄 Tagging as latest..."
    docker tag "$FULL_IMAGE" "${REGISTRY}/${USERNAME}/${IMAGE_NAME}:latest"
    docker push "${REGISTRY}/${USERNAME}/${IMAGE_NAME}:latest"
fi

echo ""
echo "========================================="
echo "✅ Docker Image Published!"
echo "========================================="
echo ""
echo "📍 Image URL: $FULL_IMAGE"
echo ""
echo "💡 Usage:"
echo "  docker pull $FULL_IMAGE"
echo "  docker run -p 5001:5001 $FULL_IMAGE"
echo ""
