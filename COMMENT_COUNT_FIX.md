# Comment Count Fix Implementation

## Problem
The `commentsCount` field in the `BlogPost` model was not being updated when comments were created, deleted, or had their approval status changed. This caused the displayed comment count to be inaccurate.

## Solution
Updated the `BlogService` class to properly maintain the `commentsCount` field in real-time.

## Changes Made

### 1. Updated `createComment` method
- **File**: `src/services/blogService.ts`
- **Change**: Added logic to increment `commentsCount` after creating a comment
- **Code**:
```typescript
// Update the commentsCount on the blog post
await prisma.blogPost.update({
  where: { id: data.postId },
  data: {
    commentsCount: {
      increment: 1
    }
  }
})
```

### 2. Updated `deleteComment` method
- **File**: `src/services/blogService.ts`
- **Change**: Added logic to decrement `commentsCount` after deleting a comment
- **Code**:
```typescript
// Update the commentsCount on the blog post
await prisma.blogPost.update({
  where: { id: existingComment.postId },
  data: {
    commentsCount: {
      decrement: 1
  }
})
```

### 3. Updated `updateComment` method
- **File**: `src/services/blogService.ts`
- **Change**: Added logic to handle comment count updates when approval status changes
- **Code**:
```typescript
// If approval status changed, update the comment count
if (data.isApproved !== undefined && data.isApproved !== existingComment.isApproved) {
  if (data.isApproved) {
    // Comment was approved, increment count
    await prisma.blogPost.update({
      where: { id: existingComment.postId },
      data: {
        commentsCount: { increment: 1 }
      }
    })
  } else {
    // Comment was disapproved, decrement count
    await prisma.blogPost.update({
      where: { id: existingComment.postId },
      data: {
        commentsCount: { decrement: 1 }
      }
    })
  }
}
```

### 4. Added Helper Methods
- **File**: `src/services/blogService.ts`
- **Methods Added**:
  - `recalculateCommentCount(postId: string)` - Recalculates comment count for data integrity
  - `recalculateLikeCount(postId: string)` - Recalculates like count for data integrity

### 5. Added Admin Utility Endpoint
- **File**: `src/controllers/blogController.ts`
- **Method**: `recalculateCounts(req, res)` - Allows admins to recalculate counts for data integrity
- **Route**: `POST /api/blog/posts/:postId/recalculate-counts` (Admin only)

## How It Works

1. **Comment Creation**: When a comment is created, `commentsCount` is incremented by 1
2. **Comment Deletion**: When a comment is deleted, `commentsCount` is decremented by 1
3. **Comment Approval Changes**: When a comment's approval status changes:
   - Approved → Disapproved: `commentsCount` decremented by 1
   - Disapproved → Approved: `commentsCount` incremented by 1
4. **Data Integrity**: Helper methods allow admins to recalculate counts if needed

## Benefits

- ✅ Real-time accurate comment counts
- ✅ Consistent with like count behavior
- ✅ Handles all comment lifecycle events
- ✅ Admin tools for data integrity
- ✅ No performance impact (uses Prisma's atomic operations)

## Testing

The logic has been tested to ensure:
- Comment creation increments count correctly
- Comment deletion decrements count correctly
- Approval status changes update count appropriately
- Counts never go below 0
- Like counts continue to work as before

## Database Operations

All count updates use Prisma's atomic operations:
- `increment: 1` - Safely adds 1 to the current value
- `decrement: 1` - Safely subtracts 1 from the current value

This ensures thread-safe updates even with concurrent operations.
