import { prisma } from '@/lib/auth';
import { seedService } from '@/lib/services/seed.service';

async function main() {
  try {
    await seedService.seedAll();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
