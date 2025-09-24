---
created: 2025-09-24T19:03:07Z
last_updated: 2025-09-24T19:03:07Z
version: 1.0
author: Claude Code PM System
---

# Technology Context

## Current Stack

### Project Management System (CCPM)
- **Shell Scripting**: Bash scripts for automation
- **GitHub CLI**: `gh` command for issue management
- **Git**: Version control system
- **Markdown**: Documentation format for PRDs, Epics, and tasks

### Development Environment
- **Platform**: macOS Darwin 24.6.0
- **Repository**: GitHub (ranaroussi/ccpm-demo)
- **Directory**: /Users/ran/Desktop/ccpm/project

## Planned Technology Stack

### Core Framework
- **Next.js 15**: React framework with App Router
  - Server Components by default
  - Built-in optimizations
  - File-based routing
  - API routes support

### Authentication
- **NextAuth.js v5**: Complete authentication solution
  - Credentials provider for username/password
  - Session management
  - JWT tokens
  - Built-in security features
  - Password reset flows

### Database
- **Prisma ORM**: Type-safe database toolkit
  - Schema definition
  - Auto-generated client
  - Migration system
  - Connection pooling

- **PostgreSQL**: Production database
  - Robust and scalable
  - Full-text search capabilities
  - JSON support

- **SQLite**: Development database
  - Zero configuration
  - File-based storage
  - Easy local development

### UI & Styling
- **shadcn/ui**: Component library
  - Built on Radix UI primitives
  - Fully accessible
  - Customizable with Tailwind CSS
  - Production-ready components

- **Tailwind CSS**: Utility-first CSS framework
  - JIT compilation
  - Responsive design
  - Dark mode support
  - Custom configurations

- **Radix UI**: Unstyled, accessible components
  - Dialog, Dropdown, Tooltip, etc.
  - WAI-ARIA compliant
  - Keyboard navigation

### Content Management
- **MDX**: Markdown with JSX
  - Component embedding in content
  - Syntax highlighting
  - Frontmatter support

- **@next/mdx**: Next.js MDX integration
- **gray-matter**: Frontmatter parsing
- **next-mdx-remote**: Dynamic MDX rendering

### Forms & Validation
- **react-hook-form**: Form state management
  - Performance optimized
  - Built-in validation
  - TypeScript support

- **zod**: Schema validation
  - Type inference
  - Composable schemas
  - Error messages

- **@hookform/resolvers**: Integration layer

### Email Service
- **Nodemailer**: Email sending library
  - SMTP support
  - HTML templates
  - Attachments

- **react-email**: Email template components
  - React-based templates
  - Preview functionality
  - Responsive designs

### Development Tools
- **ESLint**: Code linting
  - Next.js config preset
  - Custom rules

- **Prettier**: Code formatting
  - Consistent style
  - Auto-formatting

### Deployment
- **Docker**: Containerization
  - Multi-stage builds
  - Production optimization
  - Environment isolation

- **docker-compose**: Multi-container orchestration
  - Database service
  - Application service
  - Network configuration

## Dependencies

### Core Dependencies (package.json)
```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "next-auth": "^5.0.0",
    "@auth/prisma-adapter": "latest",
    "prisma": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "@next/mdx": "^14.0.0",
    "gray-matter": "^4.0.3",
    "nodemailer": "^6.9.0",
    "react-email": "latest",
    "bcryptjs": "^2.4.3",
    "react-hook-form": "^7.0.0",
    "@hookform/resolvers": "^3.0.0",
    "zod": "^3.0.0"
  }
}
```

### UI Dependencies
```json
{
  "dependencies": {
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "tailwindcss-animate": "^1.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "@radix-ui/react-dialog": "latest",
    "@radix-ui/react-dropdown-menu": "latest",
    "@radix-ui/react-label": "latest",
    "@radix-ui/react-select": "latest",
    "@radix-ui/react-slot": "latest",
    "@radix-ui/react-toast": "latest"
  }
}
```

### Development Dependencies
```json
{
  "devDependencies": {
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0",
    "prettier": "^3.0.0",
    "@types/node": "^20.0.0",
    "@types/bcryptjs": "^2.4.0",
    "@types/nodemailer": "^6.4.0"
  }
}
```

## System Requirements

### Development Environment
- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher (or yarn/pnpm)
- **Git**: 2.0.0 or higher
- **OS**: macOS, Linux, or Windows with WSL

### Production Environment
- **Node.js**: 18.0.0 or higher
- **PostgreSQL**: 13.0 or higher
- **Docker**: 20.10 or higher (optional)
- **RAM**: Minimum 512MB, recommended 1GB+
- **Storage**: Minimum 1GB for application and dependencies

## External Services

### Required Services
1. **PostgreSQL Database**
   - Production data storage
   - Can use managed services (Supabase, Neon, etc.)

2. **SMTP Service**
   - Email sending capability
   - Options: SendGrid, Postmark, AWS SES, custom SMTP

### Optional Services
1. **CDN**: For static asset delivery
2. **Monitoring**: Application performance monitoring
3. **Analytics**: User behavior tracking
4. **Backup**: Database backup service

## Development Tools Configuration

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Email
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="user@example.com"
SMTP_PASS="password"
SMTP_FROM="noreply@example.com"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="SaaS Starter"
```

### Docker Configuration
- Multi-stage build for optimization
- Alpine Linux base image
- Non-root user execution
- Health check endpoints
- Volume mounts for data persistence

### Performance Targets
- **Build Time**: < 2 minutes
- **Docker Image Size**: < 100MB
- **Cold Start**: < 3 seconds
- **API Response Time**: < 200ms average
- **Lighthouse Score**: > 90

## Security Considerations

### Authentication Security
- Password hashing with bcrypt
- Secure session management
- CSRF protection
- Rate limiting on auth endpoints

### Data Security
- Environment variable management
- SQL injection prevention via Prisma
- XSS protection via React
- HTTPS enforcement in production

### Deployment Security
- Docker security scanning
- Non-root container execution
- Secret management
- Regular dependency updates