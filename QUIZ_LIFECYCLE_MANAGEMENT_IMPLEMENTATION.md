# Quiz Lifecycle Management Implementation

## Overview

This document describes the implementation of proper quiz lifecycle management to address the issues with quiz creation vs. updates, ensuring the system can distinguish between new quiz creation and existing quiz editing.

## Problems Addressed

### 1. Frontend Issues
- **Unclear quiz state**: No clear distinction between creating a new quiz vs editing an existing one
- **Missing quiz ID management**: Quiz ID not properly set when editing existing quizzes
- **No validation for step progression**: Users could proceed to next steps without saving basic information first
- **Poor user feedback**: No visual indicators showing quiz state (draft vs created)

### 2. Backend Issues
- **No unified create/update endpoint**: Separate endpoints for creation and updates
- **Missing validation**: No validation to prevent duplicate quiz creation
- **Inconsistent error handling**: Poor error handling for quiz state transitions

## Solution Implementation

### Backend Changes

#### 1. New Controller Method
**File**: `src/controllers/quizController.ts`

Added `createOrUpdateQuizBasic` method that handles both creation and updates:

```typescript
async createOrUpdateQuizBasic(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const validatedData = quizSchema.parse(req.body);
  const userId = req.user?.userId;

  let quiz;
  if (id) {
    // Update existing quiz
    quiz = await quizService.updateQuizBasic(id, validatedData, userId);
    return res.json({
      success: true,
      message: "Basic quiz information updated successfully",
      data: quiz
    });
  } else {
    // Create new quiz
    quiz = await quizService.createQuizBasic(validatedData, userId);
    return res.status(201).json({
      success: true,
      message: "Basic quiz information created successfully",
      data: quiz
    });
  }
}
```

#### 2. New Service Method
**File**: `src/services/quizService.ts`

Added `updateQuizBasic` method for updating only basic quiz information:

```typescript
async updateQuizBasic(id: string, data: CreateQuizData, updatedBy: string): Promise<Quiz> {
  const existingQuiz = await prisma.quiz.findUnique({
    where: { id },
    select: { createdBy: true }
  });

  if (!existingQuiz) {
    throw new NotFoundError("Quiz not found", "QUIZ_NOT_FOUND");
  }

  if (existingQuiz.createdBy !== updatedBy) {
    throw new AuthorizationError("Unauthorized to update this quiz", "INSUFFICIENT_PERMISSIONS");
  }

  // Validate and update only basic information
  const { questions, gradingCriteria, complexGradingCriteria, dimensions, ...basicData } = data;
  
  const quiz = await prisma.quiz.update({
    where: { id },
    data: basicData,
    include: { /* ... */ }
  });

  return this.formatQuiz(quiz);
}
```

#### 3. New Route
**File**: `src/routes/quizRoutes.ts`

Added flexible route that handles both creation and updates:

```typescript
router.post("/quizzes/basic/:id?", authorize(UserRole.ADMIN, UserRole.INSTRUCTOR) as RequestHandler, validate({ body: quizSchema }), quizController.createOrUpdateQuizBasic as RequestHandler)
```

### Frontend Changes

#### 1. Enhanced API Integration
**File**: `src/integration/quiz.ts`

Added `createOrUpdateQuizBasic` method:

```typescript
async createOrUpdateQuizBasic(data: CreateQuizBasicData, quizId?: string): Promise<Quiz> {
  const url = quizId ? `/quizzes/basic/${quizId}` : '/quizzes/basic';
  const response = await apiClient.post(url, data);
  return (response as any).data.data;
}
```

#### 2. Improved Quiz State Management
**File**: `src/components/quiz/QuizEditClient.tsx`

**Key improvements:**

1. **Proper ID Management**:
   ```typescript
   // Editing existing quiz - set the quiz ID
   setFormData({
     id: quiz.id, // Set the quiz ID for editing mode
     // ... other fields
   });

   // Creating new quiz - ensure no ID
   setFormData(prev => ({
     ...prev,
     id: undefined, // Ensure no ID for new quiz
     // ... other fields
   }));
   ```

2. **Step Validation**:
   ```typescript
   const validateAndSaveStep = async (stepNumber: number): Promise<boolean> => {
     // For step 1, ensure basic information is saved
     if (stepNumber === 1) {
       if (!formData.title || !formData.description || !formData.category || !formData.quizType) {
         toast({
           title: "Missing Required Information",
           description: "Please fill in all required fields before proceeding.",
           variant: "destructive"
         });
         return false;
       }
     }

     // For other steps, ensure quiz ID exists
     if (stepNumber > 1 && !formData.id) {
       toast({
         title: "Quiz Not Created",
         description: "Please complete and save the basic information first.",
         variant: "destructive"
       });
       return false;
     }

     return true;
   };
   ```

3. **Visual State Indicators**:
   ```typescript
   {formData.id ? (
     <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
       <CheckCircle className="h-4 w-4" />
       <span className="font-medium">Quiz Created</span>
       <span className="text-xs text-green-500">ID: {formData.id}</span>
     </div>
   ) : (
     <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
       <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
       <span className="font-medium">Draft Mode</span>
     </div>
   )}
   ```

4. **Enhanced Save Logic**:
   ```typescript
   const updateExistingQuiz = async (stepNumber: number, updatedData: Partial<QuizFormData>): Promise<void> => {
     switch (stepNumber) {
       case 1: // Basic Information
         if (updatedData.title || updatedData.description || updatedData.category || updatedData.quizType) {
           const basicData: CreateQuizBasicData = {
             // ... merge current and updated data
           };
           
           await quizAPI.createOrUpdateQuizBasic(basicData, formData.id);
           toast({
             title: "Progress Saved",
             description: "Basic quiz information updated successfully.",
           });
         }
         break;
       // ... other cases
     }
   };
   ```

## Key Features

### 1. Unified Create/Update Flow
- Single endpoint handles both creation and updates
- Automatic detection based on presence of quiz ID
- Consistent error handling and validation

### 2. Progressive Step Validation
- Users cannot proceed to next steps without saving basic information
- Clear error messages when validation fails
- Automatic saving before step transitions

### 3. Visual State Management
- Clear indicators showing quiz state (Draft vs Created)
- Quiz ID display when quiz is created
- Unsaved changes warnings

### 4. Proper ID Management
- Quiz ID is set immediately after creation
- ID is preserved throughout the editing process
- No duplicate quiz creation possible

### 5. Enhanced User Experience
- Clear feedback on save operations
- Validation messages for required fields
- Progress indicators and state management

## API Endpoints

### New Endpoints

1. **POST /api/quizzes/basic/:id?** - Create or update quiz basic information
   - If `id` is provided: Updates existing quiz
   - If `id` is not provided: Creates new quiz
   - Returns quiz object with ID

### Existing Endpoints (Enhanced)

1. **POST /api/quizzes/basic** - Create new quiz basic information
2. **PUT /api/quizzes/:id/dimensions** - Add dimensions to existing quiz
3. **PUT /api/quizzes/:id/questions** - Add questions to existing quiz
4. **PUT /api/quizzes/:id/grading** - Add grading criteria to existing quiz

## Testing

A comprehensive test script has been created: `test-quiz-lifecycle.js`

The test covers:
- Authentication
- Quiz basic creation
- Quiz basic updates
- CreateOrUpdate endpoint functionality
- Progressive step creation
- Quiz retrieval
- Cleanup

Run the test with:
```bash
cd tinystepsaday-backend
node test-quiz-lifecycle.js
```

## Usage Examples

### Creating a New Quiz
```typescript
// Frontend
const result = await quizAPI.createOrUpdateQuizBasic(basicData);
// result.id will be set after creation

// Backend
POST /api/quizzes/basic
{
  "title": "My New Quiz",
  "description": "Quiz description",
  "category": "Personal Development",
  "quizType": "DEFAULT"
}
```

### Updating an Existing Quiz
```typescript
// Frontend
const result = await quizAPI.createOrUpdateQuizBasic(basicData, quizId);

// Backend
POST /api/quizzes/basic/quiz-id-here
{
  "title": "Updated Quiz Title",
  "description": "Updated description",
  "category": "Mental Health",
  "quizType": "COMPLEX"
}
```

## Benefits

1. **Clear State Management**: Users always know if they're creating or editing
2. **Prevented Data Loss**: Validation ensures users save before proceeding
3. **Better UX**: Visual indicators and clear feedback
4. **Consistent API**: Unified endpoint reduces complexity
5. **Proper ID Management**: Quiz IDs are properly tracked throughout the lifecycle
6. **Enhanced Validation**: Prevents invalid state transitions

## Migration Notes

- Existing quiz creation flows will continue to work
- New `createOrUpdateQuizBasic` endpoint is backward compatible
- Frontend components automatically detect quiz state based on ID presence
- No database migrations required

## Future Enhancements

1. **Auto-save functionality**: Automatically save progress as users type
2. **Version history**: Track changes to quiz content over time
3. **Collaborative editing**: Multiple users editing the same quiz
4. **Draft management**: Better handling of multiple draft versions
5. **Recovery system**: Restore accidentally deleted or corrupted quizzes
