// Fix Quiz Dimensions Script
// This script repairs existing quiz data by fixing dimension ID mismatches
// Run with: node fix-quiz-dimensions.js

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixQuizDimensions() {
  console.log('🔧 Starting Quiz Dimension Repair...\n')
  
  try {
    // Get all complex quizzes
    const complexQuizzes = await prisma.quiz.findMany({
      where: {
        quizType: 'COMPLEX'
      },
      include: {
        dimensions: true,
        questions: {
          include: {
            options: true,
            dimension: true
          },
          orderBy: { order: 'asc' }
        },
        complexGradingCriteria: true
      }
    })
    
    console.log(`Found ${complexQuizzes.length} complex quizzes to check\n`)
    
    let totalFixed = 0
    let totalIssues = 0
    
    for (const quiz of complexQuizzes) {
      console.log(`📋 Processing Quiz: ${quiz.title} (${quiz.id})`)
      
      if (!quiz.dimensions || quiz.dimensions.length === 0) {
        console.log('   ❌ No dimensions found - skipping')
        continue
      }
      
      if (!quiz.questions || quiz.questions.length === 0) {
        console.log('   ❌ No questions found - skipping')
        continue
      }
      
      // Check for dimension ID mismatches
      const dimensionIds = quiz.dimensions.map(d => d.id)
      const questionsWithMismatch = quiz.questions.filter(q => 
        !q.dimensionId || !dimensionIds.includes(q.dimensionId)
      )
      
      if (questionsWithMismatch.length > 0) {
        console.log(`   ⚠️  Found ${questionsWithMismatch.length} questions with dimension mismatches`)
        totalIssues += questionsWithMismatch.length
        
        // Fix dimension assignments based on question order
        const questionsPerDimension = Math.ceil(quiz.questions.length / quiz.dimensions.length)
        
        for (let i = 0; i < quiz.questions.length; i++) {
          const question = quiz.questions[i]
          const dimensionIndex = Math.floor(i / questionsPerDimension)
          const correctDimension = quiz.dimensions[dimensionIndex]
          
          if (correctDimension && question.dimensionId !== correctDimension.id) {
            console.log(`      🔄 Fixing Q${i + 1}: ${question.dimensionId || 'null'} → ${correctDimension.id} (${correctDimension.shortName})`)
            
            // Update the question's dimensionId
            await prisma.quizQuestion.update({
              where: { id: question.id },
              data: { dimensionId: correctDimension.id }
            })
            
            totalFixed++
          }
        }
        
        console.log(`   ✅ Fixed ${questionsWithMismatch.length} dimension assignments\n`)
      } else {
        console.log('   ✅ All questions have correct dimension assignments\n')
      }
    }
    
    console.log('🎉 Dimension Repair Complete!')
    console.log(`📊 Summary:`)
    console.log(`   - Total issues found: ${totalIssues}`)
    console.log(`   - Total questions fixed: ${totalFixed}`)
    console.log(`   - Quizzes processed: ${complexQuizzes.length}`)
    
  } catch (error) {
    console.error('❌ Error during repair:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function validateQuizData() {
  console.log('\n🔍 Validating Quiz Data Integrity...\n')
  
  try {
    const quizzes = await prisma.quiz.findMany({
      where: {
        quizType: 'COMPLEX'
      },
      include: {
        dimensions: true,
        questions: {
          include: {
            options: true,
            dimension: true
          }
        },
        complexGradingCriteria: true
      }
    })
    
    let validQuizzes = 0
    let invalidQuizzes = 0
    
    for (const quiz of quizzes) {
      const issues = []
      
      // Check dimensions
      if (!quiz.dimensions || quiz.dimensions.length === 0) {
        issues.push('No dimensions defined')
      } else {
        for (const dim of quiz.dimensions) {
          if (!dim.threshold) issues.push(`Dimension ${dim.shortName} missing threshold`)
          if (dim.minScore === undefined || dim.maxScore === undefined) {
            issues.push(`Dimension ${dim.shortName} missing score range`)
          }
        }
      }
      
      // Check questions
      if (!quiz.questions || quiz.questions.length === 0) {
        issues.push('No questions defined')
      } else {
        for (const q of quiz.questions) {
          if (!q.dimensionId) {
            issues.push(`Question ${q.order + 1} missing dimensionId`)
          } else {
            const dimensionExists = quiz.dimensions.some(d => d.id === q.dimensionId)
            if (!dimensionExists) {
              issues.push(`Question ${q.order + 1} references invalid dimensionId: ${q.dimensionId}`)
            }
          }
          
          if (!q.options || q.options.length < 2) {
            issues.push(`Question ${q.order + 1} has insufficient options`)
          }
        }
      }
      
      // Check grading criteria
      if (!quiz.complexGradingCriteria || quiz.complexGradingCriteria.length === 0) {
        issues.push('No grading criteria defined')
      }
      
      if (issues.length > 0) {
        console.log(`❌ Quiz: ${quiz.title}`)
        issues.forEach(issue => console.log(`   - ${issue}`))
        invalidQuizzes++
      } else {
        console.log(`✅ Quiz: ${quiz.title}`)
        validQuizzes++
      }
    }
    
    console.log(`\n📊 Validation Summary:`)
    console.log(`   - Valid quizzes: ${validQuizzes}`)
    console.log(`   - Invalid quizzes: ${invalidQuizzes}`)
    console.log(`   - Total quizzes: ${quizzes.length}`)
    
  } catch (error) {
    console.error('❌ Error during validation:', error)
  }
}

async function testQuizScoring() {
  console.log('\n🧪 Testing Quiz Scoring...\n')
  
  try {
    // Get a sample quiz result to test
    const sampleResult = await prisma.quizResult.findFirst({
      where: {
        quiz: {
          quizType: 'COMPLEX'
        }
      },
      include: {
        quiz: {
          include: {
            dimensions: true,
            questions: {
              include: {
                options: true,
                dimension: true
              }
            },
            complexGradingCriteria: true
          }
        }
      }
    })
    
    if (!sampleResult) {
      console.log('No complex quiz results found for testing')
      return
    }
    
    console.log(`Testing scoring for quiz: ${sampleResult.quiz.title}`)
    console.log(`Result ID: ${sampleResult.id}`)
    console.log(`Answers: ${sampleResult.answers.length}`)
    console.log(`Dimension Scores:`, sampleResult.dimensionScores)
    
    // Recalculate scores manually to verify
    const dimensionScores = {}
    for (const dim of sampleResult.quiz.dimensions) {
      dimensionScores[dim.shortName] = 0
    }
    
    for (const answer of sampleResult.answers) {
      const question = sampleResult.quiz.questions.find(q => q.id === answer.questionId)
      if (question && question.dimensionId) {
        const option = question.options.find(o => o.id === answer.optionId)
        if (option) {
          const dimension = sampleResult.quiz.dimensions.find(d => d.id === question.dimensionId)
          if (dimension) {
            dimensionScores[dimension.shortName] += option.value
          }
        }
      }
    }
    
    console.log(`Recalculated Scores:`, dimensionScores)
    
    // Check if scores match
    const scoresMatch = JSON.stringify(dimensionScores) === JSON.stringify(sampleResult.dimensionScores)
    console.log(`Scores Match: ${scoresMatch ? '✅' : '❌'}`)
    
  } catch (error) {
    console.error('❌ Error during scoring test:', error)
  }
}

// Main execution
async function main() {
  console.log('🚀 Quiz Data Repair and Validation Tool\n')
  
  // Step 1: Fix dimensions
  await fixQuizDimensions()
  
  // Step 2: Validate data
  await validateQuizData()
  
  // Step 3: Test scoring
  await testQuizScoring()
  
  console.log('\n✨ All operations completed!')
}

// Run the script
if (require.main === module) {
  main().catch(console.error)
}

module.exports = {
  fixQuizDimensions,
  validateQuizData,
  testQuizScoring
}
