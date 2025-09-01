/**
 * Test script for Quiz Lifecycle Management
 * This script tests the new quiz creation and update flow to ensure proper ID management
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123'
};

let authToken = '';
let createdQuizId = '';

// Helper function to make authenticated requests
const apiRequest = async (method, endpoint, data = null) => {
  const config = {
    method,
    url: `${BASE_URL}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    }
  };
  
  if (data) {
    config.data = data;
  }
  
  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Error ${method} ${endpoint}:`, error.response?.data || error.message);
    throw error;
  }
};

// Test functions
const testAuthentication = async () => {
  console.log('🔐 Testing authentication...');
  
  try {
    // Try to login first
    const loginResponse = await apiRequest('POST', '/auth/login', TEST_USER);
    authToken = loginResponse.data.token;
    console.log('✅ Authentication successful');
    return true;
  } catch (error) {
    // If login fails, try to register
    try {
      const registerResponse = await apiRequest('POST', '/auth/register', {
        ...TEST_USER,
        firstName: 'Test',
        lastName: 'User'
      });
      authToken = registerResponse.data.token;
      console.log('✅ Registration and authentication successful');
      return true;
    } catch (registerError) {
      console.error('❌ Authentication failed:', registerError.message);
      return false;
    }
  }
};

const testCreateQuizBasic = async () => {
  console.log('\n📝 Testing quiz basic creation...');
  
  const basicQuizData = {
    title: 'Test Quiz Lifecycle',
    subtitle: 'Testing the new lifecycle management',
    description: 'This quiz tests the new create/update flow',
    category: 'Personal Development',
    estimatedTime: '5',
    difficulty: 'BEGINNER',
    status: 'DRAFT',
    isPublic: false,
    quizType: 'DEFAULT',
    redirectAfterAnswer: 'HOME',
    tags: ['test', 'lifecycle']
  };
  
  try {
    const response = await apiRequest('POST', '/quizzes/basic', basicQuizData);
    
    if (response.success && response.data.id) {
      createdQuizId = response.data.id;
      console.log('✅ Quiz basic creation successful');
      console.log(`   Quiz ID: ${createdQuizId}`);
      console.log(`   Title: ${response.data.title}`);
      return true;
    } else {
      console.error('❌ Quiz creation failed: No ID returned');
      return false;
    }
  } catch (error) {
    console.error('❌ Quiz creation failed:', error.message);
    return false;
  }
};

const testUpdateQuizBasic = async () => {
  console.log('\n🔄 Testing quiz basic update...');
  
  if (!createdQuizId) {
    console.error('❌ No quiz ID available for update test');
    return false;
  }
  
  const updatedQuizData = {
    title: 'Updated Test Quiz Lifecycle',
    subtitle: 'Updated subtitle',
    description: 'This quiz has been updated to test the lifecycle management',
    category: 'Mental Health',
    estimatedTime: '10',
    difficulty: 'INTERMEDIATE',
    status: 'DRAFT',
    isPublic: false,
    quizType: 'DEFAULT',
    redirectAfterAnswer: 'RESULTS',
    tags: ['test', 'lifecycle', 'updated']
  };
  
  try {
    const response = await apiRequest('POST', `/quizzes/basic/${createdQuizId}`, updatedQuizData);
    
    if (response.success && response.data.id === createdQuizId) {
      console.log('✅ Quiz basic update successful');
      console.log(`   Updated Title: ${response.data.title}`);
      console.log(`   Updated Category: ${response.data.category}`);
      return true;
    } else {
      console.error('❌ Quiz update failed: ID mismatch or no success');
      return false;
    }
  } catch (error) {
    console.error('❌ Quiz update failed:', error.message);
    return false;
  }
};

const testCreateOrUpdateEndpoint = async () => {
  console.log('\n🔄 Testing createOrUpdate endpoint with new quiz...');
  
  const newQuizData = {
    title: 'New Quiz via CreateOrUpdate',
    subtitle: 'Testing createOrUpdate endpoint',
    description: 'This quiz is created using the new createOrUpdate endpoint',
    category: 'Career',
    estimatedTime: '15',
    difficulty: 'ADVANCED',
    status: 'DRAFT',
    isPublic: false,
    quizType: 'COMPLEX',
    redirectAfterAnswer: 'HOME',
    tags: ['test', 'createOrUpdate']
  };
  
  try {
    // Test creating new quiz (no ID in URL)
    const response = await apiRequest('POST', '/quizzes/basic', newQuizData);
    
    if (response.success && response.data.id) {
      console.log('✅ CreateOrUpdate endpoint - new quiz creation successful');
      console.log(`   New Quiz ID: ${response.data.id}`);
      console.log(`   Title: ${response.data.title}`);
      
      // Test updating the newly created quiz
      const updateData = {
        ...newQuizData,
        title: 'Updated via CreateOrUpdate',
        description: 'This quiz was updated using the createOrUpdate endpoint'
      };
      
      const updateResponse = await apiRequest('POST', `/quizzes/basic/${response.data.id}`, updateData);
      
      if (updateResponse.success && updateResponse.data.id === response.data.id) {
        console.log('✅ CreateOrUpdate endpoint - update successful');
        console.log(`   Updated Title: ${updateResponse.data.title}`);
        return true;
      } else {
        console.error('❌ CreateOrUpdate endpoint - update failed');
        return false;
      }
    } else {
      console.error('❌ CreateOrUpdate endpoint - creation failed');
      return false;
    }
  } catch (error) {
    console.error('❌ CreateOrUpdate endpoint test failed:', error.message);
    return false;
  }
};

const testProgressiveSteps = async () => {
  console.log('\n📊 Testing progressive quiz creation steps...');
  
  if (!createdQuizId) {
    console.error('❌ No quiz ID available for progressive steps test');
    return false;
  }
  
  try {
    // Step 2: Add dimensions (for complex quiz)
    const dimensions = [
      {
        name: 'Technical Skills',
        shortName: 'Tech',
        order: 1,
        minScore: 0,
        maxScore: 100,
        threshold: 70,
        lowLabel: 'Needs Improvement',
        highLabel: 'Excellent'
      },
      {
        name: 'Communication',
        shortName: 'Comm',
        order: 2,
        minScore: 0,
        maxScore: 100,
        threshold: 60,
        lowLabel: 'Poor',
        highLabel: 'Great'
      }
    ];
    
    const dimensionsResponse = await apiRequest('PUT', `/quizzes/${createdQuizId}/dimensions`, { dimensions });
    
    if (dimensionsResponse.success) {
      console.log('✅ Step 2: Dimensions added successfully');
    } else {
      console.error('❌ Step 2: Failed to add dimensions');
      return false;
    }
    
    // Step 3: Add questions
    const questions = [
      {
        text: 'How would you rate your technical skills?',
        dimensionId: dimensionsResponse.data.dimensions[0].id,
        order: 1,
        options: [
          { text: 'Beginner', value: 1, order: 1 },
          { text: 'Intermediate', value: 2, order: 2 },
          { text: 'Advanced', value: 3, order: 3 },
          { text: 'Expert', value: 4, order: 4 }
        ]
      },
      {
        text: 'How would you rate your communication skills?',
        dimensionId: dimensionsResponse.data.dimensions[1].id,
        order: 2,
        options: [
          { text: 'Poor', value: 1, order: 1 },
          { text: 'Fair', value: 2, order: 2 },
          { text: 'Good', value: 3, order: 3 },
          { text: 'Excellent', value: 4, order: 4 }
        ]
      }
    ];
    
    const questionsResponse = await apiRequest('PUT', `/quizzes/${createdQuizId}/questions`, { questions });
    
    if (questionsResponse.success) {
      console.log('✅ Step 3: Questions added successfully');
    } else {
      console.error('❌ Step 3: Failed to add questions');
      return false;
    }
    
    // Step 4: Add grading criteria
    const gradingData = {
      gradingCriteria: [
        {
          name: 'Low Performance',
          minScore: 0,
          maxScore: 50,
          label: 'Needs Improvement',
          color: '#ef4444',
          recommendations: ['Take online courses', 'Practice regularly'],
          areasOfImprovement: ['Technical skills', 'Communication'],
          supportNeeded: ['Mentorship', 'Training'],
          proposedCourses: [],
          proposedProducts: [],
          proposedStreaks: [],
          proposedBlogPosts: []
        },
        {
          name: 'High Performance',
          minScore: 51,
          maxScore: 100,
          label: 'Excellent',
          color: '#10b981',
          recommendations: ['Continue current practices', 'Share knowledge'],
          areasOfImprovement: [],
          supportNeeded: [],
          proposedCourses: [],
          proposedProducts: [],
          proposedStreaks: [],
          proposedBlogPosts: []
        }
      ]
    };
    
    const gradingResponse = await apiRequest('PUT', `/quizzes/${createdQuizId}/grading`, gradingData);
    
    if (gradingResponse.success) {
      console.log('✅ Step 4: Grading criteria added successfully');
      return true;
    } else {
      console.error('❌ Step 4: Failed to add grading criteria');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Progressive steps test failed:', error.message);
    return false;
  }
};

const testQuizRetrieval = async () => {
  console.log('\n📖 Testing quiz retrieval...');
  
  if (!createdQuizId) {
    console.error('❌ No quiz ID available for retrieval test');
    return false;
  }
  
  try {
    const response = await apiRequest('GET', `/quizzes/${createdQuizId}`);
    
    if (response.success && response.data.id === createdQuizId) {
      console.log('✅ Quiz retrieval successful');
      console.log(`   Title: ${response.data.title}`);
      console.log(`   Questions: ${response.data.questions?.length || 0}`);
      console.log(`   Dimensions: ${response.data.dimensions?.length || 0}`);
      console.log(`   Grading Criteria: ${response.data.gradingCriteria?.length || 0}`);
      return true;
    } else {
      console.error('❌ Quiz retrieval failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Quiz retrieval failed:', error.message);
    return false;
  }
};

const cleanup = async () => {
  console.log('\n🧹 Cleaning up test data...');
  
  if (createdQuizId) {
    try {
      await apiRequest('DELETE', `/quizzes/${createdQuizId}`);
      console.log('✅ Test quiz deleted successfully');
    } catch (error) {
      console.error('❌ Failed to delete test quiz:', error.message);
    }
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting Quiz Lifecycle Management Tests\n');
  
  const tests = [
    { name: 'Authentication', fn: testAuthentication },
    { name: 'Create Quiz Basic', fn: testCreateQuizBasic },
    { name: 'Update Quiz Basic', fn: testUpdateQuizBasic },
    { name: 'CreateOrUpdate Endpoint', fn: testCreateOrUpdateEndpoint },
    { name: 'Progressive Steps', fn: testProgressiveSteps },
    { name: 'Quiz Retrieval', fn: testQuizRetrieval }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`❌ ${test.name} test crashed:`, error.message);
      failed++;
    }
  }
  
  await cleanup();
  
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Quiz lifecycle management is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the implementation.');
  }
};

// Run the tests
runTests().catch(console.error);
