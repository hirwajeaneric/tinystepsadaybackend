import { Router, RequestHandler } from "express"
import { BlogController } from "../controllers/blogController"
import { authenticate, authorize } from "../middleware/auth"
import { validate } from "../middleware/validation"
import { UserRole } from "@prisma/client"
import { 
  blogPostSchema, 
  blogPostUpdateSchema,
  blogCategorySchema,
  blogCategoryUpdateSchema,
  blogTagSchema,
  blogTagUpdateSchema,
  blogCommentSchema,
  blogCommentUpdateSchema,
  blogLikeSchema,
  blogPostQuerySchema,
  blogCommentQuerySchema
} from "../schemas/blogSchema"

const router = Router()
const blogController = new BlogController()

// Public routes (no authentication required)
router.get("/public/posts", validate({ query: blogPostQuerySchema }), blogController.getPublicPosts as RequestHandler)
router.get("/public/posts/:slug", blogController.getPublicPostBySlug as RequestHandler)
router.get("/public/comments", validate({ query: blogCommentQuerySchema }), blogController.getPublicComments as RequestHandler)

// Public categories and tags for filtering
router.get("/categories", blogController.getCategories as RequestHandler)
router.get("/tags", blogController.getTags as RequestHandler)

// Protected routes (authentication required)
router.use(authenticate as RequestHandler)

// Blog Posts
router.post("/posts", validate({ body: blogPostSchema }), blogController.createPost as RequestHandler)
router.get("/posts", validate({ query: blogPostQuerySchema }), blogController.getPosts as RequestHandler)
router.get("/posts/:id", blogController.getPostById as RequestHandler)
router.put("/posts/:id", validate({ body: blogPostUpdateSchema }), blogController.updatePost as RequestHandler)
router.delete("/posts/:id", blogController.deletePost as RequestHandler)

// Blog Categories (Admin/Instructor only)
router.post("/categories", authorize(UserRole.ADMIN, UserRole.INSTRUCTOR) as RequestHandler, validate({ body: blogCategorySchema }), blogController.createCategory as RequestHandler)
router.get("/categories/:id", blogController.getCategoryById as RequestHandler)
router.put("/categories/:id", authorize(UserRole.ADMIN, UserRole.INSTRUCTOR) as RequestHandler, validate({ body: blogCategoryUpdateSchema }), blogController.updateCategory as RequestHandler)
router.delete("/categories/:id", authorize(UserRole.ADMIN, UserRole.INSTRUCTOR) as RequestHandler, blogController.deleteCategory as RequestHandler)

// Blog Tags (Admin/Instructor only)
router.post("/tags", authorize(UserRole.ADMIN, UserRole.INSTRUCTOR) as RequestHandler, validate({ body: blogTagSchema }), blogController.createTag as RequestHandler)
router.get("/tags/:id", blogController.getTagById as RequestHandler)
router.put("/tags/:id", authorize(UserRole.ADMIN, UserRole.INSTRUCTOR) as RequestHandler, validate({ body: blogTagUpdateSchema }), blogController.updateTag as RequestHandler)
router.delete("/tags/:id", authorize(UserRole.ADMIN, UserRole.INSTRUCTOR) as RequestHandler, blogController.deleteTag as RequestHandler)

// Blog Comments
router.post("/comments", validate({ body: blogCommentSchema }), blogController.createComment as RequestHandler)
router.get("/comments", validate({ query: blogCommentQuerySchema }), blogController.getComments as RequestHandler)
router.put("/comments/:id", validate({ body: blogCommentUpdateSchema }), blogController.updateComment as RequestHandler)
router.delete("/comments/:id", blogController.deleteComment as RequestHandler)

// Blog Likes
router.post("/likes", validate({ body: blogLikeSchema }), blogController.toggleLike as RequestHandler)
router.get("/likes/:postId", blogController.checkLike as RequestHandler)

export default router
