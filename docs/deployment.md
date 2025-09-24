# Deployment Guide

This guide covers how to deploy your SaaS Starter application using Docker and various cloud platforms.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Docker Deployment](#docker-deployment)
4. [Platform-Specific Deployments](#platform-specific-deployments)
   - [Vercel](#vercel)
   - [Railway](#railway)
   - [DigitalOcean](#digitalocean)
   - [AWS](#aws)
5. [Database Migrations](#database-migrations)
6. [Monitoring and Health Checks](#monitoring-and-health-checks)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- Node.js 20+
- Docker and Docker Compose
- Git
- Platform-specific CLI tools (Vercel CLI, Railway CLI, etc.)

## Environment Configuration

### Required Environment Variables

Create a `.env.production` file with the following variables:

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=SaaS Starter
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# Authentication
NEXTAUTH_SECRET=your-super-secret-32-character-minimum
NEXTAUTH_URL=https://your-domain.com

# Email (Optional)
EMAIL_FROM=noreply@yourdomain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Payment (Optional)
STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key

# Analytics (Optional)
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

### Security Considerations

- **Never commit sensitive environment variables to version control**
- Use platform-specific secret management
- Rotate secrets regularly
- Use strong, unique passwords for database connections

## Docker Deployment

### Quick Start

1. **Clone and setup:**
   ```bash
   git clone <your-repo>
   cd <project-directory>
   cp .env.example .env.production
   # Edit .env.production with your values
   ```

2. **Deploy using our script:**
   ```bash
   ./scripts/deploy.sh production docker
   ```

### Manual Docker Deployment

1. **Build the image:**
   ```bash
   docker build -t saas-starter:latest .
   ```

2. **Check image size:**
   ```bash
   docker images saas-starter:latest
   # Should be < 100MB for optimal performance
   ```

3. **Run with docker-compose:**
   ```bash
   # Development
   docker-compose up -d

   # Production
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

### Docker Image Optimization

Our multi-stage Dockerfile is optimized for minimal size:

- Uses `node:20-alpine` base image
- Multi-stage build separating dependencies, build, and runtime
- Only production dependencies in final image
- Non-root user for security
- Built-in health checks

**Expected image size: ~80-95MB**

## Platform-Specific Deployments

### Vercel

Vercel is recommended for its seamless Next.js integration.

#### Prerequisites
```bash
npm install -g vercel
vercel login
```

#### Deployment Steps

1. **Configure project:**
   ```bash
   vercel
   # Follow the interactive setup
   ```

2. **Set environment variables:**
   ```bash
   vercel env add NODE_ENV
   vercel env add DATABASE_URL
   vercel env add NEXTAUTH_SECRET
   vercel env add NEXTAUTH_URL
   # Add other variables as needed
   ```

3. **Deploy:**
   ```bash
   # Staging
   vercel

   # Production
   vercel --prod
   ```

#### Using the Deploy Script
```bash
./scripts/deploy.sh production vercel
```

#### Vercel Configuration

Create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "crons": []
}
```

### Railway

Railway offers excellent PostgreSQL integration and simple deployment.

#### Prerequisites
```bash
npm install -g @railway/cli
railway login
```

#### Deployment Steps

1. **Initialize project:**
   ```bash
   railway init
   ```

2. **Add PostgreSQL:**
   ```bash
   railway add postgresql
   ```

3. **Set environment variables:**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set NEXTAUTH_SECRET=your-secret
   # Railway automatically provides DATABASE_URL
   ```

4. **Deploy:**
   ```bash
   railway up
   ```

#### Using the Deploy Script
```bash
./scripts/deploy.sh production railway
```

### DigitalOcean

DigitalOcean App Platform provides managed deployment with integrated databases.

#### Prerequisites
```bash
# Install doctl CLI
wget https://github.com/digitalocean/doctl/releases/download/v1.94.0/doctl-1.94.0-linux-amd64.tar.gz
tar xf doctl-1.94.0-linux-amd64.tar.gz
sudo mv doctl /usr/local/bin
doctl auth init
```

#### Deployment Steps

1. **Create app specification:**
   ```yaml
   # .do/app.yaml
   name: saas-starter
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
   ```

2. **Deploy:**
   ```bash
   doctl apps create --spec .do/app.yaml
   ```

#### Using the Deploy Script
```bash
./scripts/deploy.sh production digitalocean
```

### AWS (Manual Setup)

For AWS deployment, you can use:
- **Elastic Beanstalk** for simple deployment
- **ECS Fargate** for containerized deployment
- **Lambda + API Gateway** for serverless

#### ECS Fargate Example

1. **Push image to ECR:**
   ```bash
   aws ecr create-repository --repository-name saas-starter
   docker tag saas-starter:latest <account-id>.dkr.ecr.<region>.amazonaws.com/saas-starter:latest
   docker push <account-id>.dkr.ecr.<region>.amazonaws.com/saas-starter:latest
   ```

2. **Create ECS task definition and service**
3. **Configure RDS for PostgreSQL**
4. **Set up Application Load Balancer**

## Database Migrations

### Development
```bash
npx prisma migrate dev --name init
```

### Production

**Important: Always backup your database before running migrations in production.**

```bash
# Using our deploy script (recommended)
./scripts/deploy.sh production <platform>

# Manual migration
npx prisma migrate deploy
```

### Migration Best Practices

1. **Test migrations thoroughly in staging**
2. **Create database backups before migrations**
3. **Use transactions for complex migrations**
4. **Monitor migration performance**
5. **Have a rollback plan**

## Monitoring and Health Checks

### Health Check Endpoint

The application includes a comprehensive health check at `/api/health`:

```bash
curl https://your-domain.com/api/health
```

**Response format:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0",
  "checks": {
    "database": "healthy",
    "memory": "healthy"
  },
  "responseTime": "45ms",
  "memory": {
    "rss": 85.43,
    "heapTotal": 45.67,
    "heapUsed": 23.45,
    "external": 12.34
  }
}
```

### Monitoring Setup

1. **Application Performance Monitoring:**
   - Consider Vercel Analytics (for Vercel)
   - DataDog, New Relic, or similar

2. **Error Tracking:**
   - Sentry integration recommended
   - Configure error boundaries in React components

3. **Log Aggregation:**
   - Platform-specific logging (Vercel Functions, Railway logs)
   - External services like Papertrail or Logtail

### Alerts and Notifications

Set up alerts for:
- Application downtime (health check failures)
- High error rates
- Performance degradation
- Database connection issues

## Troubleshooting

### Common Issues

#### Docker Build Failures

**Issue:** Build fails with "out of space" error
```bash
# Solution: Clean Docker cache
docker system prune -a
```

**Issue:** Image size too large
```bash
# Check what's taking space
docker history saas-starter:latest
# Review Dockerfile for optimization opportunities
```

#### Database Connection Issues

**Issue:** `P1001: Can't reach database server`
```bash
# Check DATABASE_URL format
# Ensure database is accessible from application
# Verify firewall rules
```

#### Environment Variable Issues

**Issue:** Variables not loading
```bash
# Check .env file format (no spaces around =)
# Verify environment-specific files (.env.production)
# Check platform-specific variable settings
```

#### Memory Issues

**Issue:** Application running out of memory
```bash
# Check memory usage in health endpoint
# Review Docker container memory limits
# Profile application for memory leaks
```

### Debugging Commands

```bash
# Check application logs
docker-compose logs app

# Connect to running container
docker exec -it <container-id> sh

# Check database connection
docker-compose exec app npx prisma db push --preview-feature

# Monitor resource usage
docker stats

# Test health endpoint locally
curl http://localhost:3000/api/health
```

### Performance Optimization

1. **Database:**
   - Index frequently queried columns
   - Use connection pooling
   - Monitor slow queries

2. **Caching:**
   - Implement Redis caching
   - Use Next.js built-in caching
   - CDN for static assets

3. **Bundle Size:**
   - Analyze bundle with `npm run analyze`
   - Implement code splitting
   - Remove unused dependencies

## CI/CD Pipeline

The repository includes GitHub Actions workflows for:

- **Continuous Integration** (`.github/workflows/ci.yml`)
- **Deployment Pipeline** (`.github/workflows/deploy.yml`)

### Required Secrets

Set these in your GitHub repository settings:

```bash
# For Vercel
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id

# For Railway
RAILWAY_TOKEN=your_railway_token

# For Docker deployment
DEPLOY_SSH_PRIVATE_KEY=your_ssh_private_key
```

### Pipeline Features

- Automated testing and linting
- Security scanning with Trivy
- Docker image building and testing
- Multi-environment deployment
- Performance testing with Lighthouse
- Deployment notifications

## Security Checklist

Before deploying to production:

- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Dependencies updated
- [ ] Secrets rotated
- [ ] Backup strategy implemented
- [ ] Monitoring configured
- [ ] Error tracking setup
- [ ] Performance baselines established

## Support

For deployment issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Review platform-specific documentation
3. Check application logs
4. Test health endpoint
5. Verify environment variables

---

**Last updated:** 2024-01-01
**Version:** 1.0.0