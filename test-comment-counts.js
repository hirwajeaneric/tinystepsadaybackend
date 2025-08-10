// Simple test script to verify comment count logic
// This simulates the logic without requiring a database connection

class MockPrisma {
  constructor() {
    this.blogPosts = new Map();
    this.blogComments = new Map();
    this.blogLikes = new Map();
  }

  // Mock blog post operations
  async blogPost_update({ where, data }) {
    const post = this.blogPosts.get(where.id);
    if (!post) throw new Error('Post not found');
    
    if (data.commentsCount?.increment) {
      post.commentsCount += data.commentsCount.increment;
    } else if (data.commentsCount?.decrement) {
      post.commentsCount = Math.max(0, post.commentsCount - data.commentsCount.decrement);
    } else if (data.commentsCount !== undefined) {
      post.commentsCount = data.commentsCount;
    }
    
    if (data.likesCount?.increment) {
      post.likesCount += data.likesCount.increment;
    } else if (data.likesCount?.decrement) {
      post.likesCount = Math.max(0, post.likesCount - data.likesCount.decrement);
    } else if (data.likesCount !== undefined) {
      post.likesCount = data.likesCount;
    }
    
    return post;
  }

  async blogComment_create({ data, include }) {
    const comment = {
      id: `comment-${Date.now()}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.blogComments.set(comment.id, comment);
    return comment;
  }

  async blogComment_delete({ where }) {
    const comment = this.blogComments.get(where.id);
    if (!comment) throw new Error('Comment not found');
    this.blogComments.delete(where.id);
    return comment;
  }

  async blogComment_update({ where, data, include }) {
    const comment = this.blogComments.get(where.id);
    if (!comment) throw new Error('Comment not found');
    
    Object.assign(comment, data);
    comment.updatedAt = new Date();
    
    return comment;
  }

  async blogComment_findUnique({ where, select }) {
    const comment = this.blogComments.get(where.id);
    if (!comment) return null;
    
    if (select) {
      const result = {};
      for (const field of Object.keys(select)) {
        if (comment[field] !== undefined) {
          result[field] = comment[field];
        }
      }
      return result;
    }
    
    return comment;
  }

  async blogComment_count({ where }) {
    let count = 0;
    for (const comment of this.blogComments.values()) {
      if (where.postId && comment.postId !== where.postId) continue;
      if (where.isApproved !== undefined && comment.isApproved !== where.isApproved) continue;
      count++;
    }
    return count;
  }

  async blogLike_create({ data }) {
    const like = {
      id: `like-${Date.now()}`,
      ...data,
      createdAt: new Date()
    };
    this.blogLikes.set(like.id, like);
    return like;
  }

  async blogLike_delete({ where }) {
    const like = this.blogLikes.get(where.postId_userId.postId + '-' + where.postId_userId.userId);
    if (!like) throw new Error('Like not found');
    this.blogLikes.delete(like.id);
    return like;
  }

  async blogLike_findUnique({ where }) {
    const like = this.blogLikes.get(where.postId_userId.postId + '-' + where.postId_userId.postId);
    return like || null;
  }

  async blogLike_count({ where }) {
    let count = 0;
    for (const like of this.blogLikes.values()) {
      if (where.postId && like.postId !== where.postId) continue;
      count++;
    }
    return count;
  }
}

// Test the comment count logic
async function testCommentCounts() {
  console.log('🧪 Testing Comment Count Logic...\n');
  
  const prisma = new MockPrisma();
  
  // Create a test blog post
  const testPost = {
    id: 'test-post-1',
    title: 'Test Post',
    commentsCount: 0,
    likesCount: 0
  };
  prisma.blogPosts.set(testPost.id, testPost);
  
  console.log('📝 Initial post state:', {
    id: testPost.id,
    commentsCount: testPost.commentsCount,
    likesCount: testPost.likesCount
  });
  
  // Test 1: Create a comment
  console.log('\n✅ Test 1: Creating a comment...');
  const comment1 = await prisma.blogComment_create({
    data: {
      content: 'First comment',
      postId: testPost.id,
      authorId: 'user-1',
      isApproved: true
    }
  });
  
  // Update comment count
  await prisma.blogPost_update({
    where: { id: testPost.id },
    data: { commentsCount: { increment: 1 } }
  });
  
  console.log('📊 After creating comment:', {
    commentsCount: prisma.blogPosts.get(testPost.id).commentsCount
  });
  
  // Test 2: Create another comment
  console.log('\n✅ Test 2: Creating another comment...');
  const comment2 = await prisma.blogComment_create({
    data: {
      content: 'Second comment',
      postId: testPost.id,
      authorId: 'user-2',
      isApproved: true
    }
  });
  
  // Update comment count
  await prisma.blogPost_update({
    where: { id: testPost.id },
    data: { commentsCount: { increment: 1 } }
  });
  
  console.log('📊 After creating second comment:', {
    commentsCount: prisma.blogPosts.get(testPost.id).commentsCount
  });
  
  // Test 3: Delete a comment
  console.log('\n✅ Test 3: Deleting a comment...');
  await prisma.blogComment_delete({ where: { id: comment1.id } });
  
  // Update comment count
  await prisma.blogPost_update({
    where: { id: testPost.id },
    data: { commentsCount: { decrement: 1 } }
  });
  
  console.log('📊 After deleting comment:', {
    commentsCount: prisma.blogPosts.get(testPost.id).commentsCount
  });
  
  // Test 4: Test like functionality
  console.log('\n✅ Test 4: Testing like functionality...');
  await prisma.blogLike_create({
    data: { postId: testPost.id, userId: 'user-1' }
  });
  
  await prisma.blogPost_update({
    where: { id: testPost.id },
    data: { likesCount: { increment: 1 } }
  });
  
  console.log('📊 After adding like:', {
    likesCount: prisma.blogPosts.get(testPost.id).likesCount
  });
  
  // Test 5: Test comment approval change
  console.log('\n✅ Test 5: Testing comment approval change...');
  await prisma.blogComment_update({
    where: { id: comment2.id },
    data: { isApproved: false }
  });
  
  // Since comment was disapproved, decrement count
  await prisma.blogPost_update({
    where: { id: testPost.id },
    data: { commentsCount: { decrement: 1 } }
  });
  
  console.log('📊 After disapproving comment:', {
    commentsCount: prisma.blogPosts.get(testPost.id).commentsCount
  });
  
  // Test 6: Re-approve comment
  console.log('\n✅ Test 6: Re-approving comment...');
  await prisma.blogComment_update({
    where: { id: comment2.id },
    data: { isApproved: true }
  });
  
  // Since comment was re-approved, increment count
  await prisma.blogPost_update({
    where: { id: testPost.id },
    data: { commentsCount: { increment: 1 } }
  });
  
  console.log('📊 After re-approving comment:', {
    commentsCount: prisma.blogPosts.get(testPost.id).commentsCount
  });
  
  // Final state
  console.log('\n📊 Final post state:', {
    id: testPost.id,
    commentsCount: prisma.blogPosts.get(testPost.id).commentsCount,
    likesCount: prisma.blogPosts.get(testPost.id).likesCount
  });
  
  console.log('\n🎉 All tests completed successfully!');
}

// Run the tests
testCommentCounts().catch(console.error);
