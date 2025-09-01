import { Router, RequestHandler } from "express"
import { QuizController } from "../controllers/quizController"
import { authenticate, authorize } from "../middleware/auth"
import { validate } from "../middleware/validation"
import { UserRole } from "@prisma/client"
import { 
  quizSchema, 
  quizBasicSchema,
  quizUpdateSchema,
  quizQuerySchema,
  publicQuizQuerySchema,
  quizSubmissionSchema,
  quizResultQuerySchema
} from "../schemas/quizSchema"

const router = Router()
const quizController = new QuizController()

// Public routes (no authentication required)
router.get("/public/quizzes", validate({ query: publicQuizQuerySchema }), quizController.getPublicQuizzes as RequestHandler)
router.get("/public/quizzes/:id", quizController.getPublicQuizById as RequestHandler)
router.get("/public/onboarding", quizController.getOnboardingQuiz as RequestHandler)

// Public categories and difficulties for filtering
router.get("/categories", quizController.getQuizCategories as RequestHandler)
router.get("/quizDifficulties", quizController.getQuizDifficulties as RequestHandler)

// Protected routes (authentication required)
router.use(authenticate as RequestHandler)

// Quiz Management (Admin/Instructor only)
router.post("/quizzes", authorize(UserRole.ADMIN, UserRole.INSTRUCTOR) as RequestHandler, validate({ body: quizSchema }), quizController.createQuiz as RequestHandler)

// Progressive Quiz Creation Routes
router.post("/quizzes/basic", authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR) as RequestHandler, validate({ body: quizBasicSchema }), quizController.createQuizBasic as RequestHandler)
router.put("/quizzes/basic/:id", authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR) as RequestHandler, validate({ body: quizBasicSchema }), quizController.updateQuizBasic as RequestHandler)
router.put("/quizzes/:id/dimensions", authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR) as RequestHandler, quizController.addQuizDimensions as RequestHandler)
router.put("/quizzes/:id/questions", authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR) as RequestHandler, quizController.addQuizQuestions as RequestHandler)
router.put("/quizzes/:id/grading", authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR) as RequestHandler, quizController.addQuizGradingCriteria as RequestHandler)

router.get("/quizzes", validate({ query: quizQuerySchema }), quizController.getQuizzes as RequestHandler)
router.get("/quizzes/:id", quizController.getQuizById as RequestHandler)
router.put("/quizzes/:id", authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR) as RequestHandler, validate({ body: quizUpdateSchema }), quizController.updateQuiz as RequestHandler)
router.delete("/quizzes/:id", authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR) as RequestHandler, quizController.deleteQuiz as RequestHandler)

// Quiz Analytics (Quiz creators only)
router.get("/quizzes/:id/analytics", quizController.getQuizAnalytics as RequestHandler)

// Quiz Results
router.post("/results", validate({ body: quizSubmissionSchema }), quizController.submitQuiz as RequestHandler)
router.get("/results", validate({ query: quizResultQuerySchema }), quizController.getQuizResults as RequestHandler)
router.get("/results/user", quizController.getUserQuizResults as RequestHandler)
router.get("/results/:id", quizController.getQuizResultById as RequestHandler)

export default router