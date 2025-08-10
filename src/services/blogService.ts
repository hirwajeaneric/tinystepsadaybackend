import { PrismaClient } from "@prisma/client"
import type { 
  BlogPost, 
  BlogPostUpdate, 
  BlogCategory, 
  BlogCategoryUpdate,
  BlogTag,
  BlogTagUpdate,
  BlogComment,
  BlogCommentUpdate,
  BlogPostQuery,
  BlogCommentQuery
} from "../schemas/blogSchema"

const prisma = new PrismaClient()

export class BlogService {
  // Blog Posts
  async createPost(data: BlogPost, authorId: string) {
    const { tagIds, ...postData } = data
    
    const post = await prisma.blogPost.create({
      data: {
        ...postData,
        authorId,
        tags: {
          create: tagIds.map(tagId => ({
            tag: {
              connect: { id: tagId }
            }
          }))
        }
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          }
        },
        category: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    return this.formatBlogPost(post)
  }

  async getPosts(query: BlogPostQuery) {
    const { search, status, category, author, isFeatured, page, limit, sortBy, sortOrder } = query
    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status) {
      where.status = status
    }

    if (category) {
      where.category = {
        slug: category
      }
    }

    if (author) {
      where.author = {
        OR: [
          { firstName: { contains: author, mode: 'insensitive' } },
          { lastName: { contains: author, mode: 'insensitive' } },
        ]
      }
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            }
          },
          category: true,
          tags: {
            include: {
              tag: true
            }
          }
        }
      }),
      prisma.blogPost.count({ where })
    ])

    return {
      posts: posts.map(post => this.formatBlogPost(post)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  async getPostById(id: string) {
    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          }
        },
        category: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    if (!post) {
      throw new Error("Post not found")
    }

    return this.formatBlogPost(post)
  }

  async getPostBySlug(slug: string) {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          }
        },
        category: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    if (!post) {
      throw new Error("Post not found")
    }

    return this.formatBlogPost(post)
  }

  async updatePost(id: string, data: BlogPostUpdate, authorId?: string) {
    const { tagIds, ...updateData } = data

    // Check if user is authorized to update this post
    if (authorId) {
      const existingPost = await prisma.blogPost.findUnique({
        where: { id },
        select: { authorId: true }
      })

      if (!existingPost) {
        throw new Error("Post not found")
      }

      if (existingPost.authorId !== authorId) {
        throw new Error("Unauthorized to update this post")
      }
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...updateData,
        ...(tagIds && {
          tags: {
            deleteMany: {},
            create: tagIds.map(tagId => ({
              tag: {
                connect: { id: tagId }
              }
            }))
          }
        })
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          }
        },
        category: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    return this.formatBlogPost(post)
  }

  async deletePost(id: string, authorId?: string) {
    // Check if user is authorized to delete this post
    if (authorId) {
      const existingPost = await prisma.blogPost.findUnique({
        where: { id },
        select: { authorId: true }
      })

      if (!existingPost) {
        throw new Error("Post not found")
      }

      if (existingPost.authorId !== authorId) {
        throw new Error("Unauthorized to delete this post")
      }
    }

    await prisma.blogPost.delete({
      where: { id }
    })

    return { success: true }
  }

  // Blog Categories
  async createCategory(data: BlogCategory) {
    const category = await prisma.blogCategory.create({
      data
    })

    return this.formatBlogCategory(category)
  }

  async getCategories() {
    const categories = await prisma.blogCategory.findMany({
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      },
      orderBy: {
        sortOrder: 'asc'
      }
    })

    return categories.map(category => this.formatBlogCategory(category))
  }

  async getCategoryById(id: string) {
    const category = await prisma.blogCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    })

    if (!category) {
      throw new Error("Category not found")
    }

    return this.formatBlogCategory(category)
  }

  async updateCategory(id: string, data: BlogCategoryUpdate) {
    const category = await prisma.blogCategory.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    })

    return this.formatBlogCategory(category)
  }

  async deleteCategory(id: string) {
    await prisma.blogCategory.delete({
      where: { id }
    })

    return { success: true }
  }

  // Blog Tags
  async createTag(data: BlogTag) {
    const tag = await prisma.blogTag.create({
      data
    })

    return this.formatBlogTag(tag)
  }

  async getTags() {
    const tags = await prisma.blogTag.findMany({
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    })

    return tags.map(tag => this.formatBlogTag(tag))
  }

  async getTagById(id: string) {
    const tag = await prisma.blogTag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    })

    if (!tag) {
      throw new Error("Tag not found")
    }

    return this.formatBlogTag(tag)
  }

  async updateTag(id: string, data: BlogTagUpdate) {
    const tag = await prisma.blogTag.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    })

    return this.formatBlogTag(tag)
  }

  async deleteTag(id: string) {
    await prisma.blogTag.delete({
      where: { id }
    })

    return { success: true }
  }

  // Blog Comments
  async createComment(data: BlogComment, authorId: string) {
    const comment = await prisma.blogComment.create({
      data: {
        ...data,
        authorId
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          }
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              }
            }
          }
        }
      }
    })

    return this.formatBlogComment(comment)
  }

  async getComments(query: BlogCommentQuery) {
    const { postId, page, limit, sortBy, sortOrder, isApproved } = query
    const skip = (page - 1) * limit

    const where: any = {}

    if (postId) {
      where.postId = postId
    }

    if (isApproved !== undefined) {
      where.isApproved = isApproved
    }

    const [comments, total] = await Promise.all([
      prisma.blogComment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            }
          },
          replies: {
            include: {
              author: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                }
              }
            }
          }
        }
      }),
      prisma.blogComment.count({ where })
    ])

    return {
      comments: comments.map(comment => this.formatBlogComment(comment)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  async updateComment(id: string, data: BlogCommentUpdate, authorId?: string) {
    // Check if user is authorized to update this comment
    if (authorId) {
      const existingComment = await prisma.blogComment.findUnique({
        where: { id },
        select: { authorId: true }
      })

      if (!existingComment) {
        throw new Error("Comment not found")
      }

      if (existingComment.authorId !== authorId) {
        throw new Error("Unauthorized to update this comment")
      }
    }

    const comment = await prisma.blogComment.update({
      where: { id },
      data,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          }
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              }
            }
          }
        }
      }
    })

    return this.formatBlogComment(comment)
  }

  async deleteComment(id: string, authorId?: string) {
    // Check if user is authorized to delete this comment
    if (authorId) {
      const existingComment = await prisma.blogComment.findUnique({
        where: { id },
        select: { authorId: true }
      })

      if (!existingComment) {
        throw new Error("Comment not found")
      }

      if (existingComment.authorId !== authorId) {
        throw new Error("Unauthorized to delete this comment")
      }
    }

    await prisma.blogComment.delete({
      where: { id }
    })

    return { success: true }
  }

  // Blog Likes
  async toggleLike(postId: string, userId: string) {
    const existingLike = await prisma.blogLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId
        }
      }
    })

    if (existingLike) {
      // Unlike
      await prisma.blogLike.delete({
        where: {
          postId_userId: {
            postId,
            userId
          }
        }
      })

      // Update like count
      await prisma.blogPost.update({
        where: { id: postId },
        data: {
          likesCount: {
            decrement: 1
          }
        }
      })

      return { liked: false }
    } else {
      // Like
      await prisma.blogLike.create({
        data: {
          postId,
          userId
        }
      })

      // Update like count
      await prisma.blogPost.update({
        where: { id: postId },
        data: {
          likesCount: {
            increment: 1
          }
        }
      })

      return { liked: true }
    }
  }

  async checkLike(postId: string, userId: string) {
    const like = await prisma.blogLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId
        }
      }
    })

    return { liked: !!like }
  }

  // Public methods
  async getPublicPosts(query: BlogPostQuery) {
    const { search, category, tag, author, isFeatured, page, limit, sortBy, sortOrder } = query
    const skip = (page - 1) * limit

    // Build the base where clause for published posts
    const where: any = {}

    // Only show published posts
    where.status = "PUBLISHED"

    // Add search filter if provided
    if (search) {
      where.AND = [
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
            { excerpt: { contains: search, mode: 'insensitive' } },
          ]
        }
      ]
    }

    // Add category filter if provided
    if (category && category !== "all") {
      if (!where.AND) {
        where.AND = []
      }
      where.AND.push({
        category: {
          slug: category
        }
      })
    }

    // Add tag filter if provided
    if (tag && tag !== "all") {
      if (!where.AND) {
        where.AND = []
      }
      where.AND.push({
        tags: {
          some: {
            tag: {
              slug: tag
            }
          }
        }
      })
    }

    // Add author filter if provided
    if (author) {
      if (!where.AND) {
        where.AND = []
      }
      where.AND.push({
        author: {
          OR: [
            { firstName: { contains: author, mode: 'insensitive' } },
            { lastName: { contains: author, mode: 'insensitive' } },
          ]
        }
      })
    }

    // Add featured filter if provided
    if (isFeatured !== undefined) {
      if (!where.AND) {
        where.AND = []
      }
      where.AND.push({ isFeatured })
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            }
          },
          category: true,
          tags: {
            include: {
              tag: true
            }
          }
        }
      }),
      prisma.blogPost.count({ where })
    ])

    return {
      posts: posts.map(post => this.formatBlogPost(post)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  async getPublicPostBySlug(slug: string) {
    const post = await prisma.blogPost.findUnique({
      where: {
        slug,
        status: "PUBLISHED"
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          }
        },
        category: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    if (!post) {
      throw new Error("Post not found")
    }

    return this.formatBlogPost(post)
    // return post;
  }

  async getPublicComments(query: BlogCommentQuery) {
    const { postId, page, limit, sortBy, sortOrder } = query
    const skip = (page - 1) * limit

    const where: any = {
      isApproved: true,
      isSpam: false
    }

    if (postId) {
      where.postId = postId
    }

    const [comments, total] = await Promise.all([
      prisma.blogComment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            }
          },
          replies: {
            where: {
              isApproved: true,
              isSpam: false
            },
            include: {
              author: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                }
              }
            }
          }
        }
      }),
      prisma.blogComment.count({ where })
    ])

    return {
      comments: comments.map(comment => this.formatBlogComment(comment)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  // Helper methods
  private formatBlogPost(post: any) {
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      status: post.status,
      featuredImage: post.featuredImage,
      readTime: post.readTime,
      views: post.views,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      sharesCount: post.sharesCount,
      isFeatured: post.isFeatured,
      publishedAt: post.publishedAt,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      seoKeywords: post.seoKeywords,
      author: {
        id: post.author.id,
        name: `${post.author.firstName || ''} ${post.author.lastName || ''}`.trim(),
        avatar: post.author.avatar,
      },
      category: post.category ? {
        id: post.category.id,
        name: post.category.name,
        slug: post.category.slug,
        color: post.category.color,
      } : null,
      tags: post.tags.map((tagRelation: any) => ({
        id: tagRelation.tag.id,
        name: tagRelation.tag.name,
        slug: tagRelation.tag.slug,
        color: tagRelation.tag.color,
      })),
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }
  }

  private formatBlogCategory(category: any) {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      color: category.color,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
      postsCount: category._count?.posts || 0,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }
  }

  private formatBlogTag(tag: any) {
    return {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      color: tag.color,
      isActive: tag.isActive,
      postsCount: tag._count?.posts || 0,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
    }
  }

  private formatBlogComment(comment: any) {
    return {
      id: comment.id,
      content: comment.content,
      isApproved: comment.isApproved,
      isSpam: comment.isSpam,
      postId: comment.postId,
      author: {
        id: comment.author.id,
        name: `${comment.author.firstName || ''} ${comment.author.lastName || ''}`.trim(),
        avatar: comment.author.avatar,
      },
      parentId: comment.parentId,
      replies: comment.replies?.map((reply: any) => this.formatBlogComment(reply)) || [],
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    }
  }
}
