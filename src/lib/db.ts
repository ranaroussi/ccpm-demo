import { Prisma } from '@prisma/client'
import { prisma } from './prisma'
import { hash, compare } from 'bcryptjs'

// User utilities
export const userUtils = {
  // Create a new user
  async create(data: {
    email: string
    name?: string
    password?: string
    image?: string
  }) {
    const hashedPassword = data.password ? await hash(data.password, 12) : null

    return await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true,
        plan: true,
        isActive: true,
      },
    })
  },

  // Find user by email
  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: true,
        sessions: {
          where: {
            expires: {
              gt: new Date(),
            },
          },
        },
      },
    })
  },

  // Find user by ID
  async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        bio: true,
        website: true,
        location: true,
        plan: true,
        planExpiresAt: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  },

  // Update user profile
  async updateProfile(id: string, data: Partial<{
    name: string
    bio: string
    website: string
    location: string
    image: string
  }>) {
    return await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        bio: true,
        website: true,
        location: true,
      },
    })
  },

  // Update user's last login
  async updateLastLogin(id: string) {
    return await prisma.user.update({
      where: { id },
      data: {
        lastLoginAt: new Date(),
      },
    })
  },

  // Verify password
  async verifyPassword(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        isActive: true,
      },
    })

    if (!user || !user.password || !user.isActive) {
      return null
    }

    const isValid = await compare(password, user.password)
    if (!isValid) {
      return null
    }

    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  },

  // Get user statistics
  async getStats(id: string) {
    const [postsCount, sessionsCount] = await Promise.all([
      prisma.post.count({ where: { authorId: id } }),
      prisma.session.count({ where: { userId: id } }),
    ])

    return {
      postsCount,
      sessionsCount,
    }
  },
}

// Session utilities
export const sessionUtils = {
  // Create a new session
  async create(data: {
    sessionToken: string
    userId: string
    expires: Date
    ipAddress?: string
    userAgent?: string
  }) {
    return await prisma.session.create({
      data,
    })
  },

  // Find session by token
  async findByToken(sessionToken: string) {
    return await prisma.session.findUnique({
      where: { sessionToken },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            isActive: true,
          },
        },
      },
    })
  },

  // Update session activity
  async updateActivity(sessionToken: string) {
    return await prisma.session.update({
      where: { sessionToken },
      data: {
        lastActivity: new Date(),
      },
    })
  },

  // Delete session
  async delete(sessionToken: string) {
    return await prisma.session.delete({
      where: { sessionToken },
    })
  },

  // Delete all sessions for a user
  async deleteAllForUser(userId: string) {
    return await prisma.session.deleteMany({
      where: { userId },
    })
  },

  // Clean up expired sessions
  async cleanupExpired() {
    return await prisma.session.deleteMany({
      where: {
        expires: {
          lt: new Date(),
        },
      },
    })
  },
}

// Post utilities
export const postUtils = {
  // Create a new post
  async create(data: {
    title: string
    slug: string
    content?: string
    excerpt?: string
    authorId: string
    published?: boolean
    metaTitle?: string
    metaDescription?: string
    tagIds?: string[]
  }) {
    const { tagIds, ...postData } = data

    return await prisma.post.create({
      data: {
        ...postData,
        publishedAt: data.published ? new Date() : null,
        tags: tagIds ? {
          create: tagIds.map(tagId => ({ tagId }))
        } : undefined,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })
  },

  // Find post by slug
  async findBySlug(slug: string, includeUnpublished = false) {
    return await prisma.post.findUnique({
      where: {
        slug,
        ...(includeUnpublished ? {} : { published: true }),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })
  },

  // Get published posts with pagination
  async getPublished(options: {
    page?: number
    limit?: number
    authorId?: string
    tagSlug?: string
    featured?: boolean
  } = {}) {
    const { page = 1, limit = 10, authorId, tagSlug, featured } = options
    const skip = (page - 1) * limit

    const where: Prisma.PostWhereInput = {
      published: true,
      ...(authorId && { authorId }),
      ...(featured !== undefined && { featured }),
      ...(tagSlug && {
        tags: {
          some: {
            tag: {
              slug: tagSlug,
            },
          },
        },
      }),
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: {
          publishedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ])

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  },

  // Update post
  async update(id: string, data: Partial<{
    title: string
    slug: string
    content: string
    excerpt: string
    published: boolean
    featured: boolean
    metaTitle: string
    metaDescription: string
  }>) {
    const updateData = { ...data }

    // Set publishedAt when publishing
    if (data.published === true) {
      updateData.publishedAt = new Date()
    } else if (data.published === false) {
      updateData.publishedAt = null
    }

    return await prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })
  },

  // Delete post
  async delete(id: string) {
    return await prisma.post.delete({
      where: { id },
    })
  },
}

// Tag utilities
export const tagUtils = {
  // Create a new tag
  async create(data: {
    name: string
    slug: string
    description?: string
    color?: string
  }) {
    return await prisma.tag.create({
      data,
    })
  },

  // Find tag by slug
  async findBySlug(slug: string) {
    return await prisma.tag.findUnique({
      where: { slug },
      include: {
        posts: {
          include: {
            post: {
              where: {
                published: true,
              },
              select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                publishedAt: true,
              },
            },
          },
        },
      },
    })
  },

  // Get all tags with post counts
  async getAll() {
    return await prisma.tag.findMany({
      include: {
        _count: {
          select: {
            posts: {
              where: {
                post: {
                  published: true,
                },
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })
  },
}

// Database maintenance utilities
export const maintenanceUtils = {
  // Clean up expired sessions
  async cleanupExpiredSessions() {
    return await sessionUtils.cleanupExpired()
  },

  // Clean up expired verification tokens
  async cleanupExpiredTokens() {
    return await prisma.verificationToken.deleteMany({
      where: {
        expires: {
          lt: new Date(),
        },
      },
    })
  },

  // Get database statistics
  async getStats() {
    const [usersCount, postsCount, sessionsCount, tagsCount] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.session.count(),
      prisma.tag.count(),
    ])

    return {
      users: usersCount,
      posts: postsCount,
      sessions: sessionsCount,
      tags: tagsCount,
    }
  },
}