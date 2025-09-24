---
created: 2025-09-24T19:03:07Z
last_updated: 2025-09-24T19:03:07Z
version: 1.0
author: Claude Code PM System
---

# Project Style Guide

## Code Style

### General Principles

- **Readability First**: Code should be self-documenting
- **Consistency**: Follow established patterns throughout
- **Simplicity**: Avoid clever tricks, prefer clarity
- **Standards**: Use platform conventions over custom abstractions

### JavaScript Conventions

#### Naming Conventions

```javascript
// Files and folders: kebab-case
user - profile.js;
api - routes / auth - middleware.js;

// React Components: PascalCase file and export
UserProfile.jsx;
export default function UserProfile() {}

// Functions: camelCase
function getUserById() {}
const handleSubmit = () => {};

// Constants: UPPER_SNAKE_CASE
const MAX_LOGIN_ATTEMPTS = 5;
const API_BASE_URL = '/api';

// Variables: camelCase
const userName = 'John';
let isAuthenticated = false;

// Private functions/variables: leading underscore
const _internalHelper = () => {};
```

#### Function Style

```javascript
// Prefer arrow functions for callbacks and handlers
const handleClick = event => {
  event.preventDefault();
  // logic
};

// Use regular functions for components and utilities
function UserCard({ user }) {
  return <div>{user.name}</div>;
}

async function fetchUserData(id) {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

// Single parameter: omit parentheses
items.map(item => item.id);

// Implicit return for single expressions
const getName = user => user.name;
```

#### Variable Declarations

```javascript
// Use const by default
const API_KEY = process.env.API_KEY;

// Use let only when reassignment needed
let count = 0;
count += 1;

// Never use var
// var oldStyle = 'avoid'; // ❌

// Destructuring when applicable
const { name, email } = user;
const [first, ...rest] = items;
```

#### Async/Await

```javascript
// Always use async/await over promises
async function getUser(id) {
  try {
    const user = await db.user.findUnique({ where: { id } });
    return user;
  } catch (error) {
    console.error('Failed to get user:', error);
    throw error;
  }
}

// Parallel operations
const [users, posts] = await Promise.all([getUsers(), getPosts()]);
```

### React/Next.js Patterns

#### Component Structure

```javascript
// 1. Imports
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// 2. Types/Constants
const ITEMS_PER_PAGE = 10;

// 3. Component
export default function ComponentName({ props }) {
  // 4. State
  const [state, setState] = useState(initialValue);

  // 5. Effects
  useEffect(() => {
    // effect logic
  }, [dependencies]);

  // 6. Handlers
  const handleAction = () => {
    // handler logic
  };

  // 7. Render
  return <div>{/* JSX */}</div>;
}

// 8. Sub-components (if any)
function SubComponent() {
  return <div>Sub</div>;
}
```

#### Server vs Client Components

```javascript
// Server Component (default)
// app/users/page.js
export default async function UsersPage() {
  const users = await getUsers(); // Direct data fetching
  return <UserList users={users} />;
}

// Client Component (when needed)
// components/interactive-form.js
'use client';

import { useState } from 'react';

export default function InteractiveForm() {
  const [value, setValue] = useState('');
  // Client-side logic
}
```

#### Props and State

```javascript
// Props destructuring
function UserCard({ name, email, avatar = '/default.png' }) {
  return (
    <div>
      <img src={avatar} alt={name} />
      <h3>{name}</h3>
      <p>{email}</p>
    </div>
  );
}

// State management
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

### CSS/Styling Conventions

#### Tailwind CSS Usage

```jsx
// Use Tailwind utility classes
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h2 className="text-lg font-semibold text-gray-900">Title</h2>
  <Button className="ml-auto">Action</Button>
</div>

// Group related utilities
<div className="
  flex items-center justify-center
  w-full h-screen
  bg-gradient-to-br from-blue-50 to-indigo-100
">

// Use cn() utility for conditional classes
import { cn } from '@/lib/utils';

<div className={cn(
  "p-4 rounded-lg",
  isActive && "bg-blue-500",
  hasError && "border-red-500"
)}>
```

#### Component Styling

```javascript
// Prefer composition over custom CSS
// ✅ Good
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// ❌ Avoid custom CSS when possible
<div style={{ padding: '1rem', border: '1px solid #ccc' }}>
```

### File Organization

#### Directory Structure

```
app/
├── (auth)/              # Route groups
│   ├── login/
│   └── register/
├── (dashboard)/
│   └── dashboard/
├── api/                 # API routes
│   └── auth/
└── layout.js           # Root layout

components/
├── ui/                 # shadcn/ui components
│   ├── button.jsx
│   └── card.jsx
├── forms/              # Form components
│   └── login-form.jsx
└── layouts/            # Layout components
    └── sidebar.jsx

lib/
├── auth/               # Authentication utilities
├── db/                 # Database utilities
└── utils/              # General utilities
```

#### Import Organization

```javascript
// 1. React/Next.js imports
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// 2. Third-party libraries
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';

// 3. UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// 4. Custom Components
import { UserCard } from '@/components/user-card';
import { Header } from '@/components/header';

// 5. Utilities and lib
import { cn } from '@/lib/utils';
import { validateEmail } from '@/lib/validators';

// 6. Styles (if any)
import styles from './component.module.css';
```

### Database/Prisma Conventions

#### Schema Naming

```prisma
// Models: PascalCase singular
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations: camelCase
  posts     Post[]
  profile   Profile?
}

// Fields: camelCase
model Post {
  id          String   @id @default(cuid())
  title       String
  content     String?
  isPublished Boolean  @default(false)
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
}
```

#### Query Patterns

```javascript
// Use specific selects
const user = await prisma.user.findUnique({
  where: { id },
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
});

// Include relations when needed
const userWithPosts = await prisma.user.findUnique({
  where: { id },
  include: {
    posts: {
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    },
  },
});
```

### API Conventions

#### Route Naming

```
GET    /api/users       # List users
GET    /api/users/[id]  # Get single user
POST   /api/users       # Create user
PUT    /api/users/[id]  # Update user
DELETE /api/users/[id]  # Delete user
```

#### Response Format

```javascript
// Success response
return Response.json(
  {
    data: userData,
    message: 'User created successfully',
  },
  { status: 200 }
);

// Error response
return Response.json(
  {
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Invalid email format',
      field: 'email',
    },
  },
  { status: 400 }
);

// List response with pagination
return Response.json({
  data: users,
  pagination: {
    page: 1,
    limit: 10,
    total: 100,
    pages: 10,
  },
});
```

### Error Handling

#### Try-Catch Pattern

```javascript
async function riskyOperation() {
  try {
    const result = await performOperation();
    return { success: true, data: result };
  } catch (error) {
    console.error('Operation failed:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
    };
  }
}
```

#### Form Validation

```javascript
const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

function validateInput(data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }
  return { data: result.data };
}
```

### Comments and Documentation

#### Code Comments

```javascript
// Use comments sparingly, prefer self-documenting code

// ✅ Good: Explains why, not what
// Rate limit to prevent brute force attacks
const MAX_ATTEMPTS = 5;

// ❌ Bad: States the obvious
// Set user name
const userName = 'John';

// TODO: Implement caching for better performance
// FIXME: Handle edge case when user has no posts
// NOTE: This uses the legacy API for backwards compatibility
```

#### JSDoc for Utilities

```javascript
/**
 * Hashes a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}
```

### Git Commit Conventions

#### Commit Message Format

```
type: brief description

Longer explanation if needed

Fixes #123
```

#### Commit Types

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

#### Examples

```
feat: add user authentication with NextAuth

Implements email/password authentication using NextAuth.js
with Prisma adapter for session storage.

fix: prevent duplicate email registration

docs: update README with deployment instructions

refactor: simplify user profile component

chore: update dependencies to latest versions
```

### Testing Conventions (Future)

#### Test File Naming

```
component.test.js      # Unit tests
component.spec.js      # Integration tests
component.e2e.js       # End-to-end tests
```

#### Test Structure

```javascript
describe('UserProfile', () => {
  it('should display user name', () => {
    // Arrange
    const user = { name: 'John Doe' };

    // Act
    const { getByText } = render(<UserProfile user={user} />);

    // Assert
    expect(getByText('John Doe')).toBeInTheDocument();
  });
});
```

## Quality Standards

### Performance

- Lazy load components when appropriate
- Use Next.js Image for optimized images
- Implement proper caching strategies
- Minimize bundle size

### Accessibility

- Use semantic HTML
- Include proper ARIA labels
- Ensure keyboard navigation
- Test with screen readers

### Security

- Validate all inputs
- Sanitize user content
- Use environment variables for secrets
- Implement proper authentication

### Code Review Checklist

- [ ] Code follows style guide
- [ ] No console.logs in production code
- [ ] Error handling implemented
- [ ] Performance considered
- [ ] Accessibility checked
- [ ] Security reviewed
- [ ] Tests written (when applicable)
- [ ] Documentation updated
