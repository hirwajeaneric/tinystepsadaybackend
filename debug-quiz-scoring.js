// Debug script for quiz scoring issues
// Run with: node debug-quiz-scoring.js

const quizData = {
  "id": "68accb960dfdd4ec96c3ecf1",
  "quizType": "COMPLEX",
  "dimensions": [
    {
      "id": "68b061c7eecefbad208409d4",
      "name": "Extraversion/Introversion",
      "shortName": "E/I",
      "order": 0,
      "minScore": 8,
      "maxScore": 32,
      "threshold": 15,
      "lowLabel": "I",
      "highLabel": "E"
    },
    {
      "id": "68b061c7eecefbad208409d5",
      "name": "Sensing/Intuition",
      "shortName": "S/N",
      "order": 1,
      "minScore": 8,
      "maxScore": 27,
      "threshold": 20,
      "lowLabel": "N",
      "highLabel": "S"
    },
    {
      "id": "68b061c7eecefbad208409d6",
      "name": "Thinking/Feeling",
      "shortName": "T/F",
      "order": 2,
      "minScore": 5,
      "maxScore": 34,
      "threshold": 5,
      "lowLabel": "F",
      "highLabel": "T"
    },
    {
      "id": "68b061c7eecefbad208409d7",
      "name": "Judging/Perceiving",
      "shortName": "J/P",
      "order": 3,
      "minScore": 4,
      "maxScore": 32,
      "threshold": 5,
      "lowLabel": "P",
      "highLabel": "J"
    }
  ],
  "complexGradingCriteria": [
    {
      "id": "68b061c7eecefbad208409d8",
      "name": "ISTJ",
      "label": "The Inspector",
      "scoringLogic": {
        "type": "threshold",
        "dimensions": [
          {
            "name": "E/I",
            "value": "low",
            "threshold": 15
          },
          {
            "name": "S/N",
            "value": "high",
            "threshold": 20
          },
          {
            "name": "T/F",
            "value": "high",
            "threshold": 5
          },
          {
            "name": "J/P",
            "value": "high",
            "threshold": 5
          }
        ]
      }
    }
  ]
};

const answers = [
  { "questionId": "68b061c9eecefbad208409dc", "optionId": "68b061c9eecefbad208409dd" },
  { "questionId": "68b061c9eecefbad208409e1", "optionId": "68b061caeecefbad208409e2" },
  { "questionId": "68b061caeecefbad208409e6", "optionId": "68b061caeecefbad208409e7" },
  { "questionId": "68b061cbeecefbad208409eb", "optionId": "68b061cbeecefbad208409ed" },
  { "questionId": "68b061cbeecefbad208409f0", "optionId": "68b061cbeecefbad208409f2" },
  { "questionId": "68b061cceecefbad208409f5", "optionId": "68b061cceecefbad208409f6" },
  { "questionId": "68b061cceecefbad208409fa", "optionId": "68b061cdeecefbad208409fd" },
  { "questionId": "68b061cdeecefbad208409ff", "optionId": "68b061cdeecefbad20840a01" },
  { "questionId": "68b061cdeecefbad20840a04", "optionId": "68b061ceeecefbad20840a05" },
  { "questionId": "68b061ceeecefbad20840a09", "optionId": "68b061ceeecefbad20840a0b" },
  { "questionId": "68b061ceeecefbad20840a0e", "optionId": "68b061cfeecefbad20840a11" },
  { "questionId": "68b061cfeecefbad20840a13", "optionId": "68b061cfeecefbad20840a15" },
  { "questionId": "68b061cfeecefbad20840a18", "optionId": "68b061d0eecefbad20840a19" },
  { "questionId": "68b061d0eecefbad20840a1d", "optionId": "68b061d0eecefbad20840a1f" },
  { "questionId": "68b061d1eecefbad20840a22", "optionId": "68b061d1eecefbad20840a25" },
  { "questionId": "68b061d1eecefbad20840a27", "optionId": "68b061d1eecefbad20840a29" },
  { "questionId": "68b061d2eecefbad20840a2c", "optionId": "68b061d2eecefbad20840a2d" },
  { "questionId": "68b061d2eecefbad20840a31", "optionId": "68b061d2eecefbad20840a32" },
  { "questionId": "68b061d3eecefbad20840a36", "optionId": "68b061d3eecefbad20840a38" },
  { "questionId": "68b061d3eecefbad20840a3b", "optionId": "68b061d3eecefbad20840a3e" },
  { "questionId": "68b061d4eecefbad20840a40", "optionId": "68b061d4eecefbad20840a44" },
  { "questionId": "68b061d4eecefbad20840a45", "optionId": "68b061d4eecefbad20840a46" },
  { "questionId": "68b061d5eecefbad20840a4a", "optionId": "68b061d5eecefbad20840a4c" },
  { "questionId": "68b061d5eecefbad20840a4f", "optionId": "68b061d5eecefbad20840a50" },
  { "questionId": "68b061d6eecefbad20840a54", "optionId": "68b061d6eecefbad20840a57" },
  { "questionId": "68b061d6eecefbad20840a59", "optionId": "68b061d6eecefbad20840a5a" },
  { "questionId": "68b061d7eecefbad20840a5e", "optionId": "68b061d7eecefbad20840a60" },
  { "questionId": "68b061d7eecefbad20840a63", "optionId": "68b061d7eecefbad20840a64" },
  { "questionId": "68b061d8eecefbad20840a68", "optionId": "68b061d8eecefbad20840a6a" },
  { "questionId": "68b061d8eecefbad20840a6d", "optionId": "68b061d9eecefbad20840a6f" },
  { "questionId": "68b061d9eecefbad20840a72", "optionId": "68b061d9eecefbad20840a73" },
  { "questionId": "68b061daeecefbad20840a77", "optionId": "68b061daeecefbad20840a79" }
];

// Mock question data with dimension mappings
const questions = [
  // E/I questions (dimensionId: 68accc280dfdd4ec96c3ecf7)
  { id: "68b061c9eecefbad208409dc", dimensionId: "68accc280dfdd4ec96c3ecf7", options: [{ id: "68b061c9eecefbad208409dd", value: 1 }] },
  { id: "68b061c9eecefbad208409e1", dimensionId: "68accc280dfdd4ec96c3ecf7", options: [{ id: "68b061caeecefbad208409e2", value: 1 }] },
  
  // S/N questions (dimensionId: 68ad8841192fb1fffb7f35c5)
  { id: "68b061caeecefbad208409e6", dimensionId: "68ad8841192fb1fffb7f35c5", options: [{ id: "68b061caeecefbad208409e7", value: 1 }] },
  { id: "68b061cbeecefbad208409eb", dimensionId: "68ad8841192fb1fffb7f35c5", options: [{ id: "68b061cbeecefbad208409ed", value: 2 }] },
  { id: "68b061cbeecefbad208409f0", dimensionId: "68ad8841192fb1fffb7f35c5", options: [{ id: "68b061cbeecefbad208409f2", value: 2 }] },
  { id: "68b061cceecefbad208409f5", dimensionId: "68ad8841192fb1fffb7f35c5", options: [{ id: "68b061cceecefbad208409f6", value: 1 }] },
  { id: "68b061cceecefbad208409fa", dimensionId: "68ad8841192fb1fffb7f35c5", options: [{ id: "68b061cdeecefbad208409fd", value: 3 }] },
  { id: "68b061cdeecefbad208409ff", dimensionId: "68ad8841192fb1fffb7f35c5", options: [{ id: "68b061cdeecefbad20840a01", value: 2 }] },
  { id: "68b061cdeecefbad20840a04", dimensionId: "68ad8841192fb1fffb7f35c5", options: [{ id: "68b061ceeecefbad20840a05", value: 1 }] },
  { id: "68b061ceeecefbad20840a09", dimensionId: "68ad8841192fb1fffb7f35c5", options: [{ id: "68b061ceeecefbad20840a0b", value: 2 }] },
  { id: "68b061ceeecefbad20840a0e", dimensionId: "68ad8841192fb1fffb7f35c5", options: [{ id: "68b061cfeecefbad20840a11", value: 1 }] },
  { id: "68b061cfeecefbad20840a13", dimensionId: "68ad8841192fb1fffb7f35c5", options: [{ id: "68b061cfeecefbad20840a15", value: 2 }] },
  { id: "68b061cfeecefbad20840a18", dimensionId: "68ad8841192fb1fffb7f35c5", options: [{ id: "68b061d0eecefbad20840a19", value: 1 }] },
  { id: "68b061d0eecefbad20840a1d", dimensionId: "68ad8841192fb1fffb7f35c5", options: [{ id: "68b061d0eecefbad20840a1f", value: 2 }] },
  { id: "68b061d1eecefbad20840a22", dimensionId: "68ad8841192fb1fffb7f35c5", options: [{ id: "68b061d1eecefbad20840a25", value: 3 }] },
  { id: "68b061d1eecefbad20840a27", dimensionId: "68ad8841192fb1fffb7f35c5", options: [{ id: "68b061d1eecefbad20840a29", value: 2 }] },
  
  // T/F questions (dimensionId: 68ad8c47192fb1fffb7f35f3)
  { id: "68b061d2eecefbad20840a2c", dimensionId: "68ad8c47192fb1fffb7f35f3", options: [{ id: "68b061d2eecefbad20840a2d", value: 1 }] },
  { id: "68b061d2eecefbad20840a31", dimensionId: "68ad8c47192fb1fffb7f35f3", options: [{ id: "68b061d2eecefbad20840a32", value: 2 }] },
  { id: "68b061d3eecefbad20840a36", dimensionId: "68ad8c47192fb1fffb7f35f3", options: [{ id: "68b061d3eecefbad20840a38", value: 2 }] },
  { id: "68b061d3eecefbad20840a3b", dimensionId: "68ad8c47192fb1fffb7f35f3", options: [{ id: "68b061d3eecefbad20840a3e", value: 3 }] },
  { id: "68b061d4eecefbad20840a40", dimensionId: "68ad8c47192fb1fffb7f35f3", options: [{ id: "68b061d4eecefbad20840a44", value: 3 }] },
  { id: "68b061d4eecefbad20840a45", dimensionId: "68ad8c47192fb1fffb7f35f3", options: [{ id: "68b061d4eecefbad20840a46", value: 2 }] },
  { id: "68b061d5eecefbad20840a4a", dimensionId: "68ad8c47192fb1fffb7f35f3", options: [{ id: "68b061d5eecefbad20840a4c", value: 2 }] },
  { id: "68b061d5eecefbad20840a4f", dimensionId: "68ad8c47192fb1fffb7f35f3", options: [{ id: "68b061d5eecefbad20840a50", value: 2 }] },
  
  // J/P questions (dimensionId: 68ad8c47192fb1fffb7f35f4)
  { id: "68b061d6eecefbad20840a54", dimensionId: "68ad8c47192fb1fffb7f35f4", options: [{ id: "68b061d6eecefbad20840a57", value: 3 }] },
  { id: "68b061d6eecefbad20840a59", dimensionId: "68ad8c47192fb1fffb7f35f4", options: [{ id: "68b061d6eecefbad20840a5a", value: 2 }] },
  { id: "68b061d7eecefbad20840a5e", dimensionId: "68ad8c47192fb1fffb7f35f4", options: [{ id: "68b061d7eecefbad20840a60", value: 3 }] },
  { id: "68b061d7eecefbad20840a63", dimensionId: "68ad8c47192fb1fffb7f35f4", options: [{ id: "68b061d7eecefbad20840a64", value: 4 }] },
  { id: "68b061d8eecefbad20840a68", dimensionId: "68ad8c47192fb1fffb7f35f4", options: [{ id: "68b061d8eecefbad20840a6a", value: 2 }] },
  { id: "68b061d8eecefbad20840a6d", dimensionId: "68ad8c47192fb1fffb7f35f4", options: [{ id: "68b061d9eecefbad20840a6f", value: 3 }] },
  { id: "68b061d9eecefbad20840a72", dimensionId: "68ad8c47192fb1fffb7f35f4", options: [{ id: "68b061d9eecefbad20840a73", value: 2 }] },
  { id: "68b061daeecefbad20840a77", dimensionId: "68ad8c47192fb1fffb7f35f4", options: [{ id: "68b061daeecefbad20840a79", value: 2 }] }
];

function debugQuizScoring() {
  console.log('=== QUIZ SCORING DEBUG ===\n');
  
  // 1. Analyze quiz structure
  console.log('1. Quiz Structure:');
  console.log(`   - Quiz Type: ${quizData.quizType}`);
  console.log(`   - Dimensions: ${quizData.dimensions.length}`);
  console.log(`   - Grading Criteria: ${quizData.complexGradingCriteria.length}`);
  console.log(`   - Questions: ${questions.length}`);
  console.log(`   - Answers: ${answers.length}\n`);
  
  // 2. Analyze dimensions
  console.log('2. Dimensions:');
  quizData.dimensions.forEach((dim, index) => {
    const dimQuestions = questions.filter(q => q.dimensionId === dim.id);
    console.log(`   ${index + 1}. ${dim.shortName} (${dim.name})`);
    console.log(`      - ID: ${dim.id}`);
    console.log(`      - Threshold: ${dim.threshold}`);
    console.log(`      - Score Range: ${dim.minScore}-${dim.maxScore}`);
    console.log(`      - Questions: ${dimQuestions.length}`);
    console.log(`      - Labels: ${dim.lowLabel}/${dim.highLabel}\n`);
  });
  
  // 3. Calculate dimension scores
  console.log('3. Dimension Score Calculation:');
  const dimensionScores = {};
  
  for (const dim of quizData.dimensions) {
    dimensionScores[dim.shortName] = 0;
    const dimQuestions = questions.filter(q => q.dimensionId === dim.id);
    
    console.log(`   ${dim.shortName}:`);
    for (const answer of answers) {
      const question = dimQuestions.find(q => q.id === answer.questionId);
      if (question) {
        const option = question.options.find(o => o.id === answer.optionId);
        if (option) {
          dimensionScores[dim.shortName] += option.value;
          console.log(`      Q${question.id.slice(-4)}: +${option.value} = ${dimensionScores[dim.shortName]}`);
        }
      }
    }
    console.log(`   Total ${dim.shortName}: ${dimensionScores[dim.shortName]}\n`);
  }
  
  // 4. Test classification logic
  console.log('4. Classification Logic Testing:');
  for (const criteria of quizData.complexGradingCriteria) {
    console.log(`   Testing: ${criteria.name} (${criteria.label})`);
    
    if (criteria.scoringLogic.type === 'threshold') {
      const matches = criteria.scoringLogic.dimensions.every(dim => {
        const score = dimensionScores[dim.name];
        if (typeof score === 'undefined') {
          console.log(`      ❌ ${dim.name}: Score undefined`);
          return false;
        }
        
        let matches = false;
        if (dim.value === 'low') {
          matches = score <= dim.threshold;
          console.log(`      ${dim.name}: ${score} <= ${dim.threshold} = ${matches} (${dim.value})`);
        } else if (dim.value === 'high') {
          matches = score > dim.threshold;
          console.log(`      ${dim.name}: ${score} > ${dim.threshold} = ${matches} (${dim.value})`);
        }
        
        return matches;
      });
      
      console.log(`   Overall Match: ${matches ? '✅ YES' : '❌ NO'}\n`);
      
      if (matches) {
        console.log(`🎉 CLASSIFICATION FOUND: ${criteria.name} - ${criteria.label}\n`);
        return;
      }
    }
  }
  
  // 5. Generate partial MBTI
  console.log('5. Partial MBTI Classification:');
  let partialType = '';
  for (const dim of quizData.dimensions) {
    const score = dimensionScores[dim.shortName];
    if (typeof score !== 'undefined') {
      if (dim.shortName === 'E/I') {
        partialType += score <= dim.threshold ? 'I' : 'E';
      } else if (dim.shortName === 'S/N') {
        partialType += score <= dim.threshold ? 'N' : 'S';
      } else if (dim.shortName === 'T/F') {
        partialType += score <= dim.threshold ? 'F' : 'T';
      } else if (dim.shortName === 'J/P') {
        partialType += score <= dim.threshold ? 'P' : 'J';
      }
    } else {
      partialType += '?';
    }
  }
  
  console.log(`   Partial Type: ${partialType}`);
  console.log(`   This suggests the person is: ${partialType.replace(/\?/g, '')}`);
  
  // 6. Issues found
  console.log('\n6. Issues Found:');
  if (Object.values(dimensionScores).some(score => score === 0)) {
    console.log('   ❌ Some dimensions have 0 scores - check question-dimension mapping');
  }
  
  const totalPossibleScore = questions.length * 4; // Assuming max value is 4
  const actualTotalScore = Object.values(dimensionScores).reduce((sum, score) => sum + score, 0);
  console.log(`   Total possible score: ${totalPossibleScore}`);
  console.log(`   Actual total score: ${actualTotalScore}`);
  
  if (actualTotalScore === 0) {
    console.log('   ❌ CRITICAL: All scores are 0 - major issue with scoring logic');
  }
}

// Run the debug
debugQuizScoring();
