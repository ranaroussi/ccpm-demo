import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clean up existing data (optional - be careful in production!)
  if (process.env.NODE_ENV === 'development') {
    await prisma.postTag.deleteMany()
    await prisma.post.deleteMany()
    await prisma.tag.deleteMany()
    await prisma.session.deleteMany()
    await prisma.account.deleteMany()
    await prisma.verificationToken.deleteMany()
    await prisma.user.deleteMany()
    console.log('🗑️  Cleaned up existing data')
  }

  // Create demo users
  const hashedPassword = await hash('demo123', 12)

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      bio: 'System administrator and content creator',
      website: 'https://example.com',
      location: 'San Francisco, CA',
      plan: 'enterprise',
      isActive: true,
      emailVerified: new Date(),
    },
  })

  const demoUser = await prisma.user.create({
    data: {
      email: 'user@example.com',
      name: 'Demo User',
      password: hashedPassword,
      bio: 'A demo user for testing purposes',
      plan: 'pro',
      planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      isActive: true,
      emailVerified: new Date(),
    },
  })

  const freeUser = await prisma.user.create({
    data: {
      email: 'free@example.com',
      name: 'Free User',
      password: hashedPassword,
      bio: 'A free tier user',
      plan: 'free',
      isActive: true,
      emailVerified: new Date(),
    },
  })

  console.log('👥 Created demo users')

  // Create tags
  const tags = await Promise.all([
    prisma.tag.create({
      data: {
        name: 'Technology',
        slug: 'technology',
        description: 'Articles about technology and innovation',
        color: '#3B82F6',
      },
    }),
    prisma.tag.create({
      data: {
        name: 'Business',
        slug: 'business',
        description: 'Business insights and strategies',
        color: '#10B981',
      },
    }),
    prisma.tag.create({
      data: {
        name: 'Design',
        slug: 'design',
        description: 'UI/UX design and creative topics',
        color: '#8B5CF6',
      },
    }),
    prisma.tag.create({
      data: {
        name: 'Tutorial',
        slug: 'tutorial',
        description: 'Step-by-step tutorials and guides',
        color: '#F59E0B',
      },
    }),
    prisma.tag.create({
      data: {
        name: 'News',
        slug: 'news',
        description: 'Latest news and updates',
        color: '#EF4444',
      },
    }),
  ])

  console.log('🏷️  Created tags')

  // Create demo posts
  const posts = [
    {
      title: 'Getting Started with Our SaaS Platform',
      slug: 'getting-started-saas-platform',
      content: `
# Getting Started with Our SaaS Platform

Welcome to our amazing SaaS platform! This guide will help you get up and running quickly.

## What You'll Learn

- How to set up your account
- Basic navigation and features
- Best practices for success

## Setting Up Your Account

1. Complete your profile information
2. Choose your subscription plan
3. Invite team members

## Key Features

Our platform offers several powerful features:

- **Dashboard Analytics**: Track your performance
- **Team Collaboration**: Work together seamlessly
- **Custom Reports**: Generate insights
- **API Access**: Integrate with your tools

## Next Steps

Once you've completed the basic setup, you can:

1. Explore the dashboard
2. Create your first project
3. Invite your team
4. Start collaborating!

We're excited to have you on board!
      `,
      excerpt: 'Learn how to get started with our SaaS platform and make the most of its powerful features.',
      published: true,
      featured: true,
      metaTitle: 'Getting Started Guide - SaaS Platform',
      metaDescription: 'Complete guide to getting started with our SaaS platform. Learn setup, features, and best practices.',
      authorId: adminUser.id,
      tagIds: [tags[0].id, tags[3].id], // Technology, Tutorial
    },
    {
      title: 'Building a Successful SaaS Business',
      slug: 'building-successful-saas-business',
      content: `
# Building a Successful SaaS Business

Starting a SaaS business is exciting, but it requires careful planning and execution.

## Key Success Factors

### 1. Product-Market Fit
Finding the right market for your product is crucial for success.

### 2. Customer Acquisition
Develop a sustainable customer acquisition strategy.

### 3. Retention and Growth
Focus on keeping customers happy and growing your revenue.

## Common Mistakes to Avoid

- Ignoring customer feedback
- Scaling too early
- Underestimating competition
- Poor pricing strategy

## Conclusion

Success in SaaS requires persistence, adaptability, and a customer-first mindset.
      `,
      excerpt: 'Essential insights for building and scaling a successful SaaS business from the ground up.',
      published: true,
      featured: false,
      metaTitle: 'Building a Successful SaaS Business - Expert Guide',
      metaDescription: 'Learn the key strategies and avoid common mistakes when building your SaaS business.',
      authorId: demoUser.id,
      tagIds: [tags[1].id], // Business
    },
    {
      title: 'Modern UI Design Principles',
      slug: 'modern-ui-design-principles',
      content: `
# Modern UI Design Principles

Great UI design is the foundation of successful digital products.

## Core Principles

### 1. Simplicity
Keep interfaces clean and intuitive.

### 2. Consistency
Maintain consistent patterns throughout your application.

### 3. Accessibility
Design for all users, including those with disabilities.

## Design Systems

A well-organized design system helps maintain consistency and speeds up development.

## Tools and Resources

- Figma for design collaboration
- Component libraries
- Color palette generators
- Typography tools

Stay updated with the latest design trends while maintaining usability.
      `,
      excerpt: 'Explore essential UI design principles for creating beautiful and functional user interfaces.',
      published: true,
      featured: true,
      metaTitle: 'Modern UI Design Principles - Complete Guide',
      metaDescription: 'Learn the fundamental principles of modern UI design and how to apply them effectively.',
      authorId: adminUser.id,
      tagIds: [tags[2].id, tags[3].id], // Design, Tutorial
    },
    {
      title: 'API Integration Best Practices',
      slug: 'api-integration-best-practices',
      content: `
# API Integration Best Practices

Integrating with APIs is a common requirement in modern applications.

## Key Considerations

### Error Handling
Always implement proper error handling for API calls.

### Rate Limiting
Respect API rate limits to avoid service interruptions.

### Security
Use proper authentication and secure your API keys.

### Caching
Implement caching strategies to improve performance.

## Testing Strategies

- Unit tests for API integration logic
- Integration tests with real API endpoints
- Mock API responses for reliable testing

Following these practices will help you build robust and reliable integrations.
      `,
      excerpt: 'Learn best practices for integrating with APIs, including error handling, security, and testing.',
      published: false, // Draft post
      featured: false,
      metaTitle: 'API Integration Best Practices',
      metaDescription: 'Comprehensive guide to API integration best practices for developers.',
      authorId: demoUser.id,
      tagIds: [tags[0].id, tags[3].id], // Technology, Tutorial
    },
    {
      title: 'Latest Updates and Features',
      slug: 'latest-updates-features',
      content: `
# Latest Updates and Features

We're excited to share the latest improvements to our platform!

## New Features

### Enhanced Dashboard
- Improved performance metrics
- Customizable widgets
- Real-time updates

### Team Collaboration Tools
- Shared workspaces
- Comment system
- Version history

### API Enhancements
- New endpoints
- Better documentation
- SDK updates

## Bug Fixes

We've also fixed several issues reported by our community:
- Resolved login issues
- Fixed export functionality
- Improved mobile responsiveness

## Coming Soon

Stay tuned for these upcoming features:
- Advanced analytics
- Third-party integrations
- Mobile app

Thank you for your continued support!
      `,
      excerpt: 'Check out the latest features, improvements, and bug fixes in our platform update.',
      published: true,
      featured: false,
      metaTitle: 'Latest Platform Updates and Features',
      metaDescription: 'Discover the newest features and improvements in our latest platform update.',
      authorId: adminUser.id,
      tagIds: [tags[4].id], // News
    },
  ]

  for (const postData of posts) {
    const { tagIds, ...post } = postData
    const createdPost = await prisma.post.create({
      data: {
        ...post,
        publishedAt: post.published ? new Date() : null,
        tags: {
          create: tagIds.map(tagId => ({ tagId }))
        }
      },
    })
    console.log(`📝 Created post: ${createdPost.title}`)
  }

  // Create some sample sessions (optional)
  await prisma.session.create({
    data: {
      sessionToken: 'sample-session-token-1',
      userId: adminUser.id,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    },
  })

  console.log('🔗 Created sample session')

  console.log('✅ Database seeding completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`- Created ${await prisma.user.count()} users`)
  console.log(`- Created ${await prisma.tag.count()} tags`)
  console.log(`- Created ${await prisma.post.count()} posts`)
  console.log(`- Created ${await prisma.session.count()} sessions`)

  console.log('\n👤 Demo Accounts:')
  console.log('Admin: admin@example.com / demo123')
  console.log('Pro User: user@example.com / demo123')
  console.log('Free User: free@example.com / demo123')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })