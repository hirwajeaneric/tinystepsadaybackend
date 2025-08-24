import { z } from "zod"
import { QuizType, RedirectType, QuizDifficulty, QuizStatus, QuizResultLevel } from "@prisma/client"

// Quiz Option Schema
export const quizOptionSchema = z.object({
  text: z.string().min(1, "Option text is required").max(500, "Option text must be less than 500 characters"),
  value: z.number().int().min(1, "Option value must be at least 1").max(10, "Option value must be at most 10"),
  order: z.number().int().min(0, "Order must be at least 0")
})

// Quiz Dimension Schema
export const quizDimensionSchema = z.object({
  name: z.string().min(1, "Dimension name is required").max(100, "Dimension name must be less than 100 characters"),
  shortName: z.string().min(1, "Short name is required").max(50, "Short name must be less than 50 characters"),
  order: z.number().int().min(0, "Order must be at least 0"),
  minScore: z.number().int().min(0, "Min score must be at least 0"),
  maxScore: z.number().int().min(0, "Max score must be at least 0"),
  threshold: z.number().optional(),
  lowLabel: z.string().max(50, "Low label must be less than 50 characters").optional(),
  highLabel: z.string().max(50, "High label must be less than 50 characters").optional()
})

// Quiz Question Schema
export const quizQuestionSchema = z.object({
  text: z.string().min(1, "Question text is required").max(1000, "Question text must be less than 1000 characters"),
  order: z.number().int().min(0, "Order must be at least 0"),
  dimensionId: z.string().optional(), // For COMPLEX quizzes
  options: z.array(quizOptionSchema).min(2, "Question must have at least 2 options").max(6, "Question must have at most 6 options")
})

// Complex Grading Criteria Schema
export const complexGradingCriteriaSchema = z.object({
  name: z.string().min(1, "Criteria name is required").max(100, "Criteria name must be less than 100 characters"),
  label: z.string().min(1, "Label is required").max(100, "Label must be less than 100 characters"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Color must be a valid hex color"),
  recommendations: z.array(z.string().min(1, "Recommendation cannot be empty").max(200, "Recommendation must be less than 200 characters")).min(1, "At least one recommendation is required"),
  areasOfImprovement: z.array(z.string().min(1, "Area of improvement cannot be empty").max(200, "Area of improvement must be less than 200 characters")).default([]),
  supportNeeded: z.array(z.string().min(1, "Support needed cannot be empty").max(200, "Support needed must be less than 200 characters")).default([]),
  proposedCourses: z.array(z.object({
    id: z.string().min(1, "Course ID is required"),
    name: z.string().min(1, "Course name is required"),
    slug: z.string().min(1, "Course slug is required")
  })).default([]),
  proposedProducts: z.array(z.object({
    id: z.string().min(1, "Product ID is required"),
    name: z.string().min(1, "Product name is required"),
    slug: z.string().min(1, "Product slug is required")
  })).default([]),
  proposedStreaks: z.array(z.object({
    id: z.string().min(1, "Streak ID is required"),
    name: z.string().min(1, "Streak name is required"),
    slug: z.string().min(1, "Streak slug is required")
  })).default([]),
  proposedBlogPosts: z.array(z.object({
    id: z.string().min(1, "Blog post ID is required"),
    title: z.string().min(1, "Blog post title is required"),
    slug: z.string().min(1, "Blog post slug is required")
  })).default([]),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  scoringLogic: z.object({
    type: z.enum(["threshold", "highest", "topN"]),
    dimensions: z.array(z.object({
      name: z.string(),
      value: z.string().optional(),
      threshold: z.number().optional()
    })).optional(),
    dimension: z.string().optional(),
    minScore: z.number().optional(),
    maxScore: z.number().optional(),
    n: z.number().optional()
  })
})

// Grading Criteria Schema
export const gradingCriteriaSchema = z.object({
  name: z.string().min(1, "Criteria name is required").max(100, "Criteria name must be less than 100 characters"),
  minScore: z.number().int().min(0, "Min score must be at least 0").max(100, "Min score must be at most 100"),
  maxScore: z.number().int().min(0, "Max score must be at least 0").max(100, "Max score must be at most 100"),
  label: z.string().min(1, "Label is required").max(100, "Label must be less than 100 characters"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Color must be a valid hex color"),
  recommendations: z.array(z.string().min(1, "Recommendation cannot be empty").max(200, "Recommendation must be less than 200 characters")).min(1, "At least one recommendation is required"),
  areasOfImprovement: z.array(z.string().min(1, "Area of improvement cannot be empty").max(200, "Area of improvement must be less than 200 characters")).default([]),
  supportNeeded: z.array(z.string().min(1, "Support needed cannot be empty").max(200, "Support needed must be less than 200 characters")).default([]),
  proposedCourses: z.array(z.object({
    id: z.string().min(1, "Course ID is required"),
    name: z.string().min(1, "Course name is required"),
    slug: z.string().min(1, "Course slug is required")
  })).default([]),
  proposedProducts: z.array(z.object({
    id: z.string().min(1, "Product ID is required"),
    name: z.string().min(1, "Product name is required"),
    slug: z.string().min(1, "Product slug is required")
  })).default([]),
  proposedStreaks: z.array(z.object({
    id: z.string().min(1, "Streak ID is required"),
    name: z.string().min(1, "Streak name is required"),
    slug: z.string().min(1, "Streak slug is required")
  })).default([]),
  proposedBlogPosts: z.array(z.object({
    id: z.string().min(1, "Blog post ID is required"),
    title: z.string().min(1, "Blog post title is required"),
    slug: z.string().min(1, "Blog post slug is required")
  })).default([]),
  description: z.string().max(500, "Description must be less than 500 characters").optional()
})


// Quiz Creation Schema
export const quizSchema = z.object({
  quizType: z.nativeEnum(QuizType).default(QuizType.DEFAULT),
  redirectAfterAnswer: z.nativeEnum(RedirectType),
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  subtitle: z.string().max(200, "Subtitle must be less than 200 characters").optional(),
  description: z.string().min(1, "Description is required").max(1000, "Description must be less than 1000 characters"),
  category: z.string().min(1, "Category is required").max(100, "Category must be less than 100 characters"),
  estimatedTime: z.string().min(1, "Estimated time is required").max(50, "Estimated time must be less than 50 characters"),
  difficulty: z.nativeEnum(QuizDifficulty),
  status: z.nativeEnum(QuizStatus),
  isPublic: z.boolean(),
  tags: z.array(z.string().min(1, "Tag cannot be empty").max(50, "Tag must be less than 50 characters")).default([]),
  questions: z.array(quizQuestionSchema).min(1, "Quiz must have at least one question").max(50, "Quiz cannot have more than 50 questions"),
  gradingCriteria: z.array(gradingCriteriaSchema)
    .max(10, "Quiz cannot have more than 10 grading criteria")
    .optional(),
  dimensions: z.array(quizDimensionSchema)
    .max(10, "COMPLEX quiz cannot have more than 10 dimensions")
    .optional(),
  complexGradingCriteria: z.array(complexGradingCriteriaSchema)
    .max(20, "Quiz cannot have more than 20 complex grading criteria")
    .optional()
}).refine(data => {
  if (data.quizType === QuizType.COMPLEX) {
    // COMPLEX quizzes must have dimensions and complexGradingCriteria, but NOT regular gradingCriteria
    return !!data.dimensions && !!data.complexGradingCriteria && (!data.gradingCriteria || data.gradingCriteria.length === 0)
  } else {
    // DEFAULT/ONBOARDING quizzes must have regular gradingCriteria, but NOT dimensions or complexGradingCriteria
    return !!data.gradingCriteria && data.gradingCriteria.length > 0 && (!data.dimensions || data.dimensions.length === 0) && (!data.complexGradingCriteria || data.complexGradingCriteria.length === 0)
  }
}, {
  message: "COMPLEX quizzes require dimensions and complexGradingCriteria (no regular gradingCriteria). DEFAULT/ONBOARDING quizzes require regular gradingCriteria (no dimensions or complexGradingCriteria).",
  path: ["quizType"]
})

// Quiz Update Schema
export const quizUpdateSchema = quizSchema.partial().extend({
  questions: z.array(quizQuestionSchema)
    .min(1, "Quiz must have at least one question")
    .max(50, "Quiz cannot have more than 50 questions")
    .optional(),
  gradingCriteria: z.array(gradingCriteriaSchema)

    .max(10, "Quiz cannot have more than 10 grading criteria")
    .optional(),
  dimensions: z.array(quizDimensionSchema)

    .max(10, "COMPLEX quiz cannot have more than 10 dimensions")
    .optional(),
  complexGradingCriteria: z.array(complexGradingCriteriaSchema)

    .max(20, "COMPLEX quiz cannot have more than 20 complex grading criteria")
    .optional()
}).refine(data => {
  if (data.quizType === QuizType.COMPLEX) {
    // COMPLEX quizzes must have dimensions and complexGradingCriteria, but NOT regular gradingCriteria
    return (!data.dimensions && !data.complexGradingCriteria && !data.gradingCriteria) || 
           (data.dimensions && data.complexGradingCriteria && (!data.gradingCriteria || data.gradingCriteria.length === 0))
  } else {
    // DEFAULT/ONBOARDING quizzes must have regular gradingCriteria, but NOT dimensions or complexGradingCriteria
    return (!data.dimensions && !data.complexGradingCriteria && !data.gradingCriteria) || 
           (data.gradingCriteria && data.gradingCriteria.length > 0 && (!data.dimensions || data.dimensions.length === 0) && (!data.complexGradingCriteria || data.complexGradingCriteria.length === 0))
  }
}, {
  message: "COMPLEX quizzes require dimensions and complexGradingCriteria (no regular gradingCriteria). DEFAULT/ONBOARDING quizzes require regular gradingCriteria (no dimensions or complexGradingCriteria).",
  path: ["quizType"]
})

// Quiz Query Schema
export const quizQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  isPublic: z.string().optional(),
  createdBy: z.string().optional(),
  tags: z.array(z.string()).optional(),
  quizType: z.nativeEnum(QuizType).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["createdAt", "updatedAt", "title", "totalAttempts", "averageScore"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc")
}).transform((data) => {
  const transformed: any = { ...data }
  
  // Handle "all" filter for category, status, isPublic, and quizType
  if (transformed.category === "all") transformed.category = undefined
  if (transformed.status === "all") transformed.status = undefined
  if (transformed.isPublic === "all") transformed.isPublic = undefined
  if (transformed.quizType === "all") transformed.quizType = undefined
  
  // Convert string booleans/numbers to actual types
  if (typeof transformed.isPublic === 'string') {
    transformed.isPublic = transformed.isPublic === 'true'
  }
  if (typeof transformed.page === 'string') {
    transformed.page = parseInt(transformed.page, 10)
  }
  if (typeof transformed.limit === 'string') {
    transformed.limit = parseInt(transformed.limit, 10)
  }
  
  return transformed
})

// Public Quiz Query Schema
export const publicQuizQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  quizType: z.nativeEnum(QuizType).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["createdAt", "updatedAt", "title", "totalAttempts", "averageScore"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc")
}).transform((data) => {
  const transformed: any = { ...data }
  
  if (transformed.category === "all") transformed.category = undefined
  if (transformed.quizType === "all") transformed.quizType = undefined
  
  return transformed
})

// Quiz Result Query Schema
export const quizResultQuerySchema = z.object({
  quizId: z.string().optional(),
  userId: z.string().optional(),
  level: z.nativeEnum(QuizResultLevel).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["createdAt", "completedAt", "score", "percentage"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc")
})

// Quiz Answer Schema
export const quizAnswerSchema = z.object({
  questionId: z.string().min(1, "Question ID is required"),
  optionId: z.string().min(1, "Option ID is required")
})

// Quiz Submission Schema
export const quizSubmissionSchema = z.object({
  quizId: z.string().min(1, "Quiz ID is required"),
  answers: z.array(quizAnswerSchema).min(1, "At least one answer is required"),
  timeSpent: z.number().min(0, "Time spent must be at least 0").max(1440, "Time spent cannot exceed 24 hours")
})

// Quiz Result Update Schema
export const quizResultUpdateSchema = z.object({
  feedback: z.string().min(1, "Feedback is required").max(1000, "Feedback must be less than 1000 characters").optional(),
  recommendations: z.array(z.string().min(1, "Recommendation cannot be empty").max(200, "Recommendation must be less than 200 characters")).optional(),
  areasOfImprovement: z.array(z.string().min(1, "Area of improvement cannot be empty").max(200, "Area of improvement must be less than 200 characters")).optional(),
  supportNeeded: z.array(z.string().min(1, "Support needed cannot be empty").max(200, "Support needed must be less than 200 characters")).optional()
})

// Response Schemas
export const quizResponseSchema = z.object({
  id: z.string(),
  quizType: z.nativeEnum(QuizType),
  redirectAfterAnswer: z.nativeEnum(RedirectType),
  title: z.string(),
  subtitle: z.string().nullable(),
  description: z.string(),
  category: z.string(),
  estimatedTime: z.string(),
  difficulty: z.nativeEnum(QuizDifficulty),
  status: z.nativeEnum(QuizStatus),
  isPublic: z.boolean(),
  totalAttempts: z.number(),
  completedAttempts: z.number(),
  averageScore: z.number(),
  averageCompletionTime: z.number(),
  tags: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
  createdByUser: z.object({
    id: z.string(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    avatar: z.string().nullable()
  }).optional(),
  questions: z.array(z.object({
    id: z.string(),
    text: z.string(),
    order: z.number(),
    dimensionId: z.string().nullable(),
    dimension: z.object({
      id: z.string(),
      name: z.string(),
      shortName: z.string(),
      order: z.number(),
      minScore: z.number(),
      maxScore: z.number(),
      threshold: z.number().nullable(),
      lowLabel: z.string().nullable(),
      highLabel: z.string().nullable()
    }).nullable(),
    options: z.array(z.object({
      id: z.string(),
      text: z.string(),
      value: z.number(),
      order: z.number()
    }))
  })),
  gradingCriteria: z.array(z.object({
    id: z.string(),
    name: z.string(),
    minScore: z.number(),
    maxScore: z.number(),
    label: z.string(),
    color: z.string(),
    recommendations: z.array(z.string()),
    areasOfImprovement: z.array(z.string()),
    supportNeeded: z.array(z.string()),
    proposedCourses: z.array(z.any()),
    proposedProducts: z.array(z.any()),
    proposedStreaks: z.array(z.any()),
    proposedBlogPosts: z.array(z.any()),
    description: z.string().nullable()
  })).optional(),
  complexGradingCriteria: z.array(z.object({
    id: z.string(),
    name: z.string(),
    label: z.string(),
    color: z.string(),
    recommendations: z.array(z.string()),
    areasOfImprovement: z.array(z.string()),
    supportNeeded: z.array(z.string()),
    proposedCourses: z.array(z.any()),
    proposedProducts: z.array(z.any()),
    proposedStreaks: z.array(z.any()),
    proposedBlogPosts: z.array(z.any()),
    description: z.string().nullable(),
    scoringLogic: z.any()
  })).optional(),
  dimensions: z.array(z.object({
    id: z.string(),
    name: z.string(),
    shortName: z.string(),
    order: z.number(),
    minScore: z.number(),
    maxScore: z.number(),
    threshold: z.number().nullable(),
    lowLabel: z.string().nullable(),
    highLabel: z.string().nullable()
  })).optional()
})

export const quizResultResponseSchema = z.object({
  id: z.string(),
  quizId: z.string(),
  userId: z.string(),
  score: z.number().nullable(),
  maxScore: z.number().nullable(),
  dimensionScores: z.record(z.string(), z.number()).optional(),
  percentage: z.number().nullable(),
  level: z.nativeEnum(QuizResultLevel).nullable(),
  feedback: z.string(),
  recommendations: z.array(z.string()),
  completedAt: z.date(),
  timeSpent: z.number(),
  answers: z.record(z.string(), z.string()),
  classification: z.string(),
  areasOfImprovement: z.array(z.string()),
  supportNeeded: z.array(z.string()),
  color: z.string().optional(),
  proposedCourses: z.array(z.any()),
  proposedProducts: z.array(z.any()),
  proposedStreaks: z.array(z.any()),
  proposedBlogPosts: z.array(z.any()),
  createdAt: z.date(),
  updatedAt: z.date(),
  quiz: z.object({
    id: z.string(),
    title: z.string(),
    category: z.string()
  }).optional(),
  user: z.object({
    id: z.string(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    email: z.string()
  }).optional()
})

export const quizAnalyticsResponseSchema = z.object({
  totalAttempts: z.number(),
  completedAttempts: z.number(),
  completionRate: z.number(),
  averageScore: z.number(),
  averageTimeSpent: z.number(),
  levelDistribution: z.object({
    excellent: z.number(),
    good: z.number(),
    fair: z.number(),
    needsImprovement: z.number()
  }),
  dimensionDistribution: z.record(z.string(), z.object({
    average: z.number(),
    min: z.number(),
    max: z.number()
  })).optional(),
  dropoffPoints: z.array(z.object({
    questionNumber: z.number(),
    dropoffCount: z.number(),
    dropoffRate: z.number()
  })),
  popularClassifications: z.array(z.object({
    classification: z.string(),
    count: z.number(),
    percentage: z.number()
  })),
  timeDistribution: z.object({
    fast: z.number(),
    normal: z.number(),
    slow: z.number()
  })
})