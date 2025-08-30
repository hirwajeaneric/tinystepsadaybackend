import { PrismaClient, QuizResultLevel, QuizType } from "@prisma/client"
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
    const { questions, gradingCriteria, complexGradingCriteria, dimensions, quizType, ...quizData } = data

    // Validate quiz data before creation
    const validationResult = this.validateQuizDataBeforeCreation(data)
    if (!validationResult.isValid) {
      throw new ValidationError(
        `Quiz validation failed: ${validationResult.errors.join(', ')}`,
        "QUIZ_VALIDATION_FAILED"
      )
    }

    // For COMPLEX quizzes, we need to create dimensions first, then questions
    if (quizType === QuizType.COMPLEX && dimensions) {
      // Step 1: Create the quiz with dimensions first
      const quiz = await prisma.quiz.create({
        data: {
          ...quizData,
          quizType: quizType || QuizType.DEFAULT,
          createdBy,
          dimensions: {
            create: dimensions.map((dim, index) => ({
              name: dim.name,
              shortName: dim.shortName,
              order: dim.order || index,
              minScore: dim.minScore,
              maxScore: dim.maxScore,
              threshold: dim.threshold,
              lowLabel: dim.lowLabel,
              highLabel: dim.highLabel
            }))
          },
          complexGradingCriteria: {
            create: complexGradingCriteria?.map((criteria) => ({
              name: criteria.name,
              label: criteria.label,
              color: criteria.color,
              recommendations: criteria.recommendations,
              areasOfImprovement: criteria.areasOfImprovement || [],
              supportNeeded: criteria.supportNeeded || [],
              proposedCourses: criteria.proposedCourses || [],
              proposedProducts: criteria.proposedProducts || [],
              proposedStreaks: criteria.proposedStreaks || [],
              proposedBlogPosts: criteria.proposedBlogPosts || [],
              description: criteria.description,
              scoringLogic: criteria.scoringLogic
            })) || []
          }
        },
        include: {
          dimensions: { orderBy: { order: 'asc' } },
          complexGradingCriteria: true,
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

      // Step 2: Create a mapping from dimension order to dimension ID
      const dimensionMap = new Map<number, string>()
      quiz.dimensions.forEach(dim => {
        dimensionMap.set(dim.order, dim.id)
      })

      // Step 3: Add questions with proper dimension references
      const questionsWithDimensions = questions.map((question, index) => {
        // Only use order-based mapping if dimensionId is explicitly undefined/null
        let dimensionId = question.dimensionId
        if (dimensionId === undefined || dimensionId === null) {
          // Fall back to order-based mapping only when no dimensionId provided
          dimensionId = dimensionMap.get(question.order)
        }

        // Validate that the dimensionId exists
        if (!dimensionId || !dimensionMap.has(quiz.dimensions.find(d => d.id === dimensionId)?.order || -1)) {
          throw new ValidationError(
            `Question ${index + 1} has invalid dimensionId: ${dimensionId}`,
            "INVALID_DIMENSION_ID"
          )
        }

        // Validate that the dimension object matches the dimensionId if provided
        if (question.dimension && question.dimension.id !== dimensionId) {
          throw new ValidationError(
            `Question ${index + 1} has mismatched dimension: dimension.id (${question.dimension.id}) != dimensionId (${dimensionId})`,
            "DIMENSION_MISMATCH"
          )
        }

        return {
          text: question.text,
          order: question.order || index,
          dimensionId: dimensionId,
          options: {
            create: question.options.map((option: any, optionIndex: number) => ({
              text: option.text,
              value: option.value,
              order: option.order || optionIndex
            }))
          }
        }
      })

      // Step 4: Update the quiz with questions
      const updatedQuiz = await prisma.quiz.update({
        where: { id: quiz.id },
        data: {
          questions: {
            create: questionsWithDimensions
          }
        },
        include: {
          questions: {
            include: {
              options: { orderBy: { order: 'asc' } },
              dimension: true
            },
            orderBy: { order: 'asc' }
          },
          gradingCriteria: { orderBy: { minScore: 'asc' } },
          complexGradingCriteria: true,
          dimensions: { orderBy: { order: 'asc' } },
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

      return this.formatQuiz(updatedQuiz)
    } else {
      // For DEFAULT quizzes, create everything in one go
      const quiz = await prisma.quiz.create({
        data: {
          ...quizData,
          quizType: quizType || QuizType.DEFAULT,
          createdBy,
          questions: {
            create: questions.map((question, index) => ({
              text: question.text,
              order: question.order || index,
              options: {
                create: question.options.map((option: any, optionIndex: number) => ({
                  text: option.text,
                  value: option.value,
                  order: option.order || optionIndex
                }))
              }
            }))
          },
          gradingCriteria: {
            create: gradingCriteria?.map((criteria) => ({
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
            })) || []
          }
        },
        include: {
          questions: {
            include: {
              options: { orderBy: { order: 'asc' } }
            },
            orderBy: { order: 'asc' }
          },
          gradingCriteria: { orderBy: { minScore: 'asc' } },
          complexGradingCriteria: true,
          dimensions: { orderBy: { order: 'asc' } },
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
  }

  // Progressive quiz creation - create quiz with basic info first
  async createQuizBasic(data: CreateQuizData, createdBy: string): Promise<Quiz> {
    const { questions, gradingCriteria, complexGradingCriteria, dimensions, ...basicData } = data

    // Validate only basic information
    const basicValidation = this.validateBasicQuizData(basicData)
    if (!basicValidation.isValid) {
      throw new ValidationError(
        `Basic quiz validation failed: ${basicValidation.errors.join(', ')}`,
        "QUIZ_BASIC_VALIDATION_FAILED"
      )
    }

    // Create quiz with only basic information
    const quiz = await prisma.quiz.create({
      data: {
        ...basicData,
        quizType: basicData.quizType || QuizType.DEFAULT,
        status: 'DRAFT',
        createdBy,
        // Don't create questions, dimensions, or grading criteria yet
        questions: { create: [] },
        gradingCriteria: { create: [] },
        complexGradingCriteria: { create: [] },
        dimensions: { create: [] }
      },
      include: {
        questions: { include: { options: true } },
        gradingCriteria: true,
        complexGradingCriteria: true,
        dimensions: true,
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

  // Add dimensions to existing quiz
  async addQuizDimensions(quizId: string, dimensions: any[], updatedBy: string): Promise<Quiz> {
    // Verify quiz exists and user has permission
    const existingQuiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: { createdBy: true, quizType: true }
    })

    if (!existingQuiz) {
      throw new NotFoundError("Quiz not found", "QUIZ_NOT_FOUND")
    }

    if (existingQuiz.createdBy !== updatedBy) {
      throw new AuthorizationError("Unauthorized to update this quiz", "INSUFFICIENT_PERMISSIONS")
    }

    if (existingQuiz.quizType !== QuizType.COMPLEX) {
      throw new ValidationError("Dimensions can only be added to complex quizzes", "INVALID_QUIZ_TYPE")
    }

    // Validate dimensions
    const dimensionValidation = this.validateDimensions(dimensions)
    if (!dimensionValidation.isValid) {
      throw new ValidationError(
        `Dimension validation failed: ${dimensionValidation.errors.join(', ')}`,
        "DIMENSION_VALIDATION_FAILED"
      )
    }

    // Delete existing dimensions and create new ones
    await prisma.quizDimension.deleteMany({ where: { quizId } })

    const quiz = await prisma.quiz.update({
      where: { id: quizId },
      data: {
        dimensions: {
          create: dimensions.map((dim, index) => ({
            name: dim.name,
            shortName: dim.shortName,
            order: dim.order || index,
            minScore: dim.minScore,
            maxScore: dim.maxScore,
            threshold: dim.threshold,
            lowLabel: dim.lowLabel,
            highLabel: dim.highLabel
          }))
        }
      },
      include: {
        questions: { include: { options: true } },
        gradingCriteria: true,
        complexGradingCriteria: true,
        dimensions: { orderBy: { order: 'asc' } },
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

  // Add questions to existing quiz with proper dimension assignment
  async addQuizQuestions(quizId: string, questions: any[], updatedBy: string): Promise<Quiz> {
    // Verify quiz exists and user has permission
    const existingQuiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        dimensions: true,
        questions: { include: { options: true } }
      }
    })

    if (!existingQuiz) {
      throw new NotFoundError("Quiz not found", "QUIZ_NOT_FOUND")
    }

    if (existingQuiz.createdBy !== updatedBy) {
      throw new AuthorizationError("Unauthorized to update this quiz", "INSUFFICIENT_PERMISSIONS")
    }

    // Validate questions
    const questionValidation = this.validateQuestions(questions, existingQuiz.quizType, existingQuiz.dimensions)
    if (!questionValidation.isValid) {
      throw new ValidationError(
        `Question validation failed: ${questionValidation.errors.join(', ')}`,
        "QUESTION_VALIDATION_FAILED"
      )
    }

    // Delete existing questions and create new ones
    await prisma.quizQuestion.deleteMany({ where: { quizId } })

    const quiz = await prisma.quiz.update({
      where: { id: quizId },
      data: {
        questions: {
          create: questions.map((question, index) => {
            // Validate that the dimension object matches the dimensionId if provided
            if (question.dimension && question.dimension.id !== question.dimensionId) {
              throw new ValidationError(
                `Question ${index + 1} has mismatched dimension: dimension.id (${question.dimension.id}) != dimensionId (${question.dimensionId})`,
                "DIMENSION_MISMATCH"
              )
            }

            return {
              text: question.text,
              order: question.order || index,
              dimensionId: question.dimensionId, // This should now be valid
              options: {
                create: question.options.map((option: any, optionIndex: number) => ({
                  text: option.text,
                  value: option.value,
                  order: option.order || optionIndex
                }))
              }
            }
          })
        }
      },
      include: {
        questions: {
          include: {
            options: { orderBy: { order: 'asc' } },
            dimension: true
          },
          orderBy: { order: 'asc' }
        },
        gradingCriteria: true,
        complexGradingCriteria: true,
        dimensions: { orderBy: { order: 'asc' } },
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

  // Add grading criteria to existing quiz
  async addQuizGradingCriteria(quizId: string, gradingData: any, updatedBy: string): Promise<Quiz> {
    // Verify quiz exists and user has permission
    const existingQuiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: { createdBy: true, quizType: true }
    })

    if (!existingQuiz) {
      throw new NotFoundError("Quiz not found", "QUIZ_NOT_FOUND")
    }

    if (existingQuiz.createdBy !== updatedBy) {
      throw new AuthorizationError("Unauthorized to update this quiz", "INSUFFICIENT_PERMISSIONS")
    }

    // Delete existing grading criteria
    if (existingQuiz.quizType === QuizType.COMPLEX) {
      await prisma.complexGradingCriteria.deleteMany({ where: { quizId } })
    } else {
      await prisma.gradingCriteria.deleteMany({ where: { quizId } })
    }

    // Create new grading criteria
    const quiz = await prisma.quiz.update({
      where: { id: quizId },
      data: existingQuiz.quizType === QuizType.COMPLEX ? {
        complexGradingCriteria: {
          create: gradingData.complexGradingCriteria.map((criteria: any) => ({
            name: criteria.name,
            label: criteria.label,
            color: criteria.color,
            recommendations: criteria.recommendations,
            areasOfImprovement: criteria.areasOfImprovement || [],
            supportNeeded: criteria.supportNeeded || [],
            proposedCourses: criteria.proposedCourses || [],
            proposedProducts: criteria.proposedProducts || [],
            proposedStreaks: criteria.proposedStreaks || [],
            proposedBlogPosts: criteria.proposedBlogPosts || [],
            description: criteria.description,
            scoringLogic: criteria.scoringLogic
          }))
        }
      } : {
        gradingCriteria: {
          create: gradingData.gradingCriteria.map((criteria: any) => ({
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
            proposedStreaks: criteria.proposedStreaks || [],
            proposedBlogPosts: criteria.proposedBlogPosts || [],
            description: criteria.description
          }))
        }
      },
      include: {
        questions: {
          include: {
            options: { orderBy: { order: 'asc' } },
            dimension: true
          },
          orderBy: { order: 'asc' }
        },
        gradingCriteria: { orderBy: { minScore: 'asc' } },
        complexGradingCriteria: true,
        dimensions: { orderBy: { order: 'asc' } },
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

  private formatQuiz(quiz: any): Quiz {
    return {
      id: quiz.id,
      quizType: quiz.quizType,
      redirectAfterAnswer: quiz.redirectAfterAnswer,
      title: quiz.title,
      subtitle: quiz.subtitle,
      description: quiz.description,
      coverImage: quiz.coverImage || '',
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
        dimensionId: q.dimensionId,
        dimension: q.dimension ? {
          id: q.dimension.id,
          name: q.dimension.name,
          shortName: q.dimension.shortName,
          order: q.dimension.order,
          minScore: q.dimension.minScore,
          maxScore: q.dimension.maxScore,
          threshold: q.dimension.threshold,
          lowLabel: q.dimension.lowLabel,
          highLabel: q.dimension.highLabel
        } : null,
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
      complexGradingCriteria: quiz.complexGradingCriteria?.map((cgc: any) => ({
        id: cgc.id,
        name: cgc.name,
        label: cgc.label,
        color: cgc.color,
        recommendations: cgc.recommendations,
        areasOfImprovement: cgc.areasOfImprovement,
        supportNeeded: cgc.supportNeeded,
        proposedCourses: cgc.proposedCourses,
        proposedProducts: cgc.proposedProducts,
        proposedStreaks: cgc.proposedStreaks,
        proposedBlogPosts: cgc.proposedBlogPosts,
        description: cgc.description,
        scoringLogic: cgc.scoringLogic
      })) || [],
      dimensions: quiz.dimensions?.map((d: any) => ({
        id: d.id,
        name: d.name,
        shortName: d.shortName,
        order: d.order,
        minScore: d.minScore,
        maxScore: d.maxScore,
        threshold: d.threshold,
        lowLabel: d.lowLabel,
        highLabel: d.highLabel
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
    if (category) where.category = category
    if (status) where.status = status
    if (isPublic !== undefined) where.isPublic = isPublic
    if (quizType) where.quizType = quizType
    if (createdBy) where.createdBy = createdBy
    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags }
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
              options: { orderBy: { order: 'asc' } },
              dimension: true
            },
            orderBy: { order: 'asc' }
          },
          gradingCriteria: { orderBy: { minScore: 'asc' } },
          complexGradingCriteria: true,
          dimensions: { orderBy: { order: 'asc' } },
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
            options: { orderBy: { order: 'asc' } },
            dimension: true
          },
          orderBy: { order: 'asc' }
        },
        gradingCriteria: { orderBy: { minScore: 'asc' } },
        complexGradingCriteria: true,
        dimensions: { orderBy: { order: 'asc' } },
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
            options: { orderBy: { order: 'asc' } },
            dimension: true
          },
          orderBy: { order: 'asc' }
        },
        gradingCriteria: { orderBy: { minScore: 'asc' } },
        complexGradingCriteria: true,
        dimensions: { orderBy: { order: 'asc' } }
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
            options: { orderBy: { order: 'asc' } },
            dimension: true
          },
          orderBy: { order: 'asc' }
        },
        gradingCriteria: { orderBy: { minScore: 'asc' } },
        complexGradingCriteria: true,
        dimensions: { orderBy: { order: 'asc' } },
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

    const { questions, gradingCriteria, complexGradingCriteria, dimensions, quizType, ...quizData } = data

    if (questions) {
      await prisma.quizQuestion.deleteMany({ where: { quizId: id } })
    }

    if (gradingCriteria && quizType !== QuizType.COMPLEX) {
      await prisma.gradingCriteria.deleteMany({ where: { quizId: id } })
    }

    if (complexGradingCriteria && quizType === QuizType.COMPLEX) {
      await prisma.complexGradingCriteria.deleteMany({ where: { quizId: id } })
    }

    if (dimensions && quizType === QuizType.COMPLEX) {
      await prisma.quizDimension.deleteMany({ where: { quizId: id } })
    }

    // For COMPLEX quizzes, we need to create dimensions first, then questions
    if (quizType === QuizType.COMPLEX && dimensions && questions) {
      // Step 1: Update the quiz with dimensions first
      const quiz = await prisma.quiz.update({
        where: { id },
        data: {
          ...quizData,
          quizType: quizType || QuizType.DEFAULT,
          dimensions: {
            create: dimensions.map((dim, index) => ({
              name: dim.name,
              shortName: dim.shortName,
              order: dim.order || index,
              minScore: dim.minScore,
              maxScore: dim.maxScore,
              threshold: dim.threshold,
              lowLabel: dim.lowLabel,
              highLabel: dim.highLabel
            }))
          },
          complexGradingCriteria: {
            create: complexGradingCriteria?.map((criteria) => ({
              name: criteria.name,
              label: criteria.label,
              color: criteria.color,
              recommendations: criteria.recommendations,
              areasOfImprovement: criteria.areasOfImprovement || [],
              supportNeeded: criteria.supportNeeded || [],
              proposedCourses: criteria.proposedCourses || [],
              proposedProducts: criteria.proposedProducts || [],
              proposedStreaks: criteria.proposedStreaks || [],
              proposedBlogPosts: criteria.proposedBlogPosts || [],
              description: criteria.description,
              scoringLogic: criteria.scoringLogic
            })) || []
          }
        },
        include: {
          dimensions: { orderBy: { order: 'asc' } },
          complexGradingCriteria: true,
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

      // Step 2: Create a mapping from dimension order to dimension ID
      const dimensionMap = new Map<number, string>()
      quiz.dimensions.forEach(dim => {
        dimensionMap.set(dim.order, dim.id)
      })

      // Step 3: Add questions with proper dimension references
      const questionsWithDimensions = questions.map((question, index) => {
        // Only use order-based mapping if dimensionId is explicitly undefined/null
        let dimensionId = question.dimensionId
        if (dimensionId === undefined || dimensionId === null) {
          // Fall back to order-based mapping only when no dimensionId provided
          dimensionId = dimensionMap.get(question.order)
        }

        // Validate that the dimensionId exists
        if (!dimensionId || !dimensionMap.has(quiz.dimensions.find(d => d.id === dimensionId)?.order || -1)) {
          throw new ValidationError(
            `Question ${index + 1} has invalid dimensionId: ${dimensionId}`,
            "INVALID_DIMENSION_ID"
          )
        }

        // Validate that the dimension object matches the dimensionId if provided
        if (question.dimension && question.dimension.id !== dimensionId) {
          throw new ValidationError(
            `Question ${index + 1} has mismatched dimension: dimension.id (${question.dimension.id}) != dimensionId (${dimensionId})`,
            "DIMENSION_MISMATCH"
          )
        }

        return {
          text: question.text,
          order: question.order || index,
          dimensionId: dimensionId,
          options: {
            create: question.options.map((option: any, optionIndex: number) => ({
              text: option.text,
              value: option.value,
              order: option.order || optionIndex
            }))
          }
        }
      })

      // Step 4: Update the quiz with questions
      const updatedQuiz = await prisma.quiz.update({
        where: { id: quiz.id },
        data: {
          questions: {
            create: questionsWithDimensions
          }
        },
        include: {
          questions: {
            include: {
              options: { orderBy: { order: 'asc' } },
              dimension: true
            },
            orderBy: { order: 'asc' }
          },
          gradingCriteria: { orderBy: { minScore: 'asc' } },
          complexGradingCriteria: true,
          dimensions: { orderBy: { order: 'asc' } },
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

      return this.formatQuiz(updatedQuiz)
    } else {
      // For DEFAULT quizzes or when not updating questions, create everything in one go
      const quiz = await prisma.quiz.update({
        where: { id },
        data: {
          ...quizData,
          quizType: quizType || QuizType.DEFAULT,
          ...(questions && {
            questions: {
              create: questions.map((question, index) => ({
                text: question.text,
                order: question.order || index,
                options: {
                  create: question.options.map((option: any, optionIndex: number) => ({
                    text: option.text,
                    value: option.value,
                    order: option.order || optionIndex
                  }))
                }
              }))
            }
          }),
          ...(quizType === QuizType.COMPLEX && dimensions
            ? {
              dimensions: {
                create: dimensions.map((dim, index) => ({
                  name: dim.name,
                  shortName: dim.shortName,
                  order: dim.order || index,
                  minScore: dim.minScore,
                  maxScore: dim.maxScore,
                  threshold: dim.threshold,
                  lowLabel: dim.lowLabel,
                  highLabel: dim.highLabel
                }))
              }
            }
            : {}),
          ...(quizType === QuizType.COMPLEX && complexGradingCriteria
            ? {
              complexGradingCriteria: {
                create: complexGradingCriteria.map((criteria) => ({
                  name: criteria.name,
                  label: criteria.label,
                  color: criteria.color,
                  recommendations: criteria.recommendations,
                  areasOfImprovement: criteria.areasOfImprovement || [],
                  supportNeeded: criteria.supportNeeded || [],
                  proposedCourses: criteria.proposedCourses || [],
                  proposedProducts: criteria.proposedProducts || [],
                  proposedStreaks: criteria.proposedStreaks || [],
                  proposedBlogPosts: criteria.proposedBlogPosts || [],
                  description: criteria.description,
                  scoringLogic: criteria.scoringLogic
                }))
              }
            }
            : {
              gradingCriteria: {
                create: gradingCriteria?.map((criteria) => ({
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
                  proposedStreaks: criteria.proposedStreaks || [],
                  proposedBlogPosts: criteria.proposedBlogPosts || [],
                  description: criteria.description
                })) || []
              }
            })
        },
        include: {
          questions: {
            include: {
              options: { orderBy: { order: 'asc' } },
              dimension: true
            },
            orderBy: { order: 'asc' }
          },
          gradingCriteria: { orderBy: { minScore: 'asc' } },
          complexGradingCriteria: true,
          dimensions: { orderBy: { order: 'asc' } },
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
  }

  async deleteQuiz(id: string, deletedBy: string): Promise<void> {
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

    await prisma.quiz.delete({ where: { id } })
  }

  async submitQuiz(submission: QuizSubmission, userId: string): Promise<QuizResult> {
    const { quizId, answers, timeSpent } = submission;

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            options: true,
            dimension: true
          }
        },
        gradingCriteria: true,
        complexGradingCriteria: true,
        dimensions: true
      }
    })

    if (!quiz) {
      throw new NotFoundError("Quiz not found", "QUIZ_NOT_FOUND")
    }

    if (!quiz.isPublic || quiz.status !== 'ACTIVE') {
      throw new ValidationError("Quiz is not available", "QUIZ_NOT_AVAILABLE")
    }

    const result = this.calculateQuizResult(quiz, answers)

    const quizResult = await prisma.quizResult.create({
      data: {
        quizId,
        userId,
        score: result.score,
        maxScore: result.maxScore,
        dimensionScores: result.dimensionScores,
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

    await this.updateQuizStatistics(quizId)

    return this.formatQuizResult(quizResult)
  }

  async getQuizResults(query: QuizResultQuery): Promise<{ results: QuizResult[]; total: number; page: number; totalPages: number }> {
    const { quizId, userId, level, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = query
    const skip = (page - 1) * limit

    const where: any = {}
    if (quizId) where.quizId = quizId
    if (userId) where.userId = userId
    if (level) where.level = level
    if (userId) {
      where.quiz = { category: { not: 'ONBOARDING' } }
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

  async getQuizAnalytics(quizId: string): Promise<QuizAnalytics> {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        results: true,
        dimensions: true
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
        dimensionDistribution: quiz.dimensions.reduce((acc, dim) => ({ ...acc, [dim.shortName]: { average: 0, min: dim.minScore, max: dim.maxScore } }), {}),
        dropoffPoints: [],
        popularClassifications: [],
        timeDistribution: { fast: 0, normal: 0, slow: 0 }
      }
    }

    const averageScore = quiz.quizType === QuizType.DEFAULT && results.length > 0
      ? results.reduce((sum, result) => sum + (result.score || 0), 0) / completedAttempts
      : 0
    const averageTimeSpent = results.reduce((sum, result) => sum + result.timeSpent, 0) / completedAttempts

    const levelDistribution = quiz.quizType === QuizType.DEFAULT
      ? {
        excellent: results.filter(r => r.level === 'EXCELLENT').length,
        good: results.filter(r => r.level === 'GOOD').length,
        fair: results.filter(r => r.level === 'FAIR').length,
        needsImprovement: results.filter(r => r.level === 'NEEDS_IMPROVEMENT').length
      }
      : { excellent: 0, good: 0, fair: 0, needsImprovement: 0 }

    const dimensionDistribution = quiz.quizType === QuizType.COMPLEX && quiz.dimensions.length > 0
      ? quiz.dimensions.reduce((acc, dim) => {
        const scores = results
          .map(r => {
            const dimensionScores = r.dimensionScores as Record<string, number> | null;
            return dimensionScores?.[dim.shortName] || 0;
          })
          .filter(score => score !== 0)
        const avg = scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / scores.length : 0
        return {
          ...acc,
          [dim.shortName]: { average: avg, min: dim.minScore, max: dim.maxScore }
        }
      }, {})
      : {}

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
      dimensionDistribution,
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
      quizType: { in: [QuizType.DEFAULT, QuizType.COMPLEX] }
    }

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

    if (category && category !== 'all' && category.trim()) {
      where.category = category.trim()
    }

    if (status && status !== 'all' && status.trim()) {
      where.status = status.trim()
    }

    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags }
    }

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
              options: { orderBy: { order: 'asc' } },
              dimension: true
            },
            orderBy: { order: 'asc' }
          },
          gradingCriteria: { orderBy: { minScore: 'asc' } },
          complexGradingCriteria: true,
          dimensions: { orderBy: { order: 'asc' } },
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

  private calculateQuizResult(quiz: any, answers: any[]): QuizResultCalculation {
    if (quiz.quizType === QuizType.COMPLEX) {
      return this.calculateComplexQuizResult(quiz, answers)
    }

    let totalScore = 0
    let maxScore = 0

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

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0

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
      level = matchingCriteria.level || this.calculateLevelFromPercentage(percentage)
      feedback = matchingCriteria.description || `You scored in the ${matchingCriteria.name} range.`
      recommendations = matchingCriteria.recommendations || []
      classification = matchingCriteria.label || matchingCriteria.name
      areasOfImprovement = matchingCriteria.areasOfImprovement || []
      supportNeeded = matchingCriteria.supportNeeded || []
      proposedCourses = matchingCriteria.proposedCourses || []
      proposedProducts = matchingCriteria.proposedProducts || []
      proposedStreaks = matchingCriteria.proposedStreaks || []
      proposedBlogPosts = matchingCriteria.proposedBlogPosts || []
    } else {
      level = this.calculateLevelFromPercentage(percentage)
      feedback = `You scored ${percentage}%.`
      recommendations = []
      classification = "Standard"
      areasOfImprovement = []
      supportNeeded = []
      proposedCourses = []
      proposedProducts = []
      proposedStreaks = []
      proposedBlogPosts = []
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

  private calculateComplexQuizResult(quiz: any, answers: any[]): QuizResultCalculation {
    const dimensionScores: Record<string, number> = {}
    let maxScore = 0

    // Initialize dimension scores
    for (const dim of quiz.dimensions) {
      dimensionScores[dim.shortName] = 0
      const dimQuestions = quiz.questions.filter((q: any) => q.dimensionId === dim.id)
      maxScore += dimQuestions.length * Math.max(...dimQuestions.flatMap((q: any) => q.options.map((o: any) => o.value)))
    }

    // Calculate scores per dimension
    for (const answer of answers) {
      const question = quiz.questions.find((q: any) => q.id === answer.questionId)
      if (question && question.dimensionId) {
        const option = question.options.find((o: any) => o.id === answer.optionId)
        if (option && typeof option.value === 'number') {
          const dimension = quiz.dimensions.find((d: any) => d.id === question.dimensionId)
          if (dimension) {
            dimensionScores[dimension.shortName] = (dimensionScores[dimension.shortName] || 0) + option.value
          }
        }
      }
    }

    // Debug logging for troubleshooting
    console.log('Quiz dimensions:', quiz.dimensions.map((d: any) => ({ id: d.id, shortName: d.shortName, threshold: d.threshold })))
    console.log('Calculated dimension scores:', dimensionScores)
    console.log('Complex grading criteria:', quiz.complexGradingCriteria.map((c: any) => ({ name: c.name, scoringLogic: c.scoringLogic })))

    // Check if we have a dimension ID mismatch issue
    const totalQuestionsWithDimensions = quiz.questions.filter((q: any) => q.dimensionId).length
    const totalQuestions = quiz.questions.length
    const dimensionMismatchDetected = totalQuestionsWithDimensions === 0 && totalQuestions > 0

    if (dimensionMismatchDetected) {
      console.log('⚠️ DIMENSION ID MISMATCH DETECTED: Questions have dimensionId but none match quiz dimensions')
      console.log('Attempting to fix using question order-based dimension assignment...')

      // Try to fix by assigning dimensions based on question order
      const fixedDimensionScores = this.fixDimensionMismatch(quiz, answers)
      if (Object.values(fixedDimensionScores).some(score => score > 0)) {
        console.log('✅ Fixed dimension scores:', fixedDimensionScores)
        Object.assign(dimensionScores, fixedDimensionScores)
      }
    }

    // Determine classification based on scoringLogic
    let classification = ''
    let feedback = ''
    let recommendations: string[] = []
    let areasOfImprovement: string[] = []
    let supportNeeded: string[] = []
    let proposedCourses: Array<{ id: string; name: string; slug: string }> = []
    let proposedProducts: Array<{ id: string; name: string; slug: string }> = []
    let proposedStreaks: Array<{ id: string; name: string; slug: string }> = []
    let proposedBlogPosts: Array<{ id: string; title: string; slug: string }> = []
    let color: string | undefined

    for (const criteria of quiz.complexGradingCriteria) {
      const { scoringLogic } = criteria

      if (scoringLogic.type === 'threshold') {
        // e.g., MBTI, Attachment Style
        const matches = scoringLogic.dimensions.every((dim: any) => {
          const score = dimensionScores[dim.name]
          if (typeof score === 'undefined') return false

          // Fix the threshold logic for MBTI
          if (dim.value === 'low') {
            return score <= dim.threshold
          } else if (dim.value === 'high') {
            return score > dim.threshold
          }
          return false
        })

        // Debug logging for threshold matching
        console.log(`Checking criteria ${criteria.name}:`, {
          scoringLogic: scoringLogic.dimensions.map((dim: any) => ({
            name: dim.name,
            value: dim.value,
            threshold: dim.threshold,
            actualScore: dimensionScores[dim.name],
            matches: (() => {
              const score = dimensionScores[dim.name]
              if (typeof score === 'undefined') return false
              if (dim.value === 'low') return score <= dim.threshold
              if (dim.value === 'high') return score > dim.threshold
              return false
            })()
          })),
          overallMatch: matches
        })

        if (matches) {
          classification = criteria.name
          feedback = criteria.description || `You are classified as ${criteria.label}.`
          recommendations = criteria.recommendations || []
          areasOfImprovement = criteria.areasOfImprovement || []
          supportNeeded = criteria.supportNeeded || []
          proposedCourses = criteria.proposedCourses || []
          proposedProducts = criteria.proposedProducts || []
          proposedStreaks = criteria.proposedStreaks || []
          proposedBlogPosts = criteria.proposedBlogPosts || []
          color = criteria.color
          break
        }
      } else if (scoringLogic.type === 'highest') {
        // e.g., Enneagram, Love Languages
        const targetDimension = scoringLogic.dimension
        const score = dimensionScores[targetDimension]
        if (typeof score !== 'undefined' && score >= scoringLogic.minScore && score <= scoringLogic.maxScore) {
          classification = criteria.name
          feedback = criteria.description || `You are classified as ${criteria.label}.`
          recommendations = criteria.recommendations || []
          areasOfImprovement = criteria.areasOfImprovement || []
          supportNeeded = criteria.supportNeeded || []
          proposedCourses = criteria.proposedCourses || []
          proposedProducts = criteria.proposedProducts || []
          proposedStreaks = criteria.proposedStreaks || []
          proposedBlogPosts = criteria.proposedBlogPosts || []
          color = criteria.color
          break
        }
      } else if (scoringLogic.type === 'topN') {
        // e.g., RIASEC, Core Values
        const sortedDimensions = Object.entries(dimensionScores)
          .sort(([, a], [, b]) => b - a)
          .slice(0, scoringLogic.n)
          .map(([name]) => name)
        if (sortedDimensions.join('/') === scoringLogic.dimensions.join('/')) {
          classification = criteria.name
          feedback = criteria.description || `You are classified as ${criteria.label}.`
          recommendations = criteria.recommendations || []
          areasOfImprovement = criteria.areasOfImprovement || []
          supportNeeded = criteria.supportNeeded || []
          proposedCourses = criteria.proposedCourses || []
          proposedProducts = criteria.proposedProducts || []
          proposedStreaks = criteria.proposedStreaks || []
          proposedBlogPosts = criteria.proposedBlogPosts || []
          color = criteria.color
          break
        }
      }
    }

    // Fallback if no criteria match - provide more helpful feedback
    if (!classification) {
      // For MBTI, provide partial classification based on individual dimensions
      if (quiz.category === 'Personal Growth' && quiz.tags?.includes('MBTI')) {
        const partialType = this.generatePartialMBTI(dimensionScores, quiz.dimensions)
        classification = partialType || 'Unknown'

        if (dimensionMismatchDetected) {
          feedback = `⚠️ Quiz data structure issue detected. Partial classification: ${partialType || 'Incomplete'}. This may be due to a technical issue with the quiz configuration.`
          recommendations = ['Contact support to fix quiz configuration', 'Consider retaking the quiz later', 'Check if this is a known issue']
          areasOfImprovement = ['Quiz data integrity', 'Technical configuration']
          supportNeeded = ['Technical support', 'Quiz data repair']
        } else {
          feedback = `Unable to determine a complete MBTI type. Partial classification: ${partialType || 'Incomplete'}. This may be due to balanced scores or incomplete responses.`
          recommendations = ['Review your answers for consistency', 'Consider retaking the quiz', 'Focus on your natural preferences rather than learned behaviors']
          areasOfImprovement = ['Clarity in responses', 'Consistency in preferences']
          supportNeeded = ['Additional guidance', 'MBTI interpretation resources']
        }
      } else {
        classification = 'Unknown'
        feedback = 'Unable to determine a specific classification based on your answers.'
        recommendations = ['Review your answers', 'Consider retaking the quiz']
        areasOfImprovement = ['Clarity in responses']
        supportNeeded = ['Additional guidance']
      }
    }

    return {
      score: undefined, // Not used for COMPLEX
      maxScore: undefined,
      dimensionScores,
      percentage: undefined,
      level: undefined,
      feedback,
      recommendations,
      classification,
      areasOfImprovement,
      supportNeeded,
      proposedCourses,
      proposedProducts,
      proposedStreaks,
      proposedBlogPosts,
      color
    }
  }

  // Helper method to fix dimension ID mismatches
  private fixDimensionMismatch(quiz: any, answers: any[]): Record<string, number> {
    const fixedScores: Record<string, number> = {}

    // Initialize scores
    for (const dim of quiz.dimensions) {
      fixedScores[dim.shortName] = 0
    }

    // Sort questions by order and assign dimensions based on position
    const sortedQuestions = [...quiz.questions].sort((a, b) => a.order - b.order)
    const questionsPerDimension = Math.ceil(sortedQuestions.length / quiz.dimensions.length)

    for (let i = 0; i < sortedQuestions.length; i++) {
      const question = sortedQuestions[i]
      const dimensionIndex = Math.floor(i / questionsPerDimension)
      const dimension = quiz.dimensions[dimensionIndex]

      if (dimension && question) {
        // Find the answer for this question
        const answer = answers.find(a => a.questionId === question.id)
        if (answer) {
          const option = question.options.find((o: any) => o.id === answer.optionId)
          if (option && typeof option.value === 'number') {
            fixedScores[dimension.shortName] += option.value
          }
        }
      }
    }

    return fixedScores
  }

  // Helper method to generate partial MBTI classification
  private generatePartialMBTI(dimensionScores: Record<string, number>, dimensions: any[]): string {
    let partialType = ''

    for (const dim of dimensions) {
      const score = dimensionScores[dim.shortName]
      if (typeof score !== 'undefined') {
        if (dim.shortName === 'E/I') {
          partialType += score <= (dim.threshold || 15) ? 'I' : 'E'
        } else if (dim.shortName === 'S/N') {
          partialType += score <= (dim.threshold || 20) ? 'N' : 'S'
        } else if (dim.shortName === 'T/F') {
          partialType += score <= (dim.threshold || 5) ? 'F' : 'T'
        } else if (dim.shortName === 'J/P') {
          partialType += score <= (dim.threshold || 5) ? 'P' : 'J'
        }
      } else {
        partialType += '?'
      }
    }

    return partialType.length === 4 ? partialType : partialType + '?'.repeat(4 - partialType.length)
  }

  private async updateQuizStatistics(quizId: string): Promise<void> {
    const results = await prisma.quizResult.findMany({
      where: { quizId },
      select: { score: true, timeSpent: true }
    })

    const totalAttempts = await prisma.quizResult.count({ where: { quizId } })
    const completedAttempts = results.length
    const averageScore = completedAttempts > 0 ? results.reduce((sum, r) => sum + (r.score || 0), 0) / completedAttempts : 0
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
      dimensionScores: result.dimensionScores,
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

  private calculateLevelFromPercentage(percentage: number): QuizResultLevel {
    if (percentage >= 90) return 'EXCELLENT'
    if (percentage >= 70) return 'GOOD'
    if (percentage >= 50) return 'FAIR'
    return 'NEEDS_IMPROVEMENT'
  }

  // Data repair utility method for fixing existing quiz data
  async repairQuizData(quizId: string): Promise<{ success: boolean; message: string; issues: string[] }> {
    const issues: string[] = []

    try {
      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: {
          questions: {
            include: {
              options: true,
              dimension: true
            }
          },
          dimensions: true,
          complexGradingCriteria: true
        }
      })

      if (!quiz) {
        throw new Error("Quiz not found")
      }

      // Check for questions without dimensionId
      const questionsWithoutDimension = quiz.questions.filter(q => !q.dimensionId)
      if (questionsWithoutDimension.length > 0) {
        issues.push(`${questionsWithoutDimension.length} questions missing dimensionId`)

        // Try to fix by assigning dimensions based on order
        if (quiz.dimensions && quiz.dimensions.length > 0) {
          for (const question of questionsWithoutDimension) {
            const dimensionIndex = Math.floor(question.order / Math.ceil(quiz.questions.length / quiz.dimensions.length))
            const dimension = quiz.dimensions[dimensionIndex]

            if (dimension) {
              await prisma.quizQuestion.update({
                where: { id: question.id },
                data: { dimensionId: dimension.id }
              })
              issues.push(`Fixed question ${question.id} - assigned to dimension ${dimension.shortName}`)
            }
          }
        }
      }

      // Check for dimensions without proper configuration
      if (quiz.dimensions) {
        for (const dim of quiz.dimensions) {
          if (!dim.minScore || !dim.maxScore) {
            issues.push(`Dimension ${dim.shortName} missing minScore or maxScore`)

            // Calculate reasonable defaults
            const dimQuestions = quiz.questions.filter(q => q.dimensionId === dim.id)
            if (dimQuestions.length > 0) {
              let totalMaxScore = 0
              for (const question of dimQuestions) {
                if (question.options && question.options.length > 0) {
                  const maxOptionValue = Math.max(...question.options.map((o: any) => o.value))
                  totalMaxScore += maxOptionValue
                }
              }

              const minScore = 0
              const maxScore = totalMaxScore

              await prisma.quizDimension.update({
                where: { id: dim.id },
                data: { minScore, maxScore }
              })

              issues.push(`Fixed dimension ${dim.shortName} - set minScore: ${minScore}, maxScore: ${maxScore}`)
            }
          }
        }
      }

      // Check for complex grading criteria issues
      if (quiz.complexGradingCriteria) {
        for (const criteria of quiz.complexGradingCriteria) {
          const scoringLogic = criteria.scoringLogic as any
          if (!scoringLogic || !scoringLogic.type) {
            issues.push(`Complex grading criteria ${criteria.name} missing scoring logic`)
          }
        }
      }

      return {
        success: true,
        message: `Quiz data repair completed. ${issues.length} issues found and addressed.`,
        issues
      }
    } catch (error) {
      console.error(`Error repairing quiz data for ${quizId}:`, error)
      return {
        success: false,
        message: `Failed to repair quiz data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        issues
      }
    }
  }

  // Utility method to validate quiz data integrity
  async validateQuizData(quizId: string): Promise<{ isValid: boolean; issues: string[]; warnings: string[] }> {
    const issues: string[] = []
    const warnings: string[] = []

    try {
      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: {
          questions: {
            include: {
              options: true,
              dimension: true
            }
          },
          dimensions: true,
          complexGradingCriteria: true
        }
      })

      if (!quiz) {
        return { isValid: false, issues: ["Quiz not found"], warnings: [] }
      }

      // Check questions
      if (!quiz.questions || quiz.questions.length === 0) {
        issues.push("No questions found")
      } else {
        for (const question of quiz.questions) {
          if (!question.options || question.options.length === 0) {
            issues.push(`Question ${question.order + 1} has no options`)
          }

          if (quiz.quizType === QuizType.COMPLEX && !question.dimensionId) {
            issues.push(`Question ${question.order + 1} missing dimensionId`)
          }
        }
      }

      // Check dimensions for complex quizzes
      if (quiz.quizType === QuizType.COMPLEX) {
        if (!quiz.dimensions || quiz.dimensions.length === 0) {
          issues.push("Complex quiz missing dimensions")
        } else {
          for (const dim of quiz.dimensions) {
            if (!dim.minScore || !dim.maxScore) {
              issues.push(`Dimension ${dim.shortName} missing score range`)
            }

            if (!dim.threshold) {
              warnings.push(`Dimension ${dim.shortName} missing threshold (may affect scoring)`)
            }
          }
        }

        if (!quiz.complexGradingCriteria || quiz.complexGradingCriteria.length === 0) {
          issues.push("Complex quiz missing grading criteria")
        }
      }

      return {
        isValid: issues.length === 0,
        issues,
        warnings
      }
    } catch (error) {
      console.error(`Error validating quiz data for ${quizId}:`, error)
      return {
        isValid: false,
        issues: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: []
      }
    }
  }

  // Validate quiz data before creation/update
  private validateQuizDataBeforeCreation(data: CreateQuizData): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Basic validation
    if (!data.title?.trim()) errors.push('Quiz title is required')
    if (!data.description?.trim()) errors.push('Quiz description is required')
    if (!data.category?.trim()) errors.push('Quiz category is required')

    // Questions validation
    if (!data.questions || data.questions.length === 0) {
      errors.push('At least one question is required')
    } else {
      data.questions.forEach((q, index) => {
        if (!q.text?.trim()) errors.push(`Question ${index + 1} text is required`)
        if (!q.options || q.options.length < 2) {
          errors.push(`Question ${index + 1} must have at least 2 options`)
        }

        // For complex quizzes, validate dimension assignment
        if (data.quizType === QuizType.COMPLEX) {
          if (!q.dimensionId) {
            errors.push(`Question ${index + 1} must be assigned to a dimension`)
          }
        }
      })
    }

    // Dimensions validation for complex quizzes
    if (data.quizType === QuizType.COMPLEX) {
      if (!data.dimensions || data.dimensions.length === 0) {
        errors.push('Complex quizzes must have at least one dimension')
      } else {
        data.dimensions.forEach((dim, index) => {
          if (!dim.name?.trim()) errors.push(`Dimension ${index + 1} name is required`)
          if (!dim.shortName?.trim()) errors.push(`Dimension ${index + 1} short name is required`)
          if (dim.minScore === undefined || dim.maxScore === undefined) {
            errors.push(`Dimension ${index + 1} must have score range defined`)
          }
          if (dim.threshold === undefined) {
            errors.push(`Dimension ${index + 1} must have threshold defined`)
          }
        })

        // Validate that all questions are assigned to valid dimensions
        if (data.questions && data.dimensions) {
          const validDimensionShortNames = data.dimensions.map(d => d.shortName)
          const unassignedQuestions = data.questions.filter(q => !q.dimensionId || !validDimensionShortNames.includes(q.dimensionId))
          if (unassignedQuestions.length > 0) {
            errors.push(`${unassignedQuestions.length} questions are not properly assigned to dimensions`)
          }
        }
      }

      // Validate complex grading criteria
      if (!data.complexGradingCriteria || data.complexGradingCriteria.length === 0) {
        errors.push('Complex quizzes must have grading criteria defined')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Validate basic quiz data
  private validateBasicQuizData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!data.title?.trim()) errors.push('Quiz title is required')
    if (!data.description?.trim()) errors.push('Quiz description is required')
    if (!data.category?.trim()) errors.push('Quiz category is required')

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Validate dimensions
  private validateDimensions(dimensions: any[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!dimensions || dimensions.length === 0) {
      errors.push('At least one dimension is required')
    } else {
      dimensions.forEach((dim, index) => {
        if (!dim.name?.trim()) errors.push(`Dimension ${index + 1} name is required`)
        if (!dim.shortName?.trim()) errors.push(`Dimension ${index + 1} short name is required`)
        if (dim.minScore === undefined || dim.maxScore === undefined) {
          errors.push(`Dimension ${index + 1} must have score range defined`)
        }
        if (dim.threshold === undefined) {
          errors.push(`Dimension ${index + 1} must have threshold defined`)
        }
      })
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Validate questions
  private validateQuestions(questions: any[], quizType: QuizType, dimensions: any[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!questions || questions.length === 0) {
      errors.push('At least one question is required')
    } else {
      questions.forEach((q, index) => {
        if (!q.text?.trim()) errors.push(`Question ${index + 1} text is required`)
        if (!q.options || q.options.length < 2) {
          errors.push(`Question ${index + 1} must have at least 2 options`)
        }

        // For complex quizzes, validate dimension assignment
        if (quizType === QuizType.COMPLEX) {
          if (!q.dimensionId) {
            errors.push(`Question ${index + 1} must be assigned to a dimension`)
          } else {
            const dimensionExists = dimensions.some(d => d.id === q.dimensionId)
            if (!dimensionExists) {
              errors.push(`Question ${index + 1} references invalid dimension ID: ${q.dimensionId}`)
            }
          }
        }
      })
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Debug method to troubleshoot quiz scoring issues
  async debugQuizScoring(quizId: string, answers: any[]): Promise<{
    quizStructure: any;
    dimensionMapping: any;
    scoreCalculation: any;
    classificationAttempts: any;
    issues: string[];
  }> {
    const issues: string[] = []

    try {
      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: {
          questions: {
            include: {
              options: true,
              dimension: true
            }
          },
          dimensions: true,
          complexGradingCriteria: true
        }
      })

      if (!quiz) {
        throw new Error("Quiz not found")
      }

      // Analyze quiz structure
      const quizStructure = {
        id: quiz.id,
        quizType: quiz.quizType,
        category: quiz.category,
        tags: quiz.tags,
        dimensionsCount: quiz.dimensions?.length || 0,
        questionsCount: quiz.questions?.length || 0,
        criteriaCount: quiz.complexGradingCriteria?.length || 0
      }

      // Analyze dimension mapping
      const dimensionMapping = quiz.dimensions?.map((dim: any) => ({
        id: dim.id,
        name: dim.name,
        shortName: dim.shortName,
        threshold: dim.threshold,
        minScore: dim.minScore,
        maxScore: dim.maxScore,
        questionsCount: quiz.questions?.filter((q: any) => q.dimensionId === dim.id).length || 0
      })) || []

      // Calculate scores manually
      const dimensionScores: Record<string, number> = {}
      for (const dim of quiz.dimensions || []) {
        dimensionScores[dim.shortName] = 0;
        const dimQuestions = quiz.questions?.filter((q: any) => q.dimensionId === dim.id) || []
        if (dimQuestions.length > 0) {
          for (const answer of answers) {
            const question = dimQuestions.find((q: any) => q.id === answer.questionId)
            if (question) {
              const option = question.options?.find((o: any) => o.id === answer.optionId)
                              if (option && typeof option.value === 'number') {
                  const value = option.value;
                  // @ts-expect-error - Value is guaranteed to be number after type check
                  dimensionScores[dim.shortName] += (value as number);
                }
            }
          }
        }
      }

      const scoreCalculation = {
        dimensionScores,
        answersProcessed: answers.length,
        totalQuestions: quiz.questions?.length || 0
      }

      // Test classification logic
      const classificationAttempts = quiz.complexGradingCriteria?.map((criteria: any) => {
        const { scoringLogic } = criteria
        if (scoringLogic && typeof scoringLogic === 'object' && scoringLogic.type === 'threshold' && scoringLogic.dimensions) {
          const matches = scoringLogic.dimensions.every((dim: any) => {
            const score = dimensionScores[dim.name]
            if (typeof score === 'undefined') return false

            if (dim.value === 'low') {
              return score <= dim.threshold
            } else if (dim.value === 'high') {
              return score > dim.threshold
            }
            return false
          })

          return {
            criteriaName: criteria.name,
            scoringLogic: scoringLogic.dimensions.map((dim: any) => ({
              name: dim.name,
              value: dim.value,
              threshold: dim.threshold,
              actualScore: dimensionScores[dim.name],
              matches: (() => {
                const score = dimensionScores[dim.name]
                if (typeof score === 'undefined') return false
                if (dim.value === 'low') return score <= dim.threshold
                if (dim.value === 'high') return score > dim.threshold
                return false
              })()
            })),
            overallMatch: matches
          }
        }
        return { criteriaName: criteria.name, scoringLogic: 'Not threshold type' }
      }) || []

      // Identify potential issues
      if (quiz.dimensions && quiz.dimensions.length === 0) {
        issues.push("No dimensions defined for complex quiz")
      }

      if (quiz.complexGradingCriteria && quiz.complexGradingCriteria.length === 0) {
        issues.push("No complex grading criteria defined")
      }

      for (const dim of quiz.dimensions || []) {
        if (!dim.threshold) {
          issues.push(`Dimension ${dim.shortName} missing threshold value`)
        }
        if (dim.minScore === undefined || dim.maxScore === undefined) {
          issues.push(`Dimension ${dim.shortName} missing score range`)
        }
      }

      for (const criteria of quiz.complexGradingCriteria || []) {
        if (!criteria.scoringLogic || typeof criteria.scoringLogic !== 'object' || !('type' in criteria.scoringLogic)) {
          issues.push(`Criteria ${criteria.name} missing or invalid scoring logic`)
        }
      }

      return {
        quizStructure,
        dimensionMapping,
        scoreCalculation,
        classificationAttempts,
        issues
      }
    } catch (error) {
      console.error(`Error debugging quiz scoring for ${quizId}:`, error)
      return {
        quizStructure: {},
        dimensionMapping: [],
        scoreCalculation: {},
        classificationAttempts: [],
        issues: [`Debug error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      }
    }
  }
}