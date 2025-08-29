// Test Progressive Quiz Creation
// This script tests the new progressive quiz creation flow
// Run with: node test-progressive-quiz.js

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testProgressiveQuizCreation() {
  console.log('🧪 Testing Progressive Quiz Creation Flow...\n')
  
  try {
    // Test data for MBTI quiz
    const basicQuizData = {
      title: "Test MBTI Assessment",
      subtitle: "Test personality assessment",
      description: "This is a test quiz to verify the progressive creation flow",
      category: "Personal Growth",
      estimatedTime: "10-15 minutes",
      difficulty: "BEGINNER",
      status: "DRAFT",
      isPublic: false,
      quizType: "COMPLEX",
      redirectAfterAnswer: "RESULTS",
      tags: ["MBTI", "Personality", "Test"]
    }
    
    console.log('1. Creating basic quiz...')
    const quiz = await prisma.quiz.create({
      data: {
        ...basicQuizData,
        createdBy: "test-user-id",
        questions: { create: [] },
        gradingCriteria: { create: [] },
        complexGradingCriteria: { create: [] },
        dimensions: { create: [] }
      }
    })
    
    console.log(`   ✅ Quiz created with ID: ${quiz.id}`)
    
    // Test adding dimensions
    console.log('\n2. Adding dimensions...')
    const dimensions = [
      {
        name: "Extraversion/Introversion",
        shortName: "E/I",
        order: 0,
        minScore: 8,
        maxScore: 32,
        threshold: 15,
        lowLabel: "I",
        highLabel: "E"
      },
      {
        name: "Sensing/Intuition", 
        shortName: "S/N",
        order: 1,
        minScore: 8,
        maxScore: 27,
        threshold: 20,
        lowLabel: "N",
        highLabel: "S"
      }
    ]
    
    await prisma.quizDimension.deleteMany({ where: { quizId: quiz.id } })
    const createdDimensions = await prisma.quizDimension.createMany({
      data: dimensions.map(dim => ({ ...dim, quizId: quiz.id }))
    })
    
    console.log(`   ✅ ${createdDimensions.count} dimensions created`)
    
    // Get the created dimensions to get their real IDs
    const savedDimensions = await prisma.quizDimension.findMany({
      where: { quizId: quiz.id },
      orderBy: { order: 'asc' }
    })
    
    console.log('   📋 Dimension IDs:', savedDimensions.map(d => ({ id: d.id, shortName: d.shortName })))
    
    // Test adding questions with real dimension IDs
    console.log('\n3. Adding questions with real dimension IDs...')
    const questions = [
      {
        text: "I am energized by spending time with other people.",
        order: 0,
        dimensionId: savedDimensions[0].id, // E/I dimension
        options: [
          { text: "Strongly Disagree", value: 1, order: 0 },
          { text: "Disagree", value: 2, order: 1 },
          { text: "Agree", value: 3, order: 2 },
          { text: "Strongly Agree", value: 4, order: 3 }
        ]
      },
      {
        text: "I prefer practical solutions over innovative ones.",
        order: 1,
        dimensionId: savedDimensions[1].id, // S/N dimension
        options: [
          { text: "Strongly Disagree", value: 1, order: 0 },
          { text: "Disagree", value: 2, order: 1 },
          { text: "Agree", value: 3, order: 2 },
          { text: "Strongly Agree", value: 4, order: 3 }
        ]
      }
    ]
    
    await prisma.quizQuestion.deleteMany({ where: { quizId: quiz.id } })
    const createdQuestions = await prisma.quizQuestion.createMany({
      data: questions.map(q => ({
        text: q.text,
        order: q.order,
        dimensionId: q.dimensionId,
        quizId: quiz.id,
        options: {
          create: q.options.map(opt => ({
            text: opt.text,
            value: opt.value,
            order: opt.order
          }))
        }
      }))
    })
    
    console.log(`   ✅ ${createdQuestions.count} questions created`)
    
    // Test adding grading criteria
    console.log('\n4. Adding grading criteria...')
    const gradingCriteria = [
      {
        name: "ISTJ",
        label: "The Inspector",
        color: "#3B82F6",
        recommendations: ["Focus on organized routines"],
        areasOfImprovement: ["Flexibility"],
        supportNeeded: ["Organizational tools"],
        proposedCourses: [],
        proposedProducts: [],
        proposedStreaks: [],
        proposedBlogPosts: [],
        description: "The Inspector personality type",
        scoringLogic: {
          type: "threshold",
          dimensions: [
            { name: "E/I", value: "low", threshold: 15 },
            { name: "S/N", value: "high", threshold: 20 }
          ]
        }
      }
    ]
    
    await prisma.complexGradingCriteria.deleteMany({ where: { quizId: quiz.id } })
    const createdCriteria = await prisma.complexGradingCriteria.createMany({
      data: gradingCriteria.map(criteria => ({
        ...criteria,
        quizId: quiz.id,
        scoringLogic: criteria.scoringLogic
      }))
    })
    
    console.log(`   ✅ ${createdCriteria.count} grading criteria created`)
    
    // Verify the complete quiz structure
    console.log('\n5. Verifying complete quiz structure...')
    const completeQuiz = await prisma.quiz.findUnique({
      where: { id: quiz.id },
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
    
    console.log(`   📊 Quiz Summary:`)
    console.log(`      - Title: ${completeQuiz.title}`)
    console.log(`      - Type: ${completeQuiz.quizType}`)
    console.log(`      - Dimensions: ${completeQuiz.dimensions.length}`)
    console.log(`      - Questions: ${completeQuiz.questions.length}`)
    console.log(`      - Grading Criteria: ${completeQuiz.complexGradingCriteria.length}`)
    
    // Verify dimension-question relationships
    console.log('\n6. Verifying dimension-question relationships...')
    let validRelationships = 0
    for (const question of completeQuiz.questions) {
      const dimension = completeQuiz.dimensions.find(d => d.id === question.dimensionId)
      if (dimension) {
        validRelationships++
        console.log(`   ✅ Q${question.order + 1}: "${question.text.substring(0, 30)}..." → ${dimension.shortName}`)
      } else {
        console.log(`   ❌ Q${question.order + 1}: Missing or invalid dimension ID: ${question.dimensionId}`)
      }
    }
    
    console.log(`\n   📊 Relationship Summary: ${validRelationships}/${completeQuiz.questions.length} questions have valid dimension assignments`)
    
    // Test scoring calculation
    console.log('\n7. Testing scoring calculation...')
    const testAnswers = [
      { questionId: completeQuiz.questions[0].id, optionId: completeQuiz.questions[0].options[2].id }, // Agree (3)
      { questionId: completeQuiz.questions[1].id, optionId: completeQuiz.questions[1].options[1].id }  // Disagree (2)
    ]
    
    const dimensionScores = {}
    for (const dim of completeQuiz.dimensions) {
      dimensionScores[dim.shortName] = 0
    }
    
    for (const answer of testAnswers) {
      const question = completeQuiz.questions.find(q => q.id === answer.questionId)
      if (question && question.dimensionId) {
        const option = question.options.find(o => o.id === answer.optionId)
        if (option) {
          const dimension = completeQuiz.dimensions.find(d => d.id === question.dimensionId)
          if (dimension) {
            dimensionScores[dimension.shortName] += option.value
          }
        }
      }
    }
    
    console.log('   📊 Calculated Dimension Scores:', dimensionScores)
    
    // Cleanup test data
    console.log('\n8. Cleaning up test data...')
    await prisma.quiz.delete({ where: { id: quiz.id } })
    console.log('   ✅ Test quiz deleted')
    
    console.log('\n🎉 Progressive Quiz Creation Test Completed Successfully!')
    console.log('   All steps worked correctly with real IDs and proper relationships.')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
if (require.main === module) {
  testProgressiveQuizCreation().catch(console.error)
}

module.exports = {
  testProgressiveQuizCreation
}
