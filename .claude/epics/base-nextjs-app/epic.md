---
name: base-nextjs-app
status: backlog
created: 2025-09-24T18:42:10Z
progress: 0%
prd: .claude/prds/base-nextjs-app.md
github: https://github.com/ranaroussi/ccpm-demo/issues/1
updated: 2025-09-24T19:02:26Z
---

# Epic: base-nextjs-app

## Overview

Build a streamlined Next.js SaaS starter that leverages existing, battle-tested libraries instead of reinventing the wheel. Focus on configuration and integration rather than building custom solutions, resulting in faster development and more maintainable code.

## Architecture Decisions

### Core Simplifications

- **Use NextAuth.js** instead of custom auth - handles sessions, JWTs, password resets, and security out of the box
- **Use Prisma** for database abstraction - automatic migrations, type safety (even in JS), and connection pooling
- **Use @next/mdx** with next-mdx-remote - built-in MDX support with minimal configuration
- **Use shadcn/ui** for UI components - production-ready, accessible components with Tailwind CSS
- **Use Nodemailer** with react-email templates - simple email setup with modern DX

### Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Auth**: NextAuth.js v5 with credentials provider
- **Database**: Prisma ORM with PostgreSQL (SQLite for dev)
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS (via shadcn/ui)
- **Content**: MDX via @next/mdx and gray-matter for frontmatter
- **Email**: Nodemailer + react-email for templates
- **Deployment**: Docker with multi-stage builds

### Design Patterns

- **Server Components by default** - better performance, simpler data fetching
- **API Routes only for mutations** - use server components for reads
- **File-based routing** - leverage Next.js conventions
- **Progressive enhancement** - works without JavaScript where possible

## Technical Approach

### Frontend Components

- **Layouts**: Root layout with navigation, dashboard layout with sidebar
- **UI Kit**: shadcn/ui components (Button, Input, Card, Alert, Dialog, Form, Table, etc.)
- **Forms**: Server actions with shadcn/ui form components and react-hook-form
- **MDX Pages**: Dynamic routes for /docs/[slug] and /blog/[slug]

### Backend Services

- **Auth API**: NextAuth.js handles /api/auth/\* endpoints automatically
- **User API**: Simple CRUD at /api/users (profile updates only)
- **Database**: Prisma schema with User, Session, and Post models
- **Email**: Server-side email sending via Nodemailer

### Infrastructure

- **Development**: SQLite database, .env.local configuration
- **Production**: PostgreSQL, environment variables, Docker deployment
- **Static Assets**: Public folder for images, automatically optimized by Next.js
- **Monitoring**: Basic health check endpoint at /api/health

## Implementation Strategy

### Development Phases

1. **Foundation First** - Next.js setup, folder structure, Tailwind
2. **Auth Early** - Get NextAuth working with database before other features
3. **Content Next** - MDX setup for documentation pages
4. **UI Last** - Build components as needed, not upfront

### Risk Mitigation

- Use stable versions of all dependencies
- Test auth flows thoroughly before adding features
- Keep Docker image minimal (<100MB)
- Document environment variables clearly

### Testing Approach

- Manual testing for initial version
- Focus on auth flow testing
- Deployment smoke tests
- Lighthouse checks for performance

## Task Breakdown Preview

High-level task categories (limited to achieve simplicity):

- [ ] **Task 1: Project Foundation** - Next.js setup with Tailwind CSS, essential folder structure, environment configuration
- [ ] **Task 2: Database & Prisma Setup** - Schema definition for users/sessions, Prisma client, migration setup
- [ ] **Task 3: NextAuth Integration** - Credentials provider, session management, protected routes middleware
- [ ] **Task 4: Core Pages & Layouts** - Landing, dashboard, auth pages (login/register/reset), basic navigation
- [ ] **Task 5: MDX Content System** - Documentation and blog routing, syntax highlighting, metadata handling
- [ ] **Task 6: shadcn/ui Setup** - Install and configure shadcn/ui components (forms, alerts, dialogs, tables)
- [ ] **Task 7: User Management** - Profile updates, password changes, admin user list view
- [ ] **Task 8: Email Integration** - Password reset emails, welcome emails with react-email templates
- [ ] **Task 9: Docker & Deployment** - Dockerfile, docker-compose, health checks, deployment guides
- [ ] **Task 10: Documentation & Polish** - README, .env.example, setup guide, basic error handling

## Dependencies

### External Service Dependencies

- PostgreSQL database (production)
- SMTP service for emails
- Docker runtime for self-hosting

### Required npm Packages

- next, react, react-dom
- next-auth, @auth/prisma-adapter
- prisma, @prisma/client
- tailwindcss, autoprefixer, tailwindcss-animate
- @next/mdx, gray-matter
- nodemailer, react-email
- bcryptjs (for password hashing)
- shadcn/ui components (via npx shadcn-ui@latest)
- class-variance-authority, clsx, tailwind-merge
- @radix-ui components (as needed)
- react-hook-form, @hookform/resolvers, zod

### Prerequisite Work

- Node.js 18+ installed
- PostgreSQL or Docker available
- SMTP credentials ready

## Success Criteria (Technical)

### Performance Benchmarks

- Lighthouse score > 90 on all pages
- Docker image < 100MB
- Cold start < 3 seconds
- Build time < 2 minutes

### Quality Gates

- All auth flows working (register, login, reset, logout)
- MDX content rendering properly
- Responsive on mobile devices
- No console errors in production

### Acceptance Criteria

- Can deploy with single docker-compose up
- New user can sign up and access dashboard
- Admin can view all users
- Documentation pages load from MDX files
- Email sends for password reset

## Estimated Effort

### Overall Timeline

- **Total Duration**: 2-3 weeks for single developer
- **Daily Commitment**: 4-6 hours/day
- **Total Hours**: 40-60 hours

### Resource Requirements

- 1 Full-stack JavaScript developer
- Basic DevOps knowledge for deployment
- Access to PostgreSQL and SMTP service

### Critical Path Items

1. NextAuth setup (blocks all auth features)
2. Prisma schema (blocks database features)
3. MDX configuration (blocks content features)
4. Docker setup (blocks deployment)

## Tasks Created

- [ ] #2 - Project Foundation (parallel: true)
- [ ] #3 - Database & Prisma Setup (parallel: false, depends on #2)
- [ ] #4 - NextAuth Integration (parallel: false, depends on #3)
- [ ] #5 - Core Pages & Layouts (parallel: true, depends on #4)
- [ ] #6 - MDX Content System (parallel: true, depends on #2)
- [ ] #7 - shadcn/ui Setup (parallel: true, depends on #2)
- [ ] #8 - User Management (parallel: false, depends on #4, #5)
- [ ] #9 - Email Integration (parallel: true, depends on #4)
- [ ] #10 - Docker & Deployment (parallel: true, depends on #2)
- [ ] #11 - Documentation & Polish (parallel: false, depends on all)

Total tasks: 10
Parallel tasks: 6
Sequential tasks: 4
Estimated total effort: 85-105 hours
