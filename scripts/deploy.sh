#!/bin/bash

# SaaS Starter Deployment Script
# Usage: ./scripts/deploy.sh [environment] [platform]
# Example: ./scripts/deploy.sh production vercel

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
PLATFORM=${2:-docker}
APP_NAME="saas-starter"
DOCKER_IMAGE_NAME="$APP_NAME"
BUILD_TIME=$(date +"%Y%m%d%H%M%S")
DOCKER_TAG="${ENVIRONMENT}-${BUILD_TIME}"

echo -e "${BLUE}🚀 Starting deployment for ${ENVIRONMENT} environment on ${PLATFORM}...${NC}"

# Function to print colored output
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Pre-deployment checks
log_info "Running pre-deployment checks..."

if [ ! -f "package.json" ]; then
    log_error "package.json not found. Please run this script from the project root."
    exit 1
fi

if [ ! -f "Dockerfile" ]; then
    log_error "Dockerfile not found. Please ensure Docker configuration exists."
    exit 1
fi

# Check required environment variables based on platform
check_env_vars() {
    local required_vars=("DATABASE_URL" "NEXTAUTH_SECRET" "NEXTAUTH_URL")

    if [ "$PLATFORM" = "vercel" ]; then
        required_vars+=("VERCEL_ORG_ID" "VERCEL_PROJECT_ID")
    fi

    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            log_error "Environment variable $var is required but not set."
            exit 1
        fi
    done
}

# Build and test
build_and_test() {
    log_info "Installing dependencies..."
    npm ci

    log_info "Running linting..."
    npm run lint || log_warning "Linting issues found, continuing..."

    log_info "Running type checking..."
    npx tsc --noEmit || {
        log_error "Type checking failed"
        exit 1
    }

    log_info "Building application..."
    npm run build

    log_info "Generating Prisma client..."
    npx prisma generate

    log_success "Build completed successfully!"
}

# Docker deployment
deploy_docker() {
    log_info "Building Docker image..."

    # Build multi-stage Docker image
    docker build \
        --target runner \
        --tag "$DOCKER_IMAGE_NAME:$DOCKER_TAG" \
        --tag "$DOCKER_IMAGE_NAME:$ENVIRONMENT-latest" \
        --build-arg NODE_ENV="$ENVIRONMENT" \
        .

    log_success "Docker image built: $DOCKER_IMAGE_NAME:$DOCKER_TAG"

    # Check image size
    IMAGE_SIZE=$(docker images "$DOCKER_IMAGE_NAME:$DOCKER_TAG" --format "table {{.Size}}" | tail -n +2)
    log_info "Docker image size: $IMAGE_SIZE"

    # Test the image
    log_info "Testing Docker image..."

    # Create a test network
    docker network create "$APP_NAME-test-network" 2>/dev/null || true

    # Start test database
    docker run -d \
        --name "$APP_NAME-test-db" \
        --network "$APP_NAME-test-network" \
        -e POSTGRES_DB=test_db \
        -e POSTGRES_USER=test_user \
        -e POSTGRES_PASSWORD=test_password \
        postgres:15-alpine

    # Wait for database to be ready
    sleep 10

    # Test the application container
    docker run --rm \
        --name "$APP_NAME-test" \
        --network "$APP_NAME-test-network" \
        -e NODE_ENV=production \
        -e DATABASE_URL="postgresql://test_user:test_password@$APP_NAME-test-db:5432/test_db" \
        -e NEXTAUTH_SECRET="test-secret" \
        -e NEXTAUTH_URL="http://localhost:3000" \
        -p 3001:3000 \
        -d \
        "$DOCKER_IMAGE_NAME:$DOCKER_TAG"

    # Wait for app to start
    sleep 15

    # Test health endpoint
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        log_success "Health check passed!"
    else
        log_error "Health check failed!"
        # Cleanup
        docker stop "$APP_NAME-test" 2>/dev/null || true
        docker stop "$APP_NAME-test-db" 2>/dev/null || true
        docker rm "$APP_NAME-test-db" 2>/dev/null || true
        docker network rm "$APP_NAME-test-network" 2>/dev/null || true
        exit 1
    fi

    # Cleanup test containers
    docker stop "$APP_NAME-test" 2>/dev/null || true
    docker stop "$APP_NAME-test-db" 2>/dev/null || true
    docker rm "$APP_NAME-test-db" 2>/dev/null || true
    docker network rm "$APP_NAME-test-network" 2>/dev/null || true

    log_success "Docker deployment test completed successfully!"

    # Production deployment with docker-compose
    if [ "$ENVIRONMENT" = "production" ]; then
        log_info "Deploying to production with docker-compose..."
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

        # Run database migrations
        log_info "Running database migrations..."
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec -T app npx prisma migrate deploy

        log_success "Production deployment completed!"
    fi
}

# Vercel deployment
deploy_vercel() {
    if ! command_exists vercel; then
        log_error "Vercel CLI not found. Please install it with: npm i -g vercel"
        exit 1
    fi

    log_info "Deploying to Vercel..."

    # Set environment variables for Vercel
    vercel env add NODE_ENV production || log_warning "NODE_ENV already exists"

    # Deploy based on environment
    if [ "$ENVIRONMENT" = "production" ]; then
        vercel --prod
    else
        vercel
    fi

    log_success "Vercel deployment completed!"
}

# Railway deployment
deploy_railway() {
    if ! command_exists railway; then
        log_error "Railway CLI not found. Please install it with: npm i -g @railway/cli"
        exit 1
    fi

    log_info "Deploying to Railway..."

    # Login check
    if ! railway whoami > /dev/null 2>&1; then
        log_error "Please login to Railway first: railway login"
        exit 1
    fi

    # Deploy
    railway up

    log_success "Railway deployment completed!"
}

# DigitalOcean App Platform deployment
deploy_digitalocean() {
    if ! command_exists doctl; then
        log_error "DigitalOcean CLI (doctl) not found. Please install it first."
        exit 1
    fi

    log_info "Deploying to DigitalOcean App Platform..."

    # Create app spec if it doesn't exist
    if [ ! -f ".do/app.yaml" ]; then
        mkdir -p .do
        cat > .do/app.yaml << EOF
name: $APP_NAME
services:
- name: web
  source_dir: /
  github:
    repo: your-org/your-repo
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  http_port: 3000
  env:
  - key: NODE_ENV
    value: production
databases:
- name: db
  engine: PG
  version: "13"
EOF
        log_info "Created .do/app.yaml - please update it with your repository information"
    fi

    # Deploy using the app spec
    doctl apps create --spec .do/app.yaml

    log_success "DigitalOcean deployment initiated!"
}

# Database migration for production
run_migrations() {
    if [ "$ENVIRONMENT" = "production" ]; then
        log_info "Running production database migrations..."

        case $PLATFORM in
            "docker")
                docker-compose exec -T app npx prisma migrate deploy
                ;;
            "vercel")
                # Vercel handles this in build process
                log_info "Database migrations handled by Vercel build process"
                ;;
            *)
                npx prisma migrate deploy
                ;;
        esac

        log_success "Database migrations completed!"
    fi
}

# Main deployment logic
main() {
    log_info "Environment: $ENVIRONMENT"
    log_info "Platform: $PLATFORM"
    log_info "Build time: $BUILD_TIME"

    # Check environment variables
    check_env_vars

    # Build and test
    build_and_test

    # Deploy based on platform
    case $PLATFORM in
        "docker")
            deploy_docker
            ;;
        "vercel")
            deploy_vercel
            ;;
        "railway")
            deploy_railway
            ;;
        "digitalocean")
            deploy_digitalocean
            ;;
        *)
            log_error "Unsupported platform: $PLATFORM"
            log_info "Supported platforms: docker, vercel, railway, digitalocean"
            exit 1
            ;;
    esac

    # Run migrations
    run_migrations

    log_success "🎉 Deployment completed successfully!"

    # Show deployment info
    echo ""
    echo -e "${BLUE}📋 Deployment Summary:${NC}"
    echo -e "  Environment: ${GREEN}$ENVIRONMENT${NC}"
    echo -e "  Platform: ${GREEN}$PLATFORM${NC}"
    echo -e "  Build time: ${GREEN}$BUILD_TIME${NC}"

    if [ "$PLATFORM" = "docker" ]; then
        echo -e "  Docker image: ${GREEN}$DOCKER_IMAGE_NAME:$DOCKER_TAG${NC}"
        echo -e "  Image size: ${GREEN}$IMAGE_SIZE${NC}"
    fi
}

# Run main function
main "$@"