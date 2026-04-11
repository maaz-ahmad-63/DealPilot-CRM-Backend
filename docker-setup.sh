#!/bin/bash

# DealPilot CRM - Docker Development Setup Script

set -e

echo "========================================="
echo "🚀 DealPilot CRM - Docker Setup"
echo "========================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed."
    exit 1
fi

echo "✅ Docker and Docker Compose found"
echo ""

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.docker..."
    cp .env.docker .env
    echo "⚠️  Please update .env with your actual credentials!"
    echo ""
fi

# Build images
echo "🔨 Building Docker images..."
docker-compose build --no-cache

echo ""
echo "🌍 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if backend is healthy
echo "🏥 Checking backend health..."
for i in {1..30}; do
    if curl -f http://localhost:5001/health &> /dev/null; then
        echo "✅ Backend is healthy!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Backend health check failed"
        docker-compose logs backend
        exit 1
    fi
    echo "  Attempt $i/30..."
    sleep 2
done

echo ""
echo "========================================="
echo "✅ Setup Complete!"
echo "========================================="
echo ""
echo "📍 Service URLs:"
echo "  Backend API:  http://localhost:5001"
echo "  MongoDB:      localhost:27017"
echo "  Redis:        localhost:6379"
echo ""
echo "📊 Useful Commands:"
echo "  View logs:    docker-compose logs -f backend"
echo "  Stop services: docker-compose down"
echo "  Stop & reset:  docker-compose down -v"
echo ""
echo "🎯 Next Steps:"
echo "  1. Update .env with your credentials (if needed)"
echo "  2. cd frontend && npm install"
echo "  3. npm run dev"
echo ""
echo "Frontend will be available at: http://localhost:5173"
echo ""
