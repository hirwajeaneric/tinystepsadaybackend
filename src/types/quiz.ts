import { QuizType, RedirectType, QuizDifficulty, QuizStatus, QuizResultLevel } from "@prisma/client"

// Quiz Option Interface
export interface QuizOption {
  id: string
  text: string
  value: number
  order: number
}

// Quiz Dimension Interface
export interface QuizDimension {
  id: string
  name: string
  shortName: string
  order: number
  minScore: number
  maxScore: number
  threshold?: number
  lowLabel?: string
  highLabel?: string
}

// Quiz Question Interface
export interface QuizQuestion {
  id: string
  text: string
  order: number
  dimensionId?: string
  dimension?: QuizDimension
  options: QuizOption[]
}

// Grading Criteria Interface
export interface GradingCriteria {
  id: string
  name: string
  minScore: number
  maxScore: number
  label: string
  color: string
  recommendations: string[]
  areasOfImprovement?: string[]
  supportNeeded?: string[]
  proposedCourses: Array<{ id: string; name: string; slug: string }>
  proposedProducts: Array<{ id: string; name: string; slug: string }>
  proposedStreaks: Array<{ id: string; name: string; slug: string }>
  proposedBlogPosts: Array<{ id: string; title: string; slug: string }>
  description?: string
}

// Complex Grading Criteria Interface
export interface ComplexGradingCriteria {
  id: string
  name: string
  label: string
  color: string
  recommendations: string[]
  areasOfImprovement?: string[]
  supportNeeded?: string[]
  proposedCourses: Array<{ id: string; name: string; slug: string }>
  proposedProducts: Array<{ id: string; name: string; slug: string }>
  proposedStreaks: Array<{ id: string; name: string; slug: string }>
  proposedBlogPosts: Array<{ id: string; title: string; slug: string }>
  description?: string
  scoringLogic: {
    type: 'threshold' | 'highest' | 'topN'
    dimensions?: Array<{ name: string; value?: string; threshold?: number }>
    dimension?: string
    minScore?: number
    maxScore?: number
    n?: number
  }
}

// Quiz Interface
export interface Quiz {
  id: string
  quizType: QuizType
  redirectAfterAnswer: RedirectType
  title: string
  subtitle?: string
  description: string
  coverImage?: string
  category: string
  estimatedTime: string
  difficulty: QuizDifficulty
  status: QuizStatus
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
  totalAttempts: number
  completedAttempts: number
  averageScore: number
  averageCompletionTime: number
  tags: string[]
  createdBy: string
  questions: QuizQuestion[]
  gradingCriteria: GradingCriteria[]
  complexGradingCriteria: ComplexGradingCriteria[]
  dimensions: QuizDimension[]
  createdByUser?: {
    id: string
    firstName?: string
    lastName?: string
    avatar?: string
  }
}

// Quiz Result Interface
export interface QuizResult {
  id: string
  quizId: string
  userId: string
  user?: {
    firstName?: string
    lastName?: string
    email?: string
  }
  score?: number
  maxScore?: number
  dimensionScores?: Record<string, number>
  percentage?: number
  level?: QuizResultLevel
  feedback: string
  recommendations: string[]
  completedAt: string
  timeSpent: number
  answers: Record<string, string>
  classification: string
  areasOfImprovement: string[]
  supportNeeded: string[]
  color?: string
  proposedCourses: Array<{ id: string; name: string; slug: string }>
  proposedProducts: Array<{ id: string; name: string; slug: string }>
  proposedStreaks: Array<{ id: string; name: string; slug: string }>
  proposedBlogPosts: Array<{ id: string; title: string; slug: string }>
  quiz?: {
    id: string
    title: string
    category: string
  }
}

// Quiz Analytics Interface
export interface QuizAnalytics {
  totalAttempts: number
  completedAttempts: number
  completionRate: number
  averageScore: number
  averageTimeSpent: number
  levelDistribution: {
    excellent: number
    good: number
    fair: number
    needsImprovement: number
  }
  dimensionDistribution?: Record<string, { average: number; min: number; max: number }>
  dropoffPoints: Array<{
    questionNumber: number
    dropoffCount: number
    dropoffRate: number
  }>
  popularClassifications: Array<{
    classification: string
    count: number
    percentage: number
  }>
  timeDistribution: {
    fast: number
    normal: number
    slow: number
  }
}

// Quiz Creation Interface
export interface CreateQuizData {
  quizType: QuizType
  redirectAfterAnswer: RedirectType
  title: string
  subtitle?: string
  description: string
  coverImage?: string
  category: string
  estimatedTime: string
  difficulty: QuizDifficulty
  status: QuizStatus
  isPublic: boolean
  tags: string[]
  questions: Array<{
    text: string
    order: number
    dimensionId?: string
    options: Array<{
      text: string
      value: number
      order: number
    }>
  }>
  gradingCriteria?: Array<{
    name: string
    minScore: number
    maxScore: number
    label: string
    color: string
    recommendations: string[]
    areasOfImprovement?: string[]
    supportNeeded?: string[]
    proposedCourses: Array<{ id: string; name: string; slug: string }>
    proposedProducts: Array<{ id: string; name: string; slug: string }>
    proposedStreaks: Array<{ id: string; name: string; slug: string }>
    proposedBlogPosts: Array<{ id: string; title: string; slug: string }>
    description?: string
  }>
  dimensions?: Array<{
    name: string
    shortName: string
    order: number
    minScore: number
    maxScore: number
    threshold?: number
    lowLabel?: string
    highLabel?: string
  }>
  complexGradingCriteria?: Array<{
    name: string
    label: string
    color: string
    recommendations: string[]
    areasOfImprovement?: string[]
    supportNeeded?: string[]
    proposedCourses: Array<{ id: string; name: string; slug: string }>
    proposedProducts: Array<{ id: string; name: string; slug: string }>
    proposedStreaks: Array<{ id: string; name: string; slug: string }>
    proposedBlogPosts: Array<{ id: string; title: string; slug: string }>
    description?: string
    scoringLogic: {
      type: 'threshold' | 'highest' | 'topN'
      dimensions?: Array<{ name: string; value?: string; threshold?: number }>
      dimension?: string
      minScore?: number
      maxScore?: number
      n?: number
    }
  }>
}

// Quiz Update Interface
export interface UpdateQuizData {
  quizType?: QuizType
  redirectAfterAnswer?: RedirectType
  title?: string
  subtitle?: string
  description?: string
  coverImage?: string
  category?: string
  estimatedTime?: string
  difficulty?: QuizDifficulty
  status?: QuizStatus
  isPublic?: boolean
  tags?: string[]
  questions?: Array<{
    text: string
    order: number
    dimensionId?: string
    options: Array<{
      text: string
      value: number
      order: number
    }>
  }>
  gradingCriteria?: Array<{
    name: string
    minScore: number
    maxScore: number
    label: string
    color: string
    recommendations: string[]
    areasOfImprovement?: string[]
    supportNeeded?: string[]
    proposedCourses: Array<{ id: string; name: string; slug: string }>
    proposedProducts: Array<{ id: string; name: string; slug: string }>
    proposedStreaks: Array<{ id: string; name: string; slug: string }>
    proposedBlogPosts: Array<{ id: string; title: string; slug: string }>
    description?: string
  }>
  dimensions?: Array<{
    name: string
    shortName: string
    order: number
    minScore: number
    maxScore: number
    threshold?: number
    lowLabel?: string
    highLabel?: string
  }>
  complexGradingCriteria?: Array<{
    name: string
    label: string
    color: string
    recommendations: string[]
    areasOfImprovement?: string[]
    supportNeeded?: string[]
    proposedCourses: Array<{ id: string; name: string; slug: string }>
    proposedProducts: Array<{ id: string; name: string; slug: string }>
    proposedStreaks: Array<{ id: string; name: string; slug: string }>
    proposedBlogPosts: Array<{ id: string; title: string; slug: string }>
    description?: string
    scoringLogic: {
      type: 'threshold' | 'highest' | 'topN'
      dimensions?: Array<{ name: string; value?: string; threshold?: number }>
      dimension?: string
      minScore?: number
      maxScore?: number
      n?: number
    }
  }>
}

// Quiz Query Interface
export interface QuizQuery {
  search?: string
  category?: string
  status?: string | QuizStatus
  isPublic?: boolean
  createdBy?: string
  tags?: string[]
  quizType?: QuizType
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'totalAttempts' | 'averageScore'
  sortOrder?: 'asc' | 'desc'
}

// Quiz Result Query Interface
export interface QuizResultQuery {
  quizId?: string
  userId?: string
  level?: QuizResultLevel
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'completedAt' | 'score' | 'percentage'
  sortOrder?: 'asc' | 'desc'
}

// Quiz Answer Interface
export interface QuizAnswer {
  questionId: string
  optionId: string
}

// Quiz Submission Interface
export interface QuizSubmission {
  quizId: string
  answers: QuizAnswer[]
  timeSpent: number
}

// Quiz Result Calculation Interface
export interface QuizResultCalculation {
  score?: number
  maxScore?: number
  dimensionScores?: Record<string, number>
  percentage?: number
  level?: QuizResultLevel
  feedback: string
  recommendations: string[]
  classification: string
  areasOfImprovement: string[]
  supportNeeded: string[]
  proposedCourses: Array<{ id: string; name: string; slug: string }>
  proposedProducts: Array<{ id: string; name: string; slug: string }>
  proposedStreaks: Array<{ id: string; name: string; slug: string }>
  proposedBlogPosts: Array<{ id: string; title: string; slug: string }>
  color?: string
}