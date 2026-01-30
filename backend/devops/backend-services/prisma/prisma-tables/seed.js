const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  const u1 = await prisma.user.upsert({
    where: { email: 'alice@test.com' },
    update: {},
    create: {
      email: 'alice@test.com',
      name: 'Alice',
      posts: {
        create: [
          {
            title: 'My first post',
            content: 'Hello World from Docker',
            published: true,
          },
          {
            title: 'Prisma Studio is cool',
            content: 'Visualizing data is easy',
            published: false,
          },
        ],
      },
    },
  });

  const u2 = await prisma.user.upsert({
    where: { email: 'bob@test.com' },
    update: {},
    create: {
      email: 'bob@test.com',
      name: 'Bob',
      posts: {
        create: {
          title: 'I love SQL',
          content: 'But ORMs are faster',
          published: true,
        },
      },
    },
  });

  console.log('Created Users:', { u1, u2 });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });