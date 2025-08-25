import { Request, Response } from "express"
import { QuizService } from "../services/quizService"
import { 
  quizSchema, 
  quizUpdateSchema,
  quizQuerySchema,
  quizSubmissionSchema,
  quizResultQuerySchema
} from "../schemas/quizSchema"
import { handleError } from "../utils/errors"
import { AuthenticatedRequest } from "../types/auth"

const quizService = new QuizService()

export class QuizController {
  async createQuiz(req: AuthenticatedRequest, res: Response) {
    try {
      const validatedData = quizSchema.parse(req.body);
      const createdBy = req.user?.userId;

      console.log("validatedData", validatedData);
      console.log(req.body);
      
      if (!createdBy) {
        return res.status(401).json({ 
          success: false,
          error: "AUTHENTICATION_ERROR",
          message: "Unauthorized" 
        })
      }

      const quiz = await quizService.createQuiz(validatedData, createdBy)
      return res.status(201).json({
        success: true,
        message: "Quiz created successfully",
        data: quiz
      })
    } catch (error) {
      return handleError(error, res)
    }
  }

  async getQuizzes(req: Request, res: Response) {
    try {
      const query = (req as any).validatedQuery || quizQuerySchema.parse(req.query)
      const result = await quizService.getQuizzes(query)
      return res.json({
        success: true,
        message: "Quizzes retrieved successfully",
        data: result
      })
    } catch (error) {
      return handleError(error, res)
    }
  }

  async getQuizById(req: Request, res: Response) {
    try {
      const { id } = req.params
      if (!id) {
        return res.status(400).json({ 
          success: false,
          error: "VALIDATION_ERROR",
          message: "Quiz ID is required" 
        })
      }
      const quiz = await quizService.getQuizById(id)
      if (!quiz) {
        return res.status(404).json({ 
          success: false,
          error: "NOT_FOUND_ERROR",
          message: "Quiz not found" 
        })
      }
      return res.json({
        success: true,
        message: "Quiz retrieved successfully",
        data: quiz
      })
    } catch (error) {
      return handleError(error, res)
    }
  }

  async getPublicQuizById(req: Request, res: Response) {
    try {
      const { id } = req.params
      if (!id) {
        return res.status(400).json({ 
          success: false,
          error: "VALIDATION_ERROR",
          message: "Quiz ID is required" 
        })
      }
      const quiz = await quizService.getPublicQuizById(id)
      if (!quiz) {
        return res.status(404).json({ 
          success: false,
          error: "NOT_FOUND_ERROR",
          message: "Quiz not found or not available" 
        })
      }
      return res.json({
        success: true,
        message: "Public quiz retrieved successfully",
        data: quiz
      })
    } catch (error) {
      return handleError(error, res)
    }
  }

  async getOnboardingQuiz(_req: Request, res: Response) {
    try {
      const quiz = await quizService.getOnboardingQuiz()
      if (!quiz) {
        return res.status(404).json({ 
          success: false,
          error: "NOT_FOUND_ERROR",
          message: "No onboarding quiz available" 
        })
      }
      return res.json({
        success: true,
        message: "Onboarding quiz retrieved successfully",
        data: quiz
      })
    } catch (error) {
      return handleError(error, res)
    }
  }

  async updateQuiz(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params
      const validatedData = quizUpdateSchema.parse(req.body)
      const updatedBy = req.user?.userId

      console.log("validatedData", validatedData);
      console.log("updatedBy", updatedBy);
      console.log(req.body);
      console.log("id", id);

      if (!id) {
        return res.status(400).json({ 
          success: false,
          error: "VALIDATION_ERROR",
          message: "Quiz ID is required" 
        })
      }

      if (!updatedBy) {
        return res.status(401).json({ 
          success: false,
          error: "AUTHENTICATION_ERROR",
          message: "Unauthorized" 
        })
      }

      const quiz = await quizService.updateQuiz(id, validatedData, updatedBy)
      return res.json({
        success: true,
        message: "Quiz updated successfully",
        data: quiz
      })
    } catch (error) {
      return handleError(error, res)
    }
  }

  async deleteQuiz(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params
      const deletedBy = req.user?.userId

      if (!id) {
        return res.status(400).json({ 
          success: false,
          error: "VALIDATION_ERROR",
          message: "Quiz ID is required" 
        })
      }

      if (!deletedBy) {
        return res.status(401).json({ 
          success: false,
          error: "AUTHENTICATION_ERROR",
          message: "Unauthorized" 
        })
      }

      await quizService.deleteQuiz(id, deletedBy)
      return res.status(204).send()
    } catch (error) {
      return handleError(error, res)
    }
  }

  async submitQuiz(req: AuthenticatedRequest, res: Response) {
    try {
      const validatedData = quizSubmissionSchema.parse(req.body)
      const userId = req.user?.userId

      if (!userId) {
        return res.status(401).json({ 
          success: false,
          error: "AUTHENTICATION_ERROR",
          message: "Unauthorized" 
        })
      }

      const result = await quizService.submitQuiz(validatedData, userId)
      return res.status(201).json({
        success: true,
        message: "Quiz submitted successfully",
        data: result
      })
    } catch (error) {
      return handleError(error, res)
    }
  }

  async getQuizResults(req: Request, res: Response) {
    try {
      const query = (req as any).validatedQuery || quizResultQuerySchema.parse(req.query)
      const result = await quizService.getQuizResults(query)
      return res.json({
        success: true,
        message: "Quiz results retrieved successfully",
        data: result
      })
    } catch (error) {
      return handleError(error, res)
    }
  }

  async getQuizResultById(req: Request, res: Response) {
    try {
      const { id } = req.params
      if (!id) {
        return res.status(400).json({ 
          success: false,
          error: "VALIDATION_ERROR",
          message: "Result ID is required" 
        })
      }
      const result = await quizService.getQuizResultById(id)
      if (!result) {
        return res.status(404).json({ 
          success: false,
          error: "NOT_FOUND_ERROR",
          message: "Quiz result not found" 
        })
      }
      return res.json({
        success: true,
        message: "Quiz result retrieved successfully",
        data: result
      })
    } catch (error) {
      return handleError(error, res)
    }
  }

  async getUserQuizResults(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId
      const { page, limit } = req.query

      if (!userId) {
        return res.status(401).json({ 
          success: false,
          error: "AUTHENTICATION_ERROR",
          message: "Unauthorized" 
        })
      }

      const result = await quizService.getUserQuizResults(
        userId, 
        page ? parseInt(page as string) : 1, 
        limit ? parseInt(limit as string) : 10
      )
      return res.json({
        success: true,
        message: "User quiz results retrieved successfully",
        data: result
      })
    } catch (error) {
      return handleError(error, res)
    }
  }

  async getQuizAnalytics(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params
      const userId = req.user?.userId

      if (!id) {
        return res.status(400).json({ 
          success: false,
          error: "VALIDATION_ERROR",
          message: "Quiz ID is required" 
        })
      }

      if (!userId) {
        return res.status(401).json({ 
          success: false,
          error: "AUTHENTICATION_ERROR",
          message: "Unauthorized" 
        })
      }

      const quiz = await quizService.getQuizById(id)
      if (!quiz) {
        return res.status(404).json({ 
          success: false,
          error: "NOT_FOUND_ERROR",
          message: "Quiz not found" 
        })
      }

      if (quiz.createdBy !== userId) {
        // TODO: Add admin role check
        return res.status(403).json({ 
          success: false,
          error: "AUTHORIZATION_ERROR",
          message: "Forbidden: Only quiz creators can view analytics" 
        })
      }

      const analytics = await quizService.getQuizAnalytics(id)
      return res.json({
        success: true,
        message: "Quiz analytics retrieved successfully",
        data: analytics
      })
    } catch (error) {
      return handleError(error, res)
    }
  }

  async getPublicQuizzes(req: Request, res: Response) {
    try {
      const query = (req as any).validatedQuery || quizQuerySchema.parse(req.query)
      const result = await quizService.getPublicQuizzes(query)
      return res.json({
        success: true,
        message: "Public quizzes retrieved successfully",
        data: result
      })
    } catch (error) {
      return handleError(error, res)
    }
  }

  async getQuizCategories(_req: Request, res: Response) {
    try {
      const categories = [
        "Personal Development",
        "Mental Health",
        "Life Purpose",
        "Wellness",
        "Career",
        "Relationships",
        "Productivity",
        "Mindfulness",
        "Finance",
        "Family",
        "Social",
        "Spirituality",
        "Personal Growth",
        "Self-Improvement",
        "Leadership",
        "Entrepreneurship",
        "Marketing",
        "Sales",
        "Technology",
        "Design",
        "Writing",
        "Reading",
        "Listening",
        "Speaking",
        "Travel",
        "Food",
        "Fashion",
        "Art",
        "Music",
        "Movies",
        "TV",
        "Books",
        "Podcasts",
        "Gaming",
        "Health",
        "Fitness",
        "Sleep",
        "Meditation",
        "Yoga",
        "Onboarding",
        "Productivity",
        "Time Management",
        "Goal Setting",
        "Habit Building"
      ]
      return res.json({
        success: true,
        message: "Quiz categories retrieved successfully",
        data: categories
      })
    } catch (error) {
      return handleError(error, res)
    }
  }

  async getQuizDifficulties(_req: Request, res: Response) {
    try {
      const difficulties = [
        { value: "BEGINNER", label: "Beginner" },
        { value: "INTERMEDIATE", label: "Intermediate" },
        { value: "ADVANCED", label: "Advanced" }
      ]
      return res.json({
        success: true,
        message: "Quiz difficulties retrieved successfully",
        data: difficulties
      })
    } catch (error) {
      return handleError(error, res)
    }
  }
}