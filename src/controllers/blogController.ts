import { Request, Response } from "express"
import { BlogService } from "../services/blogService"
import { 
  blogPostSchema, 
  blogPostUpdateSchema,
  blogCategorySchema,
  blogCategoryUpdateSchema,
  blogTagSchema,
  blogTagUpdateSchema,
  blogCommentSchema,
  blogCommentUpdateSchema,
  blogPostQuerySchema,
  blogCommentQuerySchema
} from "../schemas/blogSchema"
import { handleError } from "../utils/errors"
import { AuthenticatedRequest } from "../types/auth"

const blogService = new BlogService()

export class BlogController {
  // Blog Posts
  async createPost(req: AuthenticatedRequest, res: Response) {
    try {
      const validatedData = blogPostSchema.parse(req.body)
      const authorId = req.user?.userId

      if (!authorId) {
        return res.status(401).json({ error: "Unauthorized" })
      }

      const post = await blogService.createPost(validatedData, authorId)
      return res.status(201).json(post)
    } catch (error) {
      return handleError(error, res)
    }
  }

  async getPosts(req: Request, res: Response) {
    try {
      const query = (req as any).validatedQuery || blogPostQuerySchema.parse(req.query)
      const result = await blogService.getPosts(query)
      return res.json(result)
    } catch (error) {
      return handleError(error, res)
    }
  }

  async getPostById(req: Request, res: Response) {
    try {
      const { id } = req.params
      if (!id) {
        return res.status(400).json({ error: "Post ID is required" })
      }
      const post = await blogService.getPostById(id)
      return res.json(post)
    } catch (error) {
      return handleError(error, res)
    }
  }

  async getPostBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params
      if (!slug) {
        return res.status(400).json({ error: "Post slug is required" })
      }
      const post = await blogService.getPostBySlug(slug);
      return res.json(post)
    } catch (error) {
      return handleError(error, res)
    }
  }

  async updatePost(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params
      const validatedData = blogPostUpdateSchema.parse(req.body)
      const authorId = req.user?.userId

      if (!id) {
        return res.status(400).json({ error: "Post ID is required" })
      }

      if (!authorId) {
        return res.status(401).json({ error: "Unauthorized" })
      }

      const post = await blogService.updatePost(id, validatedData, authorId)
      return res.json(post)
    } catch (error) {
      return handleError(error, res)
    }
  }

  async deletePost(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params
      const authorId = req.user?.userId

      if (!id) {
        return res.status(400).json({ error: "Post ID is required" })
      }

      if (!authorId) {
        return res.status(401).json({ error: "Unauthorized" })
      }

      await blogService.deletePost(id, authorId)
      return res.json({ success: true })
    } catch (error) {
      return handleError(error, res)
    }
  }

  // Blog Categories
  async createCategory(req: Request, res: Response) {
    try {
      const validatedData = blogCategorySchema.parse(req.body)
      const category = await blogService.createCategory(validatedData)
      return res.status(201).json(category)
    } catch (error) {
      return handleError(error, res)
    }
  }

  async getCategories(_req: Request, res: Response) {
    try {
      const categories = await blogService.getCategories()
      return res.json(categories)
    } catch (error) {
      return handleError(error, res)
    }
  }

  async getCategoryById(req: Request, res: Response) {
    try {
      const { id } = req.params
      if (!id) {
        return res.status(400).json({ error: "Category ID is required" })
      }
      const category = await blogService.getCategoryById(id)
      return res.json(category)
    } catch (error) {
      return handleError(error, res)
    }
  }

  async updateCategory(req: Request, res: Response) {
    try {
      const { id } = req.params
      const validatedData = blogCategoryUpdateSchema.parse(req.body)
      
      if (!id) {
        return res.status(400).json({ error: "Category ID is required" })
      }

      const category = await blogService.updateCategory(id, validatedData)
      return res.json(category)
    } catch (error) {
      return handleError(error, res)
    }
  }

  async deleteCategory(req: Request, res: Response) {
    try {
      const { id } = req.params
      if (!id) {
        return res.status(400).json({ error: "Category ID is required" })
      }
      await blogService.deleteCategory(id)
      return res.json({ success: true })
    } catch (error) {
      return handleError(error, res)
    }
  }

  // Blog Tags
  async createTag(req: Request, res: Response) {
    try {
      const validatedData = blogTagSchema.parse(req.body)
      const tag = await blogService.createTag(validatedData)
      return res.status(201).json(tag)
    } catch (error) {
      return handleError(error, res)
    }
  }

  async getTags(_req: Request, res: Response) {
    try {
      const tags = await blogService.getTags()
      return res.json(tags)
    } catch (error) {
      return handleError(error, res)
    }
  }

  async getTagById(req: Request, res: Response) {
    try {
      const { id } = req.params
      if (!id) {
        return res.status(400).json({ error: "Tag ID is required" })
      }
      const tag = await blogService.getTagById(id)
      return res.json(tag)
    } catch (error) {
      return handleError(error, res)
    }
  }

  async updateTag(req: Request, res: Response) {
    try {
      const { id } = req.params
      const validatedData = blogTagUpdateSchema.parse(req.body)
      
      if (!id) {
        return res.status(400).json({ error: "Tag ID is required" })
      }

      const tag = await blogService.updateTag(id, validatedData)
      return res.json(tag)
    } catch (error) {
      return handleError(error, res)
    }
  }

  async deleteTag(req: Request, res: Response) {
    try {
      const { id } = req.params
      if (!id) {
        return res.status(400).json({ error: "Tag ID is required" })
      }
      await blogService.deleteTag(id)
      return res.json({ success: true })
    } catch (error) {
      return handleError(error, res)
    }
  }

  // Blog Comments
  async createComment(req: AuthenticatedRequest, res: Response) {
    try {
      const validatedData = blogCommentSchema.parse(req.body)
      const authorId = req.user?.userId

      if (!authorId) {
        return res.status(401).json({ error: "Unauthorized" })
      }

      const comment = await blogService.createComment(validatedData, authorId)
      return res.status(201).json(comment)
    } catch (error) {
      return handleError(error, res)
    }
  }

  async getComments(req: Request, res: Response) {
    try {
      const query = blogCommentQuerySchema.parse(req.query)
      const result = await blogService.getComments(query)
      return res.json(result)
    } catch (error) {
      return handleError(error, res)
    }
  }

  async updateComment(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params
      const validatedData = blogCommentUpdateSchema.parse(req.body)
      const authorId = req.user?.userId

      if (!id) {
        return res.status(400).json({ error: "Comment ID is required" })
      }

      if (!authorId) {
        return res.status(401).json({ error: "Unauthorized" })
      }

      const comment = await blogService.updateComment(id, validatedData, authorId)
      return res.json(comment)
    } catch (error) {
      return handleError(error, res)
    }
  }

  async deleteComment(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params
      const authorId = req.user?.userId

      if (!id) {
        return res.status(400).json({ error: "Comment ID is required" })
      }

      if (!authorId) {
        return res.status(401).json({ error: "Unauthorized" })
      }

      await blogService.deleteComment(id, authorId)
      return res.json({ success: true })
    } catch (error) {
      return handleError(error, res)
    }
  }

  // Blog Likes
  async toggleLike(req: AuthenticatedRequest, res: Response) {
    try {
      const { postId } = req.body
      const userId = req.user?.userId

      if (!postId) {
        return res.status(400).json({ error: "Post ID is required" })
      }

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" })
      }

      const result = await blogService.toggleLike(postId, userId)
      return res.json(result)
    } catch (error) {
      return handleError(error, res)
    }
  }

  async checkLike(req: AuthenticatedRequest, res: Response) {
    try {
      const { postId } = req.params
      const userId = req.user?.userId

      if (!postId) {
        return res.status(400).json({ error: "Post ID is required" })
      }

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" })
      }

      const result = await blogService.checkLike(postId, userId)
      return res.json(result)
    } catch (error) {
      return handleError(error, res)
    }
  }

  // Public endpoints
  async getPublicPosts(req: Request, res: Response) {
    try {
      const query = (req as any).validatedQuery || blogPostQuerySchema.parse(req.query)
      const result = await blogService.getPublicPosts(query)
      return res.json(result)
    } catch (error) {
      return handleError(error, res)
    }
  }

  async getPublicPostBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params
      if (!slug) {
        return res.status(400).json({ error: "Post slug is required" })
      }
      const post = await blogService.getPublicPostBySlug(slug)
      return res.json(post)
    } catch (error) {
      return handleError(error, res)
    }
  }

  async getPublicComments(req: Request, res: Response) {
    try {
      const query = blogCommentQuerySchema.parse(req.query)
      const result = await blogService.getPublicComments(query)
      return res.json(result)
    } catch (error) {
      return handleError(error, res)
    }
  }
}
