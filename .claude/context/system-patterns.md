---
created: 2025-09-24T19:03:07Z
last_updated: 2025-09-24T19:03:07Z
version: 1.0
author: Claude Code PM System
---

# System Patterns

## Architectural Patterns

### Current CCPM System Architecture

- **Script-Based Architecture**: Shell scripts for all operations
- **File-Based Storage**: Markdown files for data persistence
- **Command Pattern**: Individual scripts for specific operations
- **Pipeline Pattern**: Scripts can be chained together

### Planned Application Architecture

#### Overall Architecture: Monolithic with Modular Design

- **Pattern**: Modular monolith
- **Reasoning**: Simplicity for self-hosting, easier deployment
- **Structure**: Clear module boundaries within single codebase

#### Frontend Patterns

##### 1. Server Components First

```javascript
// Default pattern: Server Component
export default async function UserList() {
  const users = await db.user.findMany();
  return <UserTable users={users} />;
}
```

##### 2. Client Components for Interactivity

```javascript
'use client';
// Only when client-side state needed
export default function InteractiveForm() {
  const [state, setState] = useState();
  // Interactive logic
}
```

##### 3. Composite Component Pattern

```javascript
// Compound components for complex UI
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Content>Content</Card.Content>
  <Card.Footer>Actions</Card.Footer>
</Card>
```

#### Backend Patterns

##### 1. Repository Pattern (via Prisma)

```javascript
// Data access abstracted through Prisma
const userRepository = {
  findAll: () => prisma.user.findMany(),
  findById: id => prisma.user.findUnique({ where: { id } }),
  create: data => prisma.user.create({ data }),
  update: (id, data) => prisma.user.update({ where: { id }, data }),
};
```

##### 2. Service Layer Pattern

```javascript
// Business logic in service layer
class AuthService {
  async register(email, password) {
    const hashedPassword = await hash(password);
    const user = await userRepository.create({
      email,
      password: hashedPassword,
    });
    await emailService.sendWelcome(user);
    return user;
  }
}
```

##### 3. Middleware Pattern

```javascript
// Authentication middleware
export function withAuth(handler) {
  return async (req, res) => {
    const session = await getSession(req);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return handler(req, res, session);
  };
}
```

## Design Patterns

### Authentication Flow

```
User Registration:
1. User submits form → Server Action
2. Validate input (Zod schema)
3. Hash password (bcrypt)
4. Create user (Prisma)
5. Send welcome email (Nodemailer)
6. Auto-login (NextAuth)
7. Redirect to dashboard
```

### Data Flow Patterns

#### Read Operations

```
Client Request → Server Component → Prisma Query → Database
                                 ↓
                        Cached Response ← React Render
```

#### Write Operations

```
Form Submit → Server Action → Validation → Database Update
            ↓                           ↓
     Revalidate Cache            Return Response
```

### Content Management Pattern

```
MDX File → Gray Matter Parser → Metadata Extraction
        ↓                    ↓
  MDX Compiler         Dynamic Route Generation
        ↓                    ↓
  React Component      SEO Metadata
```

## Code Organization Patterns

### Feature-Based Structure

```
features/
├── auth/
│   ├── components/
│   ├── actions/
│   ├── lib/
│   └── hooks/
├── dashboard/
│   ├── components/
│   ├── actions/
│   └── lib/
└── blog/
    ├── components/
    └── lib/
```

### Naming Conventions

- **Files**: kebab-case for files (`user-profile.jsx`)
- **Components**: PascalCase (`UserProfile`)
- **Functions**: camelCase (`getUserById`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_LOGIN_ATTEMPTS`)
- **CSS Classes**: kebab-case via Tailwind

### Import Organization

```javascript
// 1. React/Next imports
import { useState } from 'react';
import Link from 'next/link';

// 2. Third-party libraries
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// 3. Local components
import { Button } from '@/components/ui/button';
import { UserCard } from '@/components/user-card';

// 4. Utilities and helpers
import { cn } from '@/lib/utils';
import { validateEmail } from '@/lib/validators';

// 5. Types (if TypeScript)
import type { User } from '@/types';
```

## Error Handling Patterns

### Global Error Boundary

```javascript
// app/error.js
export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

### API Error Responses

```javascript
// Consistent error format
{
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid input',
    details: {
      field: 'email',
      issue: 'Invalid format'
    }
  }
}
```

### Form Validation Pattern

```javascript
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

async function handleSubmit(formData) {
  const result = schema.safeParse(formData);
  if (!result.success) {
    return { error: result.error.flatten() };
  }
  // Process valid data
}
```

## Security Patterns

### Input Sanitization

- All user inputs validated with Zod schemas
- SQL injection prevented by Prisma parameterized queries
- XSS prevented by React's default escaping

### Authentication Security

```javascript
// Password hashing
const hashedPassword = await bcrypt.hash(password, 12);

// Session validation
const session = await getServerSession(authOptions);
if (!session) {
  redirect('/login');
}

// CSRF protection via NextAuth
```

### Environment Variables

```javascript
// Validation pattern
const env = z
  .object({
    DATABASE_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(32),
    SMTP_HOST: z.string(),
  })
  .parse(process.env);
```

## Performance Patterns

### Caching Strategy

```javascript
// Static generation for content
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map(post => ({ slug: post.slug }));
}

// Revalidation
export const revalidate = 3600; // 1 hour
```

### Lazy Loading

```javascript
// Dynamic imports for code splitting
const HeavyComponent = dynamic(() => import('@/components/heavy-component'), {
  loading: () => <Skeleton />,
});
```

### Database Optimization

```javascript
// Efficient queries with Prisma
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    profile: {
      select: {
        name: true,
        avatar: true,
      },
    },
  },
  take: 10,
});
```

## Deployment Patterns

### Docker Multi-Stage Build

```dockerfile
# Dependencies
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm run build

# Runner
FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=deps /app/node_modules ./node_modules
CMD ["npm", "start"]
```

### Health Check Pattern

```javascript
// app/api/health/route.js
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ status: 'healthy' });
  } catch (error) {
    return Response.json({ status: 'unhealthy' }, { status: 503 });
  }
}
```

## Testing Patterns (Future Enhancement)

### Unit Testing Structure

```javascript
describe('UserService', () => {
  it('should hash password on registration', async () => {
    // Test implementation
  });
});
```

### Integration Testing

```javascript
describe('API Routes', () => {
  it('should require authentication', async () => {
    const res = await fetch('/api/users');
    expect(res.status).toBe(401);
  });
});
```

## Monitoring Patterns

### Structured Logging

```javascript
const logger = {
  info: (message, meta) =>
    console.log(JSON.stringify({ level: 'info', message, ...meta })),
  error: (message, error) =>
    console.error(
      JSON.stringify({ level: 'error', message, error: error.stack })
    ),
};
```

### Performance Monitoring

```javascript
// API route timing
export async function GET(req) {
  const start = Date.now();
  const result = await processRequest(req);
  const duration = Date.now() - start;
  logger.info('Request processed', { duration, path: req.url });
  return result;
}
```
