#!/usr/bin/env node

/**
 * Quiz Data Fix Script
 * 
 * This script helps identify and fix quiz data issues in the TinyStepsADay backend.
 * Run this script to validate and repair quiz data integrity.
 * 
 * Usage:
 *   node fix-quiz-data.js [quizId]
 * 
 * If no quizId is provided, the script will check all quizzes.
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function validateQuizData(quizId) {
  console.log(`\n🔍 Validating quiz: ${quizId}`)
  
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
        complexGradingCriteria: true,
        gradingCriteria: true
      }
    })

    if (!quiz) {
      console.log('❌ Quiz not found')
      return { isValid: false, issues: ["Quiz not found"], warnings: [] }
    }

    const issues = []
    const warnings = []

    console.log(`📊 Quiz: ${quiz.title} (${quiz.quizType})`)

    // Check questions
    if (!quiz.questions || quiz.questions.length === 0) {
      issues.push("No questions found")
    } else {
      console.log(`📝 Questions: ${quiz.questions.length}`)
      
      for (const question of quiz.questions) {
        if (!question.options || question.options.length === 0) {
          issues.push(`Question ${question.order + 1} has no options`)
        }
        
        if (quiz.quizType === 'COMPLEX' && !question.dimensionId) {
          issues.push(`Question ${question.order + 1} missing dimensionId`)
        }
      }
    }

    // Check dimensions for complex quizzes
    if (quiz.quizType === 'COMPLEX') {
      if (!quiz.dimensions || quiz.dimensions.length === 0) {
        issues.push("Complex quiz missing dimensions")
      } else {
        console.log(`📐 Dimensions: ${quiz.dimensions.length}`)
        
        for (const dim of quiz.dimensions) {
          if (!dim.minScore || !dim.maxScore) {
            issues.push(`Dimension ${dim.shortName} missing score range`)
          }
          
          if (!dim.threshold) {
            warnings.push(`Dimension ${dim.shortName} missing threshold (may affect scoring)`)
          }
          
          console.log(`  - ${dim.shortName}: ${dim.name} (${dim.minScore}-${dim.maxScore}, threshold: ${dim.threshold || 'none'})`)
        }
      }

      if (!quiz.complexGradingCriteria || quiz.complexGradingCriteria.length === 0) {
        issues.push("Complex quiz missing grading criteria")
      } else {
        console.log(`🎯 Grading Criteria: ${quiz.complexGradingCriteria.length}`)
        
        for (const criteria of quiz.complexGradingCriteria) {
          const scoringLogic = criteria.scoringLogic
          if (!scoringLogic || !scoringLogic.type) {
            issues.push(`Complex grading criteria ${criteria.name} missing scoring logic`)
          }
          console.log(`  - ${criteria.name}: ${criteria.label} (${scoringLogic?.type || 'invalid'})`)
        }
      }
    }

    // Check grading criteria for default quizzes
    if (quiz.quizType === 'DEFAULT') {
      if (!quiz.gradingCriteria || quiz.gradingCriteria.length === 0) {
        warnings.push("Default quiz missing grading criteria (will use fallback logic)")
      } else {
        console.log(`📊 Grading Criteria: ${quiz.gradingCriteria.length}`)
      }
    }

    const result = {
      isValid: issues.length === 0,
      issues,
      warnings
    }

    if (result.isValid) {
      console.log('✅ Quiz data is valid')
    } else {
      console.log('❌ Quiz data has issues:')
      result.issues.forEach(issue => console.log(`  - ${issue}`))
    }

    if (result.warnings.length > 0) {
      console.log('⚠️  Warnings:')
      result.warnings.forEach(warning => console.log(`  - ${warning}`))
    }

    return result
  } catch (error) {
    console.error(`❌ Error validating quiz ${quizId}:`, error.message)
    return {
      isValid: false,
      issues: [`Validation error: ${error.message}`],
      warnings: []
    }
  }
}

async function repairQuizData(quizId) {
  console.log(`\n🔧 Repairing quiz: ${quizId}`)
  
  const issues = []
  
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
        console.log(`  🔗 Assigning dimensions to ${questionsWithoutDimension.length} questions...`)
        
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
                const maxOptionValue = Math.max(...question.options.map((o) => o.value))
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
        const scoringLogic = criteria.scoringLogic
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
    console.error(`❌ Error repairing quiz data for ${quizId}:`, error.message)
    return {
      success: false,
      message: `Failed to repair quiz data: ${error.message}`,
      issues
    }
  }
}

async function main() {
  const quizId = process.argv[2]
  
  try {
    if (quizId) {
      // Validate and repair specific quiz
      console.log(`🎯 Working with quiz: ${quizId}`)
      
      const validation = await validateQuizData(quizId)
      
      if (!validation.isValid) {
        console.log('\n🔧 Attempting to repair quiz data...')
        const repair = await repairQuizData(quizId)
        
        if (repair.success) {
          console.log(`✅ ${repair.message}`)
          repair.issues.forEach(issue => console.log(`  - ${issue}`))
          
          // Re-validate after repair
          console.log('\n🔍 Re-validating after repair...')
          const reValidation = await validateQuizData(quizId)
          
          if (reValidation.isValid) {
            console.log('🎉 Quiz data successfully repaired and validated!')
          } else {
            console.log('⚠️  Some issues remain after repair:')
            reValidation.issues.forEach(issue => console.log(`  - ${issue}`))
          }
        } else {
          console.log(`❌ Repair failed: ${repair.message}`)
        }
      }
    } else {
      // Check all quizzes
      console.log('🔍 Checking all quizzes...')
      
      const quizzes = await prisma.quiz.findMany({
        select: { id: true, title: true, quizType: true }
      })
      
      console.log(`📚 Found ${quizzes.length} quizzes`)
      
      let totalIssues = 0
      let totalWarnings = 0
      
      for (const quiz of quizzes) {
        const validation = await validateQuizData(quiz.id)
        
        if (!validation.isValid) {
          totalIssues += validation.issues.length
        }
        
        totalWarnings += validation.warnings.length
      }
      
      console.log(`\n📊 Summary:`)
      console.log(`  - Total quizzes: ${quizzes.length}`)
      console.log(`  - Total issues: ${totalIssues}`)
      console.log(`  - Total warnings: ${totalWarnings}`)
      
      if (totalIssues > 0) {
        console.log('\n💡 To fix specific quiz issues, run:')
        console.log(`   node fix-quiz-data.js <quizId>`)
      }
    }
  } catch (error) {
    console.error('❌ Script error:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
if (require.main === module) {
  main()
}

module.exports = { validateQuizData, repairQuizData }
