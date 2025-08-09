import { z } from "zod"

// Blog Category Schema
export const blogCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(50, "Category name must be less than 50 characters"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().max(200, "Description must be less than 200 characters").optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Color must be a valid hex color").optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
})

export const blogCategoryUpdateSchema = blogCategorySchema.partial()

// Blog Tag Schema
export const blogTagSchema = z.object({
  name: z.string().min(1, "Tag name is required").max(30, "Tag name must be less than 30 characters"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Color must be a valid hex color").optional(),
  isActive: z.boolean().default(true),
})

export const blogTagUpdateSchema = blogTagSchema.partial()

// Blog Post Schema
export const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  excerpt: z.string().max(300, "Excerpt must be less than 300 characters").optional(),
  content: z.string().min(1, "Content is required"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED", "SCHEDULED"]).default("DRAFT"),
  featuredImage: z.string().url("Featured image must be a valid URL").optional(),
  readTime: z.number().int().min(1).optional(),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  publishedAt: z.date().optional(),
  seoTitle: z.string().max(60, "SEO title must be less than 60 characters").optional(),
  seoDescription: z.string().max(160, "SEO description must be less than 160 characters").optional(),
  seoKeywords: z.array(z.string()).default([]),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).default([]),
})

export const blogPostUpdateSchema = blogPostSchema.partial()

// Blog Comment Schema
export const blogCommentSchema = z.object({
  content: z.string().min(1, "Comment content is required").max(1000, "Comment must be less than 1000 characters"),
  postId: z.string().min(1, "Post ID is required"),
  parentId: z.string().optional(), // For nested comments
})

export const blogCommentUpdateSchema = z.object({
  content: z.string().min(1, "Comment content is required").max(1000, "Comment must be less than 1000 characters"),
  isApproved: z.boolean().optional(),
  isSpam: z.boolean().optional(),
})

// Blog Like Schema
export const blogLikeSchema = z.object({
  postId: z.string().min(1, "Post ID is required"),
})

// Query Schemas
export const blogPostQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED", "SCHEDULED"]).optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  author: z.string().optional(),
  isFeatured: z.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["createdAt", "updatedAt", "publishedAt", "title", "views", "likesCount", "commentsCount"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
}).transform((data) => {
  // Handle "all" filter for category and tag
  if (data.category === "all") {
    data.category = undefined
  }
  if (data.tag === "all") {
    data.tag = undefined
  }
  return data
})

export const blogCommentQuerySchema = z.object({
  postId: z.string().min(1, "Post ID is required"),
  isApproved: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["createdAt", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
})

// Response Schemas
export const blogPostResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullable(),
  content: z.string(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED", "SCHEDULED"]),
  featuredImage: z.string().nullable(),
  readTime: z.number().nullable(),
  views: z.number(),
  likesCount: z.number(),
  commentsCount: z.number(),
  sharesCount: z.number(),
  isFeatured: z.boolean(),
  isPublished: z.boolean(),
  publishedAt: z.date().nullable(),
  seoTitle: z.string().nullable(),
  seoDescription: z.string().nullable(),
  seoKeywords: z.array(z.string()),
  author: z.object({
    id: z.string(),
    name: z.string(),
    avatar: z.string().nullable(),
  }),
  category: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    color: z.string().nullable(),
  }).nullable(),
  tags: z.array(z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    color: z.string().nullable(),
  })),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const blogCategoryResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  color: z.string().nullable(),
  isActive: z.boolean(),
  sortOrder: z.number(),
  postsCount: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const blogTagResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  color: z.string().nullable(),
  isActive: z.boolean(),
  postsCount: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const blogCommentResponseSchema = z.object({
  id: z.string(),
  content: z.string(),
  isApproved: z.boolean(),
  isSpam: z.boolean(),
  postId: z.string(),
  author: z.object({
    id: z.string(),
    name: z.string(),
    avatar: z.string().nullable(),
  }),
  parentId: z.string().nullable(),
  replies: z.array(z.object({
    id: z.string(),
    content: z.string(),
    isApproved: z.boolean(),
    isSpam: z.boolean(),
    postId: z.string(),
    author: z.object({
      id: z.string(),
      name: z.string(),
      avatar: z.string().nullable(),
    }),
    parentId: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Types
export type BlogCategory = z.infer<typeof blogCategorySchema>
export type BlogCategoryUpdate = z.infer<typeof blogCategoryUpdateSchema>
export type BlogTag = z.infer<typeof blogTagSchema>
export type BlogTagUpdate = z.infer<typeof blogTagUpdateSchema>
export type BlogPost = z.infer<typeof blogPostSchema>
export type BlogPostUpdate = z.infer<typeof blogPostUpdateSchema>
export type BlogComment = z.infer<typeof blogCommentSchema>
export type BlogCommentUpdate = z.infer<typeof blogCommentUpdateSchema>
export type BlogLike = z.infer<typeof blogLikeSchema>
export type BlogPostQuery = z.infer<typeof blogPostQuerySchema>
export type BlogCommentQuery = z.infer<typeof blogCommentQuerySchema>
