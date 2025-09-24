# Docker Deployment Guide

Complete guide for deploying the SaaS Starter application using Docker.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Docker Configuration](#docker-configuration)
3. [Development Environment](#development-environment)
4. [Production Deployment](#production-deployment)
5. [Optimization](#optimization)
6. [Troubleshooting](#troubleshooting)

## Quick Start

```bash
# Clone the repository
git clone <your-repo-url>
cd saas-starter

# Copy environment file
cp .env.example .env

# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Docker Configuration

### Multi-Stage Dockerfile

Our Dockerfile uses a 3-stage build process:

1. **Dependencies Stage**: Installs and caches dependencies
2. **Builder Stage**: Builds the Next.js application
3. **Runner Stage**: Creates the minimal production image

```dockerfile
# Stage 1: Dependencies (node_modules caching)
FROM node:20-alpine AS deps
# Install dependencies and generate Prisma client

# Stage 2: Builder (build the application)
FROM node:20-alpine AS builder
# Build the Next.js app

# Stage 3: Runner (minimal production image)
FROM node:20-alpine AS runner
# Copy only necessary files for runtime
```

### Image Optimization Features

- **Alpine Linux**: Minimal base image (~5MB)
- **Multi-stage build**: Excludes build dependencies from final image
- **Non-root user**: Runs as `nextjs` user for security
- **Health checks**: Built-in container health monitoring
- **Optimized layers**: Proper layer caching for faster builds

**Target image size: < 100MB**

## Development Environment

### Services Included

```yaml
services:
  app:          # Next.js application
  postgres:     # PostgreSQL database
  redis:        # Cache and session store
  prisma-studio: # Database management UI (dev profile)
```

### Starting Development

```bash
# Start all services
docker-compose up -d

# Start with database GUI (Prisma Studio)
docker-compose --profile dev up -d

# View specific service logs
docker-compose logs app
docker-compose logs postgres

# Execute commands in containers
docker-compose exec app npx prisma migrate dev
docker-compose exec app npm run db:seed
```

### Development Features

- **Hot reload**: Volume mounts for live code updates
- **Database persistence**: Data persists between restarts
- **Prisma Studio**: Available at http://localhost:5555
- **Automatic migrations**: Database schema updates

### Environment Variables (Development)

```bash
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@postgres:5432/saas_starter_dev
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-change-in-production
NEXTAUTH_URL=http://localhost:3000
```

## Production Deployment

### Production Override

Use `docker-compose.prod.yml` for production-specific configurations:

```bash
# Deploy to production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Production Features

- **Resource limits**: Memory and CPU constraints
- **Health checks**: Application and database monitoring
- **Optimized PostgreSQL**: Production-tuned database configuration
- **Nginx reverse proxy**: SSL termination and load balancing
- **Redis persistence**: Durable caching and sessions
- **Scaling**: Multi-replica deployment support

### Production Environment Setup

1. **Create production environment file:**
   ```bash
   cp .env.example .env.production
   # Edit with production values
   ```

2. **Set required environment variables:**
   ```bash
   # Database
   DATABASE_URL=postgresql://user:pass@localhost:5432/prod_db
   POSTGRES_DB=saas_starter
   POSTGRES_USER=your_user
   POSTGRES_PASSWORD=secure_password

   # Application
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   NEXTAUTH_SECRET=super-secure-32-char-minimum-secret
   NEXTAUTH_URL=https://your-domain.com

   # Optional services
   STRIPE_SECRET_KEY=sk_live_your_stripe_key
   SMTP_PASSWORD=your_email_password
   ```

3. **Deploy:**
   ```bash
   ./scripts/deploy.sh production docker
   ```

### SSL Configuration

Create Nginx SSL configuration:

```bash
# Create SSL certificate directory
mkdir -p nginx/ssl

# Generate self-signed certificate (for testing)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/nginx.key \
  -out nginx/ssl/nginx.crt

# Or use Let's Encrypt (recommended for production)
# certbot certonly --webroot -w /var/www/certbot -d your-domain.com
```

## Optimization

### Build Optimization

1. **Docker Build Cache:**
   ```bash
   # Use BuildKit for better caching
   export DOCKER_BUILDKIT=1
   docker build --cache-from saas-starter:latest -t saas-starter:latest .
   ```

2. **Multi-platform builds:**
   ```bash
   docker buildx build --platform linux/amd64,linux/arm64 -t saas-starter:latest .
   ```

3. **Build arguments for optimization:**
   ```bash
   docker build --build-arg NODE_ENV=production -t saas-starter:latest .
   ```

### Runtime Optimization

1. **Memory limits:**
   ```yaml
   services:
     app:
       deploy:
         resources:
           limits:
             memory: 512M
           reservations:
             memory: 256M
   ```

2. **CPU limits:**
   ```yaml
   services:
     app:
       deploy:
         resources:
           limits:
             cpus: '0.5'
           reservations:
             cpus: '0.25'
   ```

3. **Database optimization:**
   ```yaml
   postgres:
     command: >
       postgres
       -c shared_buffers=256MB
       -c effective_cache_size=1GB
       -c max_connections=100
   ```

### Image Size Reduction

Current optimizations achieving ~80-95MB:

- ✅ Alpine Linux base image
- ✅ Multi-stage build
- ✅ Only production dependencies
- ✅ Optimized layer ordering
- ✅ Removed unnecessary files via .dockerignore

**Size breakdown:**
- Base Alpine + Node.js: ~40MB
- Application code: ~15MB
- Production dependencies: ~25-40MB
- **Total: ~80-95MB**

## Troubleshooting

### Common Issues

#### Build Failures

**Issue**: "ENOSPC: no space left on device"
```bash
# Solution: Clean Docker cache
docker system prune -a -f
docker volume prune -f
```

**Issue**: Dependencies not installing
```bash
# Check package-lock.json exists
# Clear npm cache in container
docker-compose exec app npm cache clean --force
```

#### Runtime Issues

**Issue**: Application not starting
```bash
# Check logs
docker-compose logs app

# Check health status
docker-compose ps

# Test health endpoint
curl http://localhost:3000/api/health
```

**Issue**: Database connection failed
```bash
# Check database status
docker-compose logs postgres

# Test database connection
docker-compose exec app npx prisma db push

# Check environment variables
docker-compose exec app env | grep DATABASE_URL
```

#### Memory Issues

**Issue**: Container killed due to memory limits
```bash
# Check memory usage
docker stats

# Increase memory limits in docker-compose.prod.yml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 1G  # Increase from 512M
```

### Debugging Commands

```bash
# Enter container shell
docker-compose exec app sh

# Check file system
docker-compose exec app ls -la /app

# Check environment variables
docker-compose exec app printenv

# Check process list
docker-compose exec app ps aux

# Check disk usage
docker-compose exec app df -h

# Check application logs
docker-compose logs -f app

# Check all services status
docker-compose ps

# Test database connection
docker-compose exec app npx prisma db push --preview-feature

# Check network connectivity
docker-compose exec app wget -qO- http://postgres:5432
```

### Performance Monitoring

```bash
# Monitor resource usage
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"

# Monitor logs in real-time
docker-compose logs -f --tail=100

# Health check status
curl -s http://localhost:3000/api/health | jq .

# Database performance
docker-compose exec postgres psql -U postgres -d saas_starter_dev -c "
  SELECT query, mean_exec_time, calls
  FROM pg_stat_statements
  ORDER BY mean_exec_time DESC
  LIMIT 10;"
```

## Production Checklist

Before deploying to production:

- [ ] Environment variables configured
- [ ] Database backups setup
- [ ] SSL certificates installed
- [ ] Health checks working
- [ ] Resource limits configured
- [ ] Logging configured
- [ ] Monitoring setup
- [ ] Security scan completed
- [ ] Performance testing done
- [ ] Rollback plan prepared

## Advanced Configuration

### Scaling

```yaml
# Scale application instances
services:
  app:
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
        failure_action: rollback
```

### Load Balancing

```yaml
# Nginx upstream configuration
upstream app_servers {
  server app_1:3000;
  server app_2:3000;
  server app_3:3000;
}
```

### Backup Strategy

```bash
# Database backup
docker-compose exec postgres pg_dump -U postgres saas_starter > backup.sql

# Application data backup
docker cp container_id:/app/uploads ./backups/uploads

# Full backup script
./scripts/backup.sh production
```

---

This Docker setup provides a robust, scalable deployment solution with development and production environments optimized for the SaaS Starter application.