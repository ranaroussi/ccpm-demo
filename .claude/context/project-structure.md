---
created: 2025-09-24T19:03:07Z
last_updated: 2025-09-24T19:03:07Z
version: 1.0
author: Claude Code PM System
---

# Project Structure

## Root Directory Organization

```
/Users/ran/Desktop/ccpm/project/
├── .claude/                 # Claude Code PM system directory
├── .git/                    # Git repository metadata
├── .gitignore              # Git ignore rules
├── CLAUDE.md               # Claude-specific instructions (empty)
└── tmp/                    # Temporary files directory
```

## Claude PM System Structure (.claude/)

### Core Configuration

```
.claude/
├── ccpm.config             # CCPM configuration for GitHub integration
├── settings.json.example   # Example settings template
└── settings.local.json     # Local settings (modified)
```

### Project Management

```
.claude/
├── prds/                   # Product Requirements Documents
│   └── base-nextjs-app.md # Main PRD for Next.js SaaS starter
├── epics/                  # Epic definitions and task breakdowns
│   └── base-nextjs-app/    # Epic folder with tasks
│       ├── epic.md         # Epic overview and strategy
│       ├── 003.md          # NextAuth Integration task
│       ├── 004.md          # Core Pages & Layouts task
│       ├── 005.md          # MDX Content System task
│       ├── 006.md          # shadcn/ui Setup task
│       ├── 007.md          # User Management task
│       ├── 008.md          # Email Integration task
│       ├── 009.md          # Docker & Deployment task
│       ├── 010.md          # Documentation & Polish task
│       ├── 2.md            # Database & Prisma Setup task (legacy naming)
│       ├── 3.md            # Additional task (legacy naming)
│       └── 4.md            # Additional task (legacy naming)
└── context/                # Context documentation
    └── README.md           # Context system documentation
```

### Automation & Scripts

```
.claude/
├── scripts/                # Automation scripts
│   ├── pm/                # Project management scripts
│   │   ├── blocked.sh     # List blocked tasks
│   │   ├── epic-list.sh   # List all epics
│   │   ├── epic-show.sh   # Show epic details
│   │   ├── epic-status.sh # Epic status report
│   │   ├── help.sh        # PM help documentation
│   │   ├── in-progress.sh # List in-progress tasks
│   │   ├── init.sh        # Initialize PM system
│   │   ├── next.sh        # Show next tasks
│   │   ├── prd-list.sh    # List all PRDs
│   │   ├── prd-status.sh  # PRD status report
│   │   ├── search.sh      # Search PM content
│   │   ├── standup.sh     # Generate standup report
│   │   ├── status.sh      # Overall project status
│   │   └── validate.sh    # Validate PM structure
│   ├── test-and-log.sh    # Test execution with logging
│   ├── check-path-standards.sh  # Path standards checker
│   └── fix-path-standards.sh    # Path standards fixer
├── hooks/                  # Git and workflow hooks
│   └── bash-worktree-fix.sh  # Worktree fixing hook
├── commands/              # Custom Claude commands
│   └── [various commands] # Command definitions
├── agents/                # AI agent configurations
│   └── [agent configs]    # Agent definitions
└── rules/                 # Project rules and standards
    └── [rule files]       # Coding and project rules
```

## Planned Next.js Application Structure

Based on the PRD and Epic, the following structure will be created:

```
/                          # Project root (to be initialized)
├── app/                   # Next.js 15 App Router
│   ├── (auth)/           # Auth group routes
│   │   ├── login/        # Login page
│   │   ├── register/     # Registration page
│   │   └── reset/        # Password reset
│   ├── (dashboard)/      # Dashboard group routes
│   │   ├── dashboard/    # Main dashboard
│   │   ├── settings/     # User settings
│   │   └── admin/        # Admin panel
│   ├── api/              # API routes
│   │   ├── auth/[...nextauth]/  # NextAuth endpoints
│   │   ├── users/        # User management API
│   │   └── health/       # Health check endpoint
│   ├── docs/[slug]/      # MDX documentation pages
│   ├── blog/[slug]/      # MDX blog pages
│   └── layout.js         # Root layout
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   └── layout/          # Layout components
├── lib/                 # Library code
│   ├── auth/            # Authentication helpers
│   ├── db/              # Database utilities
│   └── email/           # Email templates
├── content/             # MDX content
│   ├── docs/            # Documentation MDX files
│   └── blog/            # Blog MDX files
├── prisma/              # Prisma ORM
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Database migrations
├── public/              # Static assets
├── styles/              # Global styles
│   └── globals.css      # Tailwind directives
└── config/              # Configuration files
    └── site.js          # Site configuration
```

## File Naming Conventions

### Current System Files

- **Scripts**: Kebab-case with .sh extension (e.g., `epic-status.sh`)
- **Markdown**: Kebab-case for documents, numeric for tasks (e.g., `base-nextjs-app.md`, `003.md`)
- **Configuration**: Lowercase with appropriate extension (e.g., `ccpm.config`)

### Planned Application Files

- **React Components**: PascalCase (e.g., `UserProfile.jsx`)
- **Pages/Routes**: Kebab-case folders (e.g., `/dashboard/user-settings/`)
- **API Routes**: Kebab-case (e.g., `/api/auth/login`)
- **Utilities**: camelCase (e.g., `hashPassword.js`)
- **MDX Content**: Kebab-case (e.g., `getting-started.mdx`)

## Module Organization

### Current Modules

1. **Project Management** - PRDs, Epics, Tasks
2. **Automation** - Shell scripts for PM operations
3. **Configuration** - Settings and environment config
4. **Documentation** - Context and help files

### Planned Application Modules

1. **Authentication** - NextAuth.js integration
2. **Database** - Prisma ORM with PostgreSQL
3. **UI Components** - shadcn/ui with Tailwind CSS
4. **Content Management** - MDX-based documentation
5. **Email Service** - Nodemailer with react-email
6. **Deployment** - Docker containerization

## Key Directories

### Development Focus Areas

- `.claude/prds/` - Product requirements and specifications
- `.claude/epics/` - Development tasks and tracking
- `.claude/scripts/pm/` - Project management automation

### Future Application Directories

- `app/` - Next.js application routes and pages
- `components/` - Reusable UI components
- `lib/` - Business logic and utilities
- `content/` - MDX documentation and blog posts
- `prisma/` - Database schema and migrations

## Integration Points

### Current System

- GitHub API via `gh` CLI for issue management
- Git for version control
- Shell scripts for automation

### Planned Application

- NextAuth.js for authentication
- Prisma for database access
- MDX for content management
- Docker for deployment
- Nodemailer for email service
