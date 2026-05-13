import { db } from '../config/database';
import { users, posts, comments } from '../db/schema';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Insert sample users
    const [user1, user2] = await db
      .insert(users)
      .values([
        {
          email: 'john.doe@example.com',
          username: 'johndoe',
          password: '$2a$10$examplehashedpassword',
          firstName: 'John',
          lastName: 'Doe',
          role: 'admin',
        },
        {
          email: 'jane.smith@example.com',
          username: 'janesmith',
          password: '$2a$10$examplehashedpassword',
          firstName: 'Jane',
          lastName: 'Smith',
          role: 'user',
        },
      ])
      .returning()
      .execute();

    console.log('✅ Inserted 2 users');

    // Insert sample posts
    const [post1, post2] = await db
      .insert(posts)
      .values([
        {
          title: 'Getting Started with ElysiaJS',
          content: 'ElysiaJS is a fast and lightweight web framework for Bun...',
          authorId: user1.id,
          status: 'published',
          publishedAt: new Date(),
        },
        {
          title: 'Drizzle ORM Tutorial',
          content: 'Drizzle ORM is a type-safe ORM for TypeScript...',
          authorId: user2.id,
          status: 'draft',
        },
      ])
      .returning()
      .execute();

    console.log('✅ Inserted 2 posts');

    // Insert sample comments
    await db.insert(comments).values([
      {
        content: 'Great article! Very helpful.',
        postId: post1.id,
        authorId: user2.id,
      },
      {
        content: 'I have a question about the setup.',
        postId: post1.id,
        authorId: user2.id,
      },
      {
        content: 'Thanks for sharing this tutorial.',
        postId: post2.id,
        authorId: user1.id,
      },
    ]).execute();

    console.log('✅ Inserted 3 comments');

    console.log('🌱 Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seed();
