import { PrismaClient, QuizResultLevel } from "@prisma/client"
import { NotFoundError, AuthorizationError, ValidationError } from "../utils/errors"
import type {
  Quiz,
  UpdateQuizData,
  CreateQuizData,
  QuizQuery,
  QuizResult,
  QuizResultQuery,
  QuizSubmission,
  QuizAnalytics,
  QuizResultCalculation
} from "../types/quiz"

const prisma = new PrismaClient()

export class QuizService {
  // Quiz Management
  async createQuiz(data: CreateQuizData, createdBy: string): Promise<Quiz> {
    const { questions, gradingCriteria, ...quizData } = data

    const quiz = await prisma.quiz.create({
      data: {
        ...quizData,
        createdBy,
        questions: {
          create: questions.map((question, index) => ({
            text: question.text,
            order: question.order || index,
            options: {
              create: question.options.map((option, optionIndex) => ({
                text: option.text,
                value: option.value,
                order: option.order || optionIndex
              }))
            }
          }))
        },
        gradingCriteria: {
          create: gradingCriteria.map((criteria) => ({
            name: criteria.name,
            minScore: criteria.minScore,
            maxScore: criteria.maxScore,
            label: criteria.label,
            color: criteria.color,
            recommendations: criteria.recommendations,
            areasOfImprovement: criteria.areasOfImprovement || [],
            supportNeeded: criteria.supportNeeded || [],
            proposedCourses: criteria.proposedCourses,
            proposedProducts: criteria.proposedProducts,
            proposedStreaks: criteria.proposedStreaks,
            proposedBlogPosts: criteria.proposedBlogPosts,
            description: criteria.description
          }))
        }
      },
      include: {
        questions: {
          include: {
            options: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        },
        gradingCriteria: {
          orderBy: { minScore: 'asc' }
        },
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    })

    return this.formatQuiz(quiz)
  }

  // Helper methods will be added here
  private formatQuiz(quiz: any): Quiz {
    return {
      id: quiz.id,
      quizType: quiz.quizType,
      redirectAfterAnswer: quiz.redirectAfterAnswer,
      title: quiz.title,
      subtitle: quiz.subtitle,
      description: quiz.description,
      category: quiz.category,
      estimatedTime: quiz.estimatedTime,
      difficulty: quiz.difficulty,
      status: quiz.status,
      isPublic: quiz.isPublic,
      totalAttempts: quiz.totalAttempts,
      completedAttempts: quiz.completedAttempts,
      averageScore: quiz.averageScore,
      averageCompletionTime: quiz.averageCompletionTime,
      tags: quiz.tags,
      createdBy: quiz.createdBy,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
      questions: quiz.questions?.map((q: any) => ({
        id: q.id,
        text: q.text,
        order: q.order,
        options: q.options?.map((o: any) => ({
          id: o.id,
          text: o.text,
          value: o.value,
          order: o.order
        })) || []
      })) || [],
      gradingCriteria: quiz.gradingCriteria?.map((gc: any) => ({
        id: gc.id,
        name: gc.name,
        minScore: gc.minScore,
        maxScore: gc.maxScore,
        label: gc.label,
        color: gc.color,
        recommendations: gc.recommendations,
        proposedCourses: gc.proposedCourses,
        proposedProducts: gc.proposedProducts,
        proposedStreaks: gc.proposedStreaks,
        proposedBlogPosts: gc.proposedBlogPosts,
        description: gc.description
      })) || [],
      createdByUser: quiz.createdByUser
    }
  }

  async getQuizzes(query: QuizQuery): Promise<{ quizzes: Quiz[]; total: number; page: number; totalPages: number }> {
    const { search, category, status, isPublic, createdBy, tags, quizType, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = query
    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { subtitle: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (category) {
      where.category = category
    }

    if (status) {
      where.status = status
    }

    if (isPublic !== undefined) {
      where.isPublic = isPublic
    }

    if (quizType) {
      where.quizType = quizType
    }

    if (createdBy) {
      where.createdBy = createdBy
    }

    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags
      }
    }

    const [quizzes, total] = await Promise.all([
      prisma.quiz.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy as string]: sortOrder },
        include: {
          questions: {
            include: {
              options: {
                orderBy: { order: 'asc' }
              }
            },
            orderBy: { order: 'asc' }
          },
          gradingCriteria: {
            orderBy: { minScore: 'asc' }
          },
          createdByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          }
        }
      }),
      prisma.quiz.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return {
      quizzes: quizzes.map(quiz => this.formatQuiz(quiz)),
      total,
      page,
      totalPages
    }
  }

  async getQuizById(id: string): Promise<Quiz | null> {
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            options: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        },
        gradingCriteria: {
          orderBy: { minScore: 'asc' }
        },
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    })

    return quiz ? this.formatQuiz(quiz) : null
  }

  async getPublicQuizById(id: string): Promise<Quiz | null> {
    const quiz = await prisma.quiz.findFirst({
      where: {
        id,
        isPublic: true,
        status: 'ACTIVE'
      },
      include: {
        questions: {
          include: {
            options: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        },
        gradingCriteria: {
          orderBy: { minScore: 'asc' }
        }
      }
    })

    return quiz ? this.formatQuiz(quiz) : null
  }

  async getOnboardingQuiz(): Promise<Quiz | null> {
    const quiz = await prisma.quiz.findFirst({
      where: {
        category: 'ONBOARDING',
        status: 'ACTIVE',
        isPublic: true,
        redirectAfterAnswer: 'HOME'
      },
      include: {
        questions: {
          include: {
            options: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        },
        gradingCriteria: {
          orderBy: { minScore: 'asc' }
        },
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    })

    return quiz ? this.formatQuiz(quiz) : null
  }

  async updateQuiz(id: string, data: UpdateQuizData, updatedBy: string): Promise<Quiz> {
    // Check if user has permission to update this quiz
    const existingQuiz = await prisma.quiz.findUnique({
      where: { id },
      select: { createdBy: true }
    })

    if (!existingQuiz) {
      throw new NotFoundError("Quiz not found", "QUIZ_NOT_FOUND")
    }

    if (existingQuiz.createdBy !== updatedBy) {
      throw new AuthorizationError("Unauthorized to update this quiz", "INSUFFICIENT_PERMISSIONS")
    }

    const { questions, gradingCriteria, ...quizData } = data

    // If questions are being updated, replace all existing ones
    if (questions) {
      await prisma.quizQuestion.deleteMany({
        where: { quizId: id }
      })
    }

    // If grading criteria are being updated, replace all existing ones
    if (gradingCriteria) {
      await prisma.gradingCriteria.deleteMany({
        where: { quizId: id }
      })
    }

    const quiz = await prisma.quiz.update({
      where: { id },
      data: {
        ...quizData,
        ...(questions && {
          questions: {
            create: questions.map((question, index) => ({
              text: question.text,
              order: question.order || index,
              options: {
                create: question.options.map((option, optionIndex) => ({
                  text: option.text,
                  value: option.value,
                  order: option.order || optionIndex
                }))
              }
            }))
          }
        }),
        ...(gradingCriteria && {
          gradingCriteria: {
            create: gradingCriteria.map((criteria) => ({
              name: criteria.name,
              minScore: criteria.minScore,
              maxScore: criteria.maxScore,
              label: criteria.label,
              color: criteria.color,
              recommendations: criteria.recommendations,
              proposedCourses: criteria.proposedCourses,
              proposedProducts: criteria.proposedProducts,
              proposedStreaks: criteria.proposedStreaks,
              proposedBlogPosts: criteria.proposedBlogPosts,
              description: criteria.description
            }))
          }
        })
      },
      include: {
        questions: {
          include: {
            options: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        },
        gradingCriteria: {
          orderBy: { minScore: 'asc' }
        },
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    })

    return this.formatQuiz(quiz)
  }

  async deleteQuiz(id: string, deletedBy: string): Promise<void> {
    // Check if user has permission to delete this quiz
    const existingQuiz = await prisma.quiz.findUnique({
      where: { id },
      select: { createdBy: true }
    })

    if (!existingQuiz) {
      throw new NotFoundError("Quiz not found", "QUIZ_NOT_FOUND")
    }

    if (existingQuiz.createdBy !== deletedBy) {
      throw new AuthorizationError("Unauthorized to delete this quiz", "INSUFFICIENT_PERMISSIONS")
    }

    await prisma.quiz.delete({
      where: { id }
    })
  }

  // Quiz Results
  async submitQuiz(submission: QuizSubmission, userId: string): Promise<QuizResult> {
    const { quizId, answers, timeSpent } = submission

    // Get the quiz with questions and grading criteria
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            options: true
          }
        },
        gradingCriteria: true
      }
    })

    if (!quiz) {
      throw new NotFoundError("Quiz not found", "QUIZ_NOT_FOUND")
    }

    if (!quiz.isPublic || quiz.status !== 'ACTIVE') {
      throw new ValidationError("Quiz is not available", "QUIZ_NOT_AVAILABLE")
    }

    // Calculate the result
    const result = this.calculateQuizResult(quiz, answers)

    // Create the quiz result
    const quizResult = await prisma.quizResult.create({
      data: {
        quizId,
        userId,
        score: result.score,
        maxScore: result.maxScore,
        percentage: result.percentage,
        level: result.level,
        feedback: result.feedback,
        recommendations: result.recommendations,
        completedAt: new Date(),
        timeSpent,
        answers: answers as any,
        classification: result.classification,
        areasOfImprovement: result.areasOfImprovement,
        supportNeeded: result.supportNeeded,
        proposedCourses: result.proposedCourses,
        proposedProducts: result.proposedProducts,
        proposedStreaks: result.proposedStreaks,
        proposedBlogPosts: result.proposedBlogPosts,
        color: result.color
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            category: true
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    // Update quiz statistics
    await this.updateQuizStatistics(quizId)

    return this.formatQuizResult(quizResult)
  }

  async getQuizResults(query: QuizResultQuery): Promise<{ results: QuizResult[]; total: number; page: number; totalPages: number }> {
    const { quizId, userId, level, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = query
    const skip = (page - 1) * limit

    const where: any = {}

    if (quizId) {
      where.quizId = quizId
    }

    if (userId) {
      where.userId = userId
    }

    if (level) {
      where.level = level
    }

    // Only exclude onboarding quiz results for user-facing queries (when userId is provided)
    // Admin/management queries should have access to all results including onboarding ones
    if (userId) {
      where.quiz = {
        category: {
          not: 'ONBOARDING'
        }
      }
    }

    const [results, total] = await Promise.all([
      prisma.quizResult.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy as string]: sortOrder },
        include: {
          quiz: {
            select: {
              id: true,
              title: true,
              category: true
            }
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }),
      prisma.quizResult.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return {
      results: results.map(result => this.formatQuizResult(result)),
      total,
      page,
      totalPages
    }
  }

  async getQuizResultById(id: string): Promise<QuizResult | null> {
    const result = await prisma.quizResult.findUnique({
      where: { id },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            category: true
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    return result ? this.formatQuizResult(result) : null
  }

  async getUserQuizResults(userId: string, page: number = 1, limit: number = 10): Promise<{ results: QuizResult[]; total: number; page: number; totalPages: number }> {
    return this.getQuizResults({ userId, page, limit })
  }

  // Quiz Analytics
  async getQuizAnalytics(quizId: string): Promise<QuizAnalytics> {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        results: true
      }
    })

    if (!quiz) {
      throw new NotFoundError("Quiz not found", "QUIZ_NOT_FOUND")
    }

    const results = quiz.results
    const totalAttempts = quiz.totalAttempts
    const completedAttempts = results.length
    const completionRate = totalAttempts > 0 ? (completedAttempts / totalAttempts) * 100 : 0

    if (completedAttempts === 0) {
      return {
        totalAttempts,
        completedAttempts,
        completionRate,
        averageScore: 0,
        averageTimeSpent: 0,
        levelDistribution: { excellent: 0, good: 0, fair: 0, needsImprovement: 0 },
        dropoffPoints: [],
        popularClassifications: [],
        timeDistribution: { fast: 0, normal: 0, slow: 0 }
      }
    }

    const averageScore = results.reduce((sum, result) => sum + result.score, 0) / completedAttempts
    const averageTimeSpent = results.reduce((sum, result) => sum + result.timeSpent, 0) / completedAttempts

    const levelDistribution = {
      excellent: results.filter(r => r.level === 'EXCELLENT').length,
      good: results.filter(r => r.level === 'GOOD').length,
      fair: results.filter(r => r.level === 'FAIR').length,
      needsImprovement: results.filter(r => r.level === 'NEEDS_IMPROVEMENT').length
    }

    const classificationCounts = results.reduce((acc, result) => {
      acc[result.classification] = (acc[result.classification] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const popularClassifications = Object.entries(classificationCounts)
      .map(([classification, count]) => ({
        classification,
        count,
        percentage: (count / completedAttempts) * 100
      }))
      .sort((a, b) => b.count - a.count)

    const timeDistribution = {
      fast: results.filter(r => r.timeSpent < 5).length,
      normal: results.filter(r => r.timeSpent >= 5 && r.timeSpent <= 15).length,
      slow: results.filter(r => r.timeSpent > 15).length
    }

    // Mock dropoff points (in real app, this would be calculated from actual data)
    const dropoffPoints = [
      { questionNumber: 1, dropoffCount: Math.floor(totalAttempts * 0.02), dropoffRate: 2.0 },
      { questionNumber: 5, dropoffCount: Math.floor(totalAttempts * 0.01), dropoffRate: 1.0 },
      { questionNumber: 8, dropoffCount: Math.floor(totalAttempts * 0.015), dropoffRate: 1.5 }
    ]

    return {
      totalAttempts,
      completedAttempts,
      completionRate,
      averageScore,
      averageTimeSpent,
      levelDistribution,
      dropoffPoints,
      popularClassifications,
      timeDistribution
    }
  }

  async getPublicQuizzes(query: QuizQuery): Promise<{ quizzes: Quiz[]; total: number; page: number; totalPages: number; categories: string[] }> {
    const { search, category, status, tags, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = query
    const skip = (page - 1) * limit

    const where: any = {
      isPublic: true,
      status: 'ACTIVE',
      quizType: 'DEFAULT'
    }

    // Enhanced search functionality
    if (search && search.trim()) {
      const searchTerm = search.trim()
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { subtitle: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { category: { contains: searchTerm, mode: 'insensitive' } },
        { tags: { hasSome: [searchTerm] } }
      ]
    }

    // Category filtering with "all" support
    if (category && category !== 'all' && category.trim()) {
      where.category = category.trim()
    }



    // Status filtering with "all" support
    if (status && status !== 'all' && status.trim()) {
      where.status = status.trim()
    }

    // Tags filtering
    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags
      }
    }

    // Get available categories for the current filter set
    const categoryQuery = { ...where }
    delete categoryQuery.skip
    delete categoryQuery.take
    delete categoryQuery.orderBy

    const [quizzes, total, categories] = await Promise.all([
      prisma.quiz.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy as string]: sortOrder },
        include: {
          questions: {
            include: {
              options: {
                orderBy: { order: 'asc' }
              }
            },
            orderBy: { order: 'asc' }
          },
          gradingCriteria: {
            orderBy: { minScore: 'asc' }
          },
          createdByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          }
        }
      }),
      prisma.quiz.count({ where }),
      prisma.quiz.findMany({
        where: categoryQuery,
        select: { category: true },
        distinct: ['category']
      })
    ])

    const totalPages = Math.ceil(total / limit)
    const uniqueCategories = [...new Set(categories.map(c => c.category))].sort()

    return {
      quizzes: quizzes.map(quiz => this.formatQuiz(quiz)),
      total,
      page,
      totalPages,
      categories: uniqueCategories
    }
  }

  // Private helper methods
  private calculateQuizResult(quiz: any, answers: any[]): QuizResultCalculation {
    let totalScore = 0
    let maxScore = 0

    // Calculate score based on answers
    for (const answer of answers) {
      const question = quiz.questions.find((q: any) => q.id === answer.questionId)
      if (question) {
        const option = question.options.find((o: any) => o.id === answer.optionId)
        if (option) {
          totalScore += option.value
        }
        maxScore += Math.max(...question.options.map((o: any) => o.value))
      }
    }

    const percentage = Math.round((totalScore / maxScore) * 100)

    // Find the appropriate grading criteria using raw scores, not percentages
    const matchingCriteria = quiz.gradingCriteria.find((criteria: any) =>
      totalScore >= criteria.minScore && totalScore <= criteria.maxScore
    )

    let level: QuizResultLevel
    let feedback: string
    let recommendations: string[]
    let classification: string
    let areasOfImprovement: string[]
    let supportNeeded: string[]
    let proposedCourses: Array<{ id: string; name: string; slug: string }> = []
    let proposedProducts: Array<{ id: string; name: string; slug: string }> = []
    let proposedStreaks: Array<{ id: string; name: string; slug: string }> = []
    let proposedBlogPosts: Array<{ id: string; title: string; slug: string }> = []

    if (matchingCriteria) {
      // Map criteria name to level
      const nameLower = matchingCriteria.name.toLowerCase()
      if (nameLower.includes('excellent') || nameLower.includes('master')) {
        level = 'EXCELLENT'
      } else if (nameLower.includes('good') || nameLower.includes('builder')) {
        level = 'GOOD'
      } else if (nameLower.includes('fair') || nameLower.includes('learner')) {
        level = 'FAIR'
      } else {
        level = 'NEEDS_IMPROVEMENT'
      }

      feedback = matchingCriteria.description || `You scored in the ${matchingCriteria.name} range.`
      recommendations = matchingCriteria.recommendations || []
      classification = matchingCriteria.label || matchingCriteria.name
      areasOfImprovement = matchingCriteria.areasOfImprovement || []
      supportNeeded = matchingCriteria.supportNeeded || []

      // Include recommended items from grading criteria
      proposedCourses = matchingCriteria.proposedCourses || []
      proposedProducts = matchingCriteria.proposedProducts || []
      proposedStreaks = matchingCriteria.proposedStreaks || []
      proposedBlogPosts = matchingCriteria.proposedBlogPosts || []
    } else {
      // Fallback to default logic
      if (percentage >= 80) {
        level = 'EXCELLENT'
        feedback = "Excellent! You demonstrate mastery in this area."
        recommendations = [
          "Continue building on your strong foundation",
          "Share your knowledge with others",
          "Consider mentoring or coaching others"
        ]
        classification = "Master"
        areasOfImprovement = []
        supportNeeded = ["Advanced resources", "Mentorship opportunities"]
      } else if (percentage >= 60) {
        level = 'GOOD'
        feedback = "Good! You have a solid foundation with room for improvement."
        recommendations = [
          "Focus on consistency in your practice",
          "Identify and work on your weakest areas",
          "Set specific, measurable goals"
        ]
        classification = "Builder"
        areasOfImprovement = ["Consistency", "Advanced techniques"]
        supportNeeded = ["Practice tools", "Accountability partner"]
      } else if (percentage >= 40) {
        level = 'FAIR'
        feedback = "Fair. You have potential but need to develop better practices."
        recommendations = [
          "Start with one small change",
          "Create a structured practice routine",
          "Seek accountability from friends or family"
        ]
        classification = "Learner"
        areasOfImprovement = ["Basic practices", "Consistency", "Understanding"]
        supportNeeded = ["Beginner resources", "Practice guidance", "Community support"]
      } else {
        level = 'NEEDS_IMPROVEMENT'
        feedback = "You have significant room for improvement in this area."
        recommendations = [
          "Start with very small, manageable changes",
          "Consider working with a coach or mentor",
          "Focus on building one practice at a time"
        ]
        classification = "Starter"
        areasOfImprovement = ["Basic understanding", "Practice habits", "Consistency"]
        supportNeeded = ["Professional guidance", "Structured programs", "Regular check-ins"]
      }
    }

    return {
      score: totalScore,
      maxScore,
      percentage,
      level,
      feedback,
      recommendations,
      classification,
      areasOfImprovement,
      supportNeeded,
      proposedCourses,
      proposedProducts,
      proposedStreaks,
      proposedBlogPosts,
      color: matchingCriteria?.color
    }
  }

  private async updateQuizStatistics(quizId: string): Promise<void> {
    const results = await prisma.quizResult.findMany({
      where: { quizId },
      select: { score: true, timeSpent: true }
    })

    const totalAttempts = await prisma.quizResult.count({ where: { quizId } })
    const completedAttempts = results.length
    const averageScore = completedAttempts > 0 ? results.reduce((sum, r) => sum + r.score, 0) / completedAttempts : 0
    const averageCompletionTime = completedAttempts > 0 ? results.reduce((sum, r) => sum + r.timeSpent, 0) / completedAttempts : 0

    await prisma.quiz.update({
      where: { id: quizId },
      data: {
        totalAttempts,
        completedAttempts,
        averageScore,
        averageCompletionTime
      }
    })
  }

  private formatQuizResult(result: any): QuizResult {
    return {
      id: result.id,
      quizId: result.quizId,
      userId: result.userId,
      score: result.score,
      maxScore: result.maxScore,
      percentage: result.percentage,
      level: result.level,
      feedback: result.feedback,
      recommendations: result.recommendations,
      completedAt: result.completedAt,
      timeSpent: result.timeSpent,
      answers: result.answers,
      classification: result.classification,
      areasOfImprovement: result.areasOfImprovement,
      supportNeeded: result.supportNeeded,
      color: result.color,
      proposedCourses: result.proposedCourses || [],
      proposedProducts: result.proposedProducts || [],
      proposedStreaks: result.proposedStreaks || [],
      proposedBlogPosts: result.proposedBlogPosts || [],
      user: result.user || null,
      quiz: result.quiz || null
    }
  }
}
