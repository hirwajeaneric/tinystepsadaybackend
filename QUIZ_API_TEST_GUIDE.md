# Quiz System API Testing Guide

This guide provides comprehensive testing instructions for the Quiz System API endpoints. The quiz system allows authorized users to create, manage, and take quizzes, with detailed analytics and result tracking.

## Table of Contents
1. [Setup and Authentication](#setup-and-authentication)
2. [Quiz Management Endpoints](#quiz-management-endpoints)
3. [Public Quiz Endpoints](#public-quiz-endpoints)
4. [Quiz Results Endpoints](#quiz-results-endpoints)
5. [Quiz Analytics Endpoints](#quiz-analytics-endpoints)
6. [Sample Data](#sample-data)
7. [Testing Scenarios](#testing-scenarios)

## Setup and Authentication

### Prerequisites
- Backend server running
- MongoDB database connected
- Valid user account with ADMIN or INSTRUCTOR role for quiz creation
- Valid user account for taking quizzes

### Authentication
Most endpoints require authentication. Use the JWT token from login:
```bash
# Login to get token
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'

# Use token in subsequent requests
Authorization: Bearer <your_jwt_token>
```

## Quiz Management Endpoints

### 1. Create Quiz
**POST** `/api/quizzes/quizzes`
- **Auth Required**: Yes (ADMIN/INSTRUCTOR)
- **Description**: Create a new quiz with questions and grading criteria

```bash
curl -X POST http://localhost:3000/api/quizzes/quizzes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "quizType": "DEFAULT",
    "redirectAfterAnswer": "RESULTS",
    "title": "Habit Mastery Assessment",
    "subtitle": "Evaluate your habit-building skills",
    "description": "This comprehensive assessment evaluates your current habit formation practices and provides personalized insights.",
    "category": "Personal Development",
    "estimatedTime": "10-15 minutes",
    "difficulty": "INTERMEDIATE",
    "status": "ACTIVE",
    "isPublic": true,
    "tags": ["habits", "self-discipline", "productivity"],
    "questions": [
      {
        "text": "How often do you struggle to stick to a new habit?",
        "order": 1,
        "options": [
          {
            "text": "Almost never - I can maintain new habits easily",
            "value": 1,
            "order": 1
          },
          {
            "text": "Occasionally - Some habits stick, others don't",
            "value": 2,
            "order": 2
          },
          {
            "text": "Often - I regularly start strong but lose momentum",
            "value": 3,
            "order": 3
          },
          {
            "text": "Almost always - I find it very difficult to maintain new habits",
            "value": 4,
            "order": 4
          }
        ]
      }
    ],
    "gradingCriteria": [
      {
        "name": "Habit Master",
        "minScore": 80,
        "maxScore": 100,
        "label": "Habit Master",
        "color": "#10B981",
        "recommendations": [
          "Continue building on your strong foundation",
          "Share your knowledge with others",
          "Consider mentoring or coaching others"
        ],
        "proposedCourses": [
          {"id": "1", "name": "Advanced Habit Mastery", "slug": "advanced-habit-mastery"}
        ],
        "proposedProducts": [
          {"id": "1", "name": "Habit Mastery Guide", "slug": "habit-mastery-guide"}
        ],
        "proposedStreaks": [
          {"id": "1", "name": "Leadership Streak", "slug": "leadership-streak"}
        ],
        "description": "Excellent mastery of habits and routines"
      }
    ]
  }'
```

**Expected Response** (201 Created):
```json
{
  "id": "quiz_id_here",
  "title": "Habit Mastery Assessment",
  "quizType": "DEFAULT",
  "status": "ACTIVE",
  "isPublic": true,
  "questions": [...],
  "gradingCriteria": [...],
  "createdBy": "user_id_here",
  "createdAt": "2025-01-20T10:00:00.000Z"
}
```

### 2. Get All Quizzes
**GET** `/api/quizzes/quizzes`
- **Auth Required**: Yes
- **Query Parameters**: 
  - `search`: Search in title, description, subtitle
  - `category`: Filter by category
  - `difficulty`: Filter by difficulty (BEGINNER, INTERMEDIATE, ADVANCED)
  - `status`: Filter by status (DRAFT, ACTIVE, ARCHIVED)
  - `isPublic`: Filter by public status
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10, max: 100)
  - `sortBy`: Sort field (createdAt, updatedAt, title, totalAttempts, averageScore)
  - `sortOrder`: Sort direction (asc, desc)

```bash
curl -X GET "http://localhost:3000/api/quizzes/quizzes?page=1&limit=10&sortBy=createdAt&sortOrder=desc" \
  -H "Authorization: Bearer <token>"
```

### 3. Get Quiz by ID
**GET** `/api/quizzes/quizzes/:id`
- **Auth Required**: Yes
- **Description**: Get detailed quiz information including questions and grading criteria

```bash
curl -X GET http://localhost:3000/api/quizzes/quizzes/quiz_id_here \
  -H "Authorization: Bearer <token>"
```

### 4. Update Quiz
**PUT** `/api/quizzes/quizzes/:id`
- **Auth Required**: Yes (Quiz creator only)
- **Description**: Update quiz information

```bash
curl -X PUT http://localhost:3000/api/quizzes/quizzes/quiz_id_here \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Updated Habit Mastery Assessment",
    "status": "ACTIVE"
  }'
```

### 5. Delete Quiz
**DELETE** `/api/quizzes/quizzes/:id`
- **Auth Required**: Yes (Quiz creator only)
- **Description**: Delete a quiz and all associated data

```bash
curl -X DELETE http://localhost:3000/api/quizzes/quizzes/quiz_id_here \
  -H "Authorization: Bearer <token>"
```

## Public Quiz Endpoints

### 1. Get Public Quizzes
**GET** `/api/quizzes/public/quizzes`
- **Auth Required**: No
- **Description**: Get only public and active quizzes
- **Query Parameters**: Same as protected quizzes endpoint

```bash
curl -X GET "http://localhost:3000/api/quizzes/public/quizzes?category=Personal%20Development&difficulty=INTERMEDIATE"
```

### 2. Get Public Quiz by ID
**GET** `/api/quizzes/public/quizzes/:id`
- **Auth Required**: No
- **Description**: Get public quiz details for taking the quiz

```bash
curl -X GET http://localhost:3000/api/quizzes/public/quizzes/quiz_id_here
```

### 3. Get Quiz Categories
**GET** `/api/quizzes/categories`
- **Auth Required**: No
- **Description**: Get available quiz categories for filtering

```bash
curl -X GET http://localhost:3000/api/quizzes/categories
```

### 4. Get Quiz Difficulties
**GET** `/api/quizzes/difficulties`
- **Auth Required**: No
- **Description**: Get available quiz difficulties for filtering

```bash
curl -X GET http://localhost:3000/api/quizzes/difficulties
```

## Quiz Results Endpoints

### 1. Submit Quiz
**POST** `/api/quizzes/results`
- **Auth Required**: Yes
- **Description**: Submit quiz answers and get results

```bash
curl -X POST http://localhost:3000/api/quizzes/results \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
	"quizId":"689eec7ff38450f091afc30f",
	"answers": [
		{
			"questionId":"689eec7ff38450f091afc310",
			"optionId":"689eec7ff38450f091afc313"
		}
	],
	"timeSpent": 8.5
}'
```

**Expected Response** (201 Created):
```json
{
	"id": "689ef694f38450f091afc31e",
	"quizId": "689eec7ff38450f091afc30f",
	"userId": "688f663036af8a4d76d3a643",
	"score": 3,
	"maxScore": 4,
	"percentage": 75,
	"level": "GOOD",
	"feedback": "Good! You have a solid foundation with room for improvement.",
	"recommendations": [
		"Focus on consistency in your practice",
		"Identify and work on your weakest areas",
		"Set specific, measurable goals"
	],
	"completedAt": "2025-08-15T08:57:56.057Z",
	"timeSpent": 8.5,
	"answers": [
		{
			"questionId": "689eec7ff38450f091afc310",
			"optionId": "689eec7ff38450f091afc313"
		}
	],
	"classification": "Builder",
	"areasOfImprovement": [
		"Consistency",
		"Advanced techniques"
	],
	"supportNeeded": [
		"Practice tools",
		"Accountability partner"
	],
	"createdAt": "2025-08-15T08:57:56.062Z",
	"updatedAt": "2025-08-15T08:57:56.062Z",
	"quiz": {
		"id": "689eec7ff38450f091afc30f",
		"title": "Habit Mastery Assessment",
		"category": "Personal Development"
	},
	"user": {
		"id": "688f663036af8a4d76d3a643",
		"firstName": "Jean Eric",
		"lastName": "Hirwa",
		"email": "hirwajeric@gmail.com"
	}
}
```

### 2. Get Quiz Results
**GET** `/api/quizzes/results`
- **Auth Required**: Yes
- **Query Parameters**:
  - `userId`: Filter by user ID
  - `page`: Page number
  - `limit`: Items per page
  - `sortBy`: Sort field (createdAt, completedAt, score, percentage)
  - `sortOrder`: Sort direction (asc, desc)

```bash
curl -X GET "http://localhost:3000/api/quizzes/results?quizId=quiz_id_here&level=EXCELLENT" \
  -H "Authorization: Bearer <token>"
```

Expected Response:

```JSON
{
	"results": [
		{
			"id": "689ef768f38450f091afc31f",
			"quizId": "689eec7ff38450f091afc30f",
			"userId": "688f663036af8a4d76d3a643",
			"score": 3,
			"maxScore": 4,
			"percentage": 75,
			"level": "GOOD",
			"feedback": "Good! You have a solid foundation with room for improvement.",
			"recommendations": [
				"Focus on consistency in your practice",
				"Identify and work on your weakest areas",
				"Set specific, measurable goals"
			],
			"completedAt": "2025-08-15T09:01:28.410Z",
			"timeSpent": 8.5,
			"answers": [
				{
					"questionId": "689eec7ff38450f091afc310",
					"optionId": "689eec7ff38450f091afc313"
				}
			],
			"classification": "Builder",
			"areasOfImprovement": [
				"Consistency",
				"Advanced techniques"
			],
			"supportNeeded": [
				"Practice tools",
				"Accountability partner"
			],
			"createdAt": "2025-08-15T09:01:28.412Z",
			"updatedAt": "2025-08-15T09:01:28.412Z",
			"quiz": {
				"id": "689eec7ff38450f091afc30f",
				"title": "Habit Mastery Assessment",
				"category": "Personal Development"
			},
			"user": {
				"id": "688f663036af8a4d76d3a643",
				"firstName": "Jean Eric",
				"lastName": "Hirwa",
				"email": "hirwajeric@gmail.com"
			}
		},
		{
			"id": "689ef694f38450f091afc31e",
			"quizId": "689eec7ff38450f091afc30f",
			"userId": "688f663036af8a4d76d3a643",
			"score": 3,
			"maxScore": 4,
			"percentage": 75,
			"level": "GOOD",
			"feedback": "Good! You have a solid foundation with room for improvement.",
			"recommendations": [
				"Focus on consistency in your practice",
				"Identify and work on your weakest areas",
				"Set specific, measurable goals"
			],
			"completedAt": "2025-08-15T08:57:56.057Z",
			"timeSpent": 8.5,
			"answers": [
				{
					"questionId": "689eec7ff38450f091afc310",
					"optionId": "689eec7ff38450f091afc313"
				}
			],
			"classification": "Builder",
			"areasOfImprovement": [
				"Consistency",
				"Advanced techniques"
			],
			"supportNeeded": [
				"Practice tools",
				"Accountability partner"
			],
			"createdAt": "2025-08-15T08:57:56.062Z",
			"updatedAt": "2025-08-15T08:57:56.062Z",
			"quiz": {
				"id": "689eec7ff38450f091afc30f",
				"title": "Habit Mastery Assessment",
				"category": "Personal Development"
			},
			"user": {
				"id": "688f663036af8a4d76d3a643",
				"firstName": "Jean Eric",
				"lastName": "Hirwa",
				"email": "hirwajeric@gmail.com"
			}
		}
	],
	"total": 2,
	"page": 1,
	"totalPages": 1
}
```

### 3. Get Quiz Result by ID
**GET** `/api/quizzes/results/:id`
- **Auth Required**: Yes
- **Description**: Get specific quiz result details

```bash
curl -X GET http://localhost:3000/api/quizzes/results/result_id_here \
  -H "Authorization: Bearer <token>"
```

Expected Results:
```JSON
{
	"id": "689ef768f38450f091afc31f",
	"quizId": "689eec7ff38450f091afc30f",
	"userId": "688f663036af8a4d76d3a643",
	"score": 3,
	"maxScore": 4,
	"percentage": 75,
	"level": "GOOD",
	"feedback": "Good! You have a solid foundation with room for improvement.",
	"recommendations": [
		"Focus on consistency in your practice",
		"Identify and work on your weakest areas",
		"Set specific, measurable goals"
	],
	"completedAt": "2025-08-15T09:01:28.410Z",
	"timeSpent": 8.5,
	"answers": [
		{
			"questionId": "689eec7ff38450f091afc310",
			"optionId": "689eec7ff38450f091afc313"
		}
	],
	"classification": "Builder",
	"areasOfImprovement": [
		"Consistency",
		"Advanced techniques"
	],
	"supportNeeded": [
		"Practice tools",
		"Accountability partner"
	],
	"createdAt": "2025-08-15T09:01:28.412Z",
	"updatedAt": "2025-08-15T09:01:28.412Z",
	"quiz": {
		"id": "689eec7ff38450f091afc30f",
		"title": "Habit Mastery Assessment",
		"category": "Personal Development"
	},
	"user": {
		"id": "688f663036af8a4d76d3a643",
		"firstName": "Jean Eric",
		"lastName": "Hirwa",
		"email": "hirwajeric@gmail.com"
	}
}
```

### 4. Get User Quiz Results
**GET** `/api/quizzes/user/results`
- **Auth Required**: Yes
- **Description**: Get current user's quiz results
- **Query Parameters**: `page`, `limit`

```bash
curl -X GET "http://localhost:3000/api/quizzes/user/results?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

Expected results:
```JSON
{
	"results": [
		{
			"id": "689ef768f38450f091afc31f",
			"quizId": "689eec7ff38450f091afc30f",
			"userId": "688f663036af8a4d76d3a643",
			"score": 3,
			"maxScore": 4,
			"percentage": 75,
			"level": "GOOD",
			"feedback": "Good! You have a solid foundation with room for improvement.",
			"recommendations": [
				"Focus on consistency in your practice",
				"Identify and work on your weakest areas",
				"Set specific, measurable goals"
			],
			"completedAt": "2025-08-15T09:01:28.410Z",
			"timeSpent": 8.5,
			"answers": [
				{
					"questionId": "689eec7ff38450f091afc310",
					"optionId": "689eec7ff38450f091afc313"
				}
			],
			"classification": "Builder",
			"areasOfImprovement": [
				"Consistency",
				"Advanced techniques"
			],
			"supportNeeded": [
				"Practice tools",
				"Accountability partner"
			],
			"createdAt": "2025-08-15T09:01:28.412Z",
			"updatedAt": "2025-08-15T09:01:28.412Z",
			"quiz": {
				"id": "689eec7ff38450f091afc30f",
				"title": "Habit Mastery Assessment",
				"category": "Personal Development"
			},
			"user": {
				"id": "688f663036af8a4d76d3a643",
				"firstName": "Jean Eric",
				"lastName": "Hirwa",
				"email": "hirwajeric@gmail.com"
			}
		},
		{
			"id": "689ef694f38450f091afc31e",
			"quizId": "689eec7ff38450f091afc30f",
			"userId": "688f663036af8a4d76d3a643",
			"score": 3,
			"maxScore": 4,
			"percentage": 75,
			"level": "GOOD",
			"feedback": "Good! You have a solid foundation with room for improvement.",
			"recommendations": [
				"Focus on consistency in your practice",
				"Identify and work on your weakest areas",
				"Set specific, measurable goals"
			],
			"completedAt": "2025-08-15T08:57:56.057Z",
			"timeSpent": 8.5,
			"answers": [
				{
					"questionId": "689eec7ff38450f091afc310",
					"optionId": "689eec7ff38450f091afc313"
				}
			],
			"classification": "Builder",
			"areasOfImprovement": [
				"Consistency",
				"Advanced techniques"
			],
			"supportNeeded": [
				"Practice tools",
				"Accountability partner"
			],
			"createdAt": "2025-08-15T08:57:56.062Z",
			"updatedAt": "2025-08-15T08:57:56.062Z",
			"quiz": {
				"id": "689eec7ff38450f091afc30f",
				"title": "Habit Mastery Assessment",
				"category": "Personal Development"
			},
			"user": {
				"id": "688f663036af8a4d76d3a643",
				"firstName": "Jean Eric",
				"lastName": "Hirwa",
				"email": "hirwajeric@gmail.com"
			}
		}
	],
	"total": 2,
	"page": 1,
	"totalPages": 1
}
```

## Quiz Analytics Endpoints

### 1. Get Quiz Analytics
**GET** `/api/quizzes/quizzes/:id/analytics`
- **Auth Required**: Yes (Quiz creator only)
- **Description**: Get comprehensive analytics for a quiz

```bash
curl -X GET http://localhost:3000/api/quizzes/quizzes/quiz_id_here/analytics \
  -H "Authorization: Bearer <token>"
```

**Expected Response**:
```json
{
	"totalAttempts": 2,
	"completedAttempts": 2,
	"completionRate": 100,
	"averageScore": 3,
	"averageTimeSpent": 8.5,
	"levelDistribution": {
		"excellent": 0,
		"good": 2,
		"fair": 0,
		"needsImprovement": 0
	},
	"dropoffPoints": [
		{
			"questionNumber": 1,
			"dropoffCount": 0,
			"dropoffRate": 2
		},
		{
			"questionNumber": 5,
			"dropoffCount": 0,
			"dropoffRate": 1
		},
		{
			"questionNumber": 8,
			"dropoffCount": 0,
			"dropoffRate": 1.5
		}
	],
	"popularClassifications": [
		{
			"classification": "Builder",
			"count": 2,
			"percentage": 100
		}
	],
	"timeDistribution": {
		"fast": 0,
		"normal": 2,
		"slow": 0
	}
}
```

## Sample Data

### Sample Quiz Creation
Here's a complete sample quiz for testing:

```json
{
  "quizType": "DEFAULT",
  "redirectAfterAnswer": "RESULTS",
  "title": "Mindfulness Assessment",
  "subtitle": "Evaluate your mindfulness practice",
  "description": "This assessment measures your current mindfulness practice and awareness levels.",
  "category": "Wellness",
  "estimatedTime": "8-12 minutes",
  "difficulty": "INTERMEDIATE",
  "status": "ACTIVE",
  "isPublic": true,
  "tags": ["mindfulness", "meditation", "awareness"],
  "questions": [
    {
      "text": "How often do you practice mindfulness or meditation?",
      "order": 1,
      "options": [
        {"text": "Daily - I have a consistent practice", "value": 1, "order": 1},
        {"text": "Several times per week", "value": 2, "order": 2},
        {"text": "Occasionally - once or twice per week", "value": 3, "order": 3},
        {"text": "Rarely or never", "value": 4, "order": 4}
      ]
    },
    {
      "text": "How aware are you of your thoughts and emotions throughout the day?",
      "order": 2,
      "options": [
        {"text": "Very aware - I notice most thoughts and emotions", "value": 1, "order": 1},
        {"text": "Somewhat aware - I notice them when I pay attention", "value": 2, "order": 2},
        {"text": "Occasionally aware - I notice them sometimes", "value": 3, "order": 3},
        {"text": "Rarely aware - I'm usually caught up in thoughts", "value": 4, "order": 4}
      ]
    }
  ],
  "gradingCriteria": [
    {
      "name": "Mindfulness Master",
      "minScore": 80,
      "maxScore": 100,
      "label": "Mindfulness Master",
      "color": "#10B981",
      "recommendations": [
        "Continue your daily practice",
        "Explore advanced meditation techniques",
        "Share your wisdom with others"
      ],
      "proposedCourses": [
        {"id": "1", "name": "Advanced Mindfulness", "slug": "advanced-mindfulness"}
      ],
      "proposedProducts": [
        {"id": "1", "name": "Mindfulness Mastery Guide", "slug": "mindfulness-guide"}
      ],
      "proposedStreaks": [
        {"id": "1", "name": "Meditation Streak", "slug": "meditation-streak"}
      ],
      "description": "Excellent mindfulness practice"
    },
    {
      "name": "Mindfulness Practitioner",
      "minScore": 60,
      "maxScore": 79,
      "label": "Mindfulness Practitioner",
      "color": "#3B82F6",
      "recommendations": [
        "Continue your daily practice",
        "Explore advanced meditation techniques",
        "Share your wisdom with others"
      ],
      "proposedCourses": [
        {"id": "2", "name": "Mindfulness Practitioner Course", "slug": "mindfulness-practitioner"}
      ],
      "proposedProducts": [
        {"id": "2", "name": "Mindfulness Practitioner Book", "slug": "mindfulness-practitioner-book"}
      ],
      "proposedStreaks": [
        {"id": "2", "name": "Reading Streak", "slug": "reading-streak"}
      ],
      "description": "Good mindfulness practice"
    }
  ]
}
```

## Testing Scenarios

### 1. Complete Quiz Lifecycle Test
1. **Create Quiz**: Create a new quiz as an admin/instructor
2. **Verify Quiz**: Get the created quiz and verify all fields
3. **Take Quiz**: Submit quiz answers as a regular user
4. **Check Results**: Verify the result calculation and recommendations
5. **View Analytics**: Check analytics as quiz creator
6. **Update Quiz**: Modify quiz details
7. **Delete Quiz**: Remove the quiz

### 2. Permission Testing
1. **Unauthorized Access**: Try to access protected endpoints without token
2. **Wrong Role**: Try to create quiz as regular user
3. **Wrong Owner**: Try to update/delete quiz created by another user
4. **Public vs Private**: Verify public endpoints work without authentication

### 3. Data Validation Testing
1. **Invalid Quiz Data**: Submit malformed quiz creation requests
2. **Invalid Answers**: Submit quiz with missing or invalid answers
3. **Edge Cases**: Test with minimum/maximum values, empty arrays, etc.

### 4. Performance Testing
1. **Large Quizzes**: Create quizzes with many questions
2. **Multiple Submissions**: Submit the same quiz multiple times
3. **Concurrent Users**: Simulate multiple users taking quizzes simultaneously

### 5. Error Handling Testing
1. **Invalid IDs**: Test with non-existent quiz/result IDs
2. **Database Errors**: Test with invalid data that might cause database errors
3. **Network Issues**: Test timeout and connection error scenarios

## Common Issues and Solutions

### 1. Quiz Creation Fails
- **Issue**: Validation errors on quiz creation
- **Solution**: Ensure all required fields are present and valid
- **Check**: Verify question options have valid values (1-10)

### 2. Quiz Submission Fails
- **Issue**: Quiz not found or not available
- **Solution**: Ensure quiz is public and status is ACTIVE
- **Check**: Verify quiz ID and user authentication

### 3. Analytics Access Denied
- **Issue**: 403 Forbidden when accessing analytics
- **Solution**: Ensure user is the quiz creator
- **Check**: Verify user ID matches quiz.createdBy

### 4. Database Connection Issues
- **Issue**: Prisma client errors
- **Solution**: Ensure MongoDB is running and connection string is correct
- **Check**: Run `npx prisma db push` to sync schema

## Monitoring and Logs

### Enable Debug Logging
```bash
# Set environment variable
export DEBUG=prisma:*

# Or in .env file
DEBUG=prisma:*
```

### Check Database Collections
```bash
# Connect to MongoDB and check collections
mongosh "your_connection_string"
use your_database
show collections
db.quizzes.find().limit(1)
db.quiz_results.find().limit(1)
```

### Monitor API Performance
- Check response times for quiz creation and submission
- Monitor database query performance
- Track memory usage during large quiz operations

## Conclusion

This testing guide covers all the essential endpoints and scenarios for the Quiz System API. The system provides a robust foundation for creating, managing, and taking quizzes with comprehensive analytics and result tracking.

For additional support or questions, refer to the main API documentation or contact the development team.
