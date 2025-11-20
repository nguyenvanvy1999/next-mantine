import { APIError } from 'better-auth/api';
import { auth, prisma } from '@/lib/auth';
import { DEFAULT_CURRENCIES, SUPER_ADMIN_CONFIG } from '@/lib/constants/seed';

export class SeedService {
  async seedCurrencies(): Promise<void> {
    try {
      console.log('🌱 Seeding currencies...');

      for (const currency of DEFAULT_CURRENCIES) {
        await prisma.currency.upsert({
          where: { code: currency.code },
          update: {
            name: currency.name,
            symbol: currency.symbol,
            isActive: currency.isActive,
          },
          create: currency,
        });
      }

      console.log('✅ Currencies seeded successfully');
    } catch (error) {
      console.error('❌ Error seeding currencies:', error);
      throw error;
    }
  }

  async seedSettings(): Promise<void> {
    try {
      console.log('🌱 Seeding settings...');

      console.log('✅ Settings seeded successfully');
    } catch (error) {
      console.error('❌ Error seeding settings:', error);
      throw error;
    }
  }

  async seedSuperAdmin(): Promise<void> {
    try {
      console.log('🌱 Seeding super admin...');

      const existingUser = await prisma.user.findUnique({
        where: { email: SUPER_ADMIN_CONFIG.email },
        include: { accounts: true },
      });

      if (existingUser) {
        console.log('ℹ️  Super admin already exists, updating role...');

        if (existingUser.role !== 'admin') {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              role: 'admin',
              baseCurrencyId: SUPER_ADMIN_CONFIG.baseCurrencyId,
            },
          });
          console.log('✅ Super admin role updated');
        } else {
          console.log('ℹ️  Super admin already has admin role');
        }

        if (existingUser.baseCurrencyId !== SUPER_ADMIN_CONFIG.baseCurrencyId) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { baseCurrencyId: SUPER_ADMIN_CONFIG.baseCurrencyId },
          });
        }

        return;
      }

      await auth.api.signUpEmail({
        body: {
          email: SUPER_ADMIN_CONFIG.email,
          password: SUPER_ADMIN_CONFIG.password,
          name: SUPER_ADMIN_CONFIG.name,
        },
      });

      const user = await prisma.user.findUnique({
        where: { email: SUPER_ADMIN_CONFIG.email },
      });

      if (!user) {
        throw new Error('User created but not found');
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          role: 'admin',
          baseCurrencyId: SUPER_ADMIN_CONFIG.baseCurrencyId,
        },
      });

      console.log(
        `✅ Super admin created successfully: ${SUPER_ADMIN_CONFIG.email}`,
      );
    } catch (error) {
      console.error('❌ Error seeding super admin:', error);

      if (error instanceof APIError) {
        if (error.status === 400 && error.message.includes('already')) {
          console.log('ℹ️  User already exists, updating role...');
          const user = await prisma.user.findUnique({
            where: { email: SUPER_ADMIN_CONFIG.email },
          });

          if (user) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                role: 'admin',
                baseCurrencyId: SUPER_ADMIN_CONFIG.baseCurrencyId,
              },
            });
            console.log('✅ Super admin role updated');
            return;
          }
        }
      }

      throw error;
    }
  }

  async seedAll(): Promise<void> {
    try {
      console.log('🚀 Starting seed process...\n');

      await this.seedCurrencies();
      await this.seedSettings();
      await this.seedSuperAdmin();

      console.log('\n✨ Seed process completed successfully!');
    } catch (error) {
      console.error('\n❌ Seed process failed:', error);
      throw error;
    }
  }
}

export const seedService = new SeedService();
