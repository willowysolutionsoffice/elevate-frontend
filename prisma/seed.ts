import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up operational data...');
  
  // Clear all operational data
  await prisma.notification.deleteMany({});
  await prisma.jobLead.deleteMany({});
  await prisma.jobOrder.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.receipt.deleteMany({});
  await prisma.invoiceItem.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.admission.deleteMany({});
  await prisma.enquiryActivity.deleteMany({});
  await prisma.followUp.deleteMany({});
  await prisma.callLog.deleteMany({});
  await prisma.enquiry.deleteMany({});
  
  console.log('Operational data cleared.');

  console.log('Seeding master data...');

  // Hash the admin password
  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  // 1. Create roles
  const roles = [
    { name: 'admin', description: 'Administrator with full access' },
    { name: 'executive', description: 'Executive with access to management features' },
    { name: 'telecaller', description: 'Telecaller with access to calling and basic CRM features' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }
  console.log('Roles ensured.');

  // 2. Create default branch
  await prisma.branch.upsert({
    where: { name: 'Main Branch' },
    update: {},
    create: {
      name: 'Main Branch',
      address: 'Default Branch Address',
      phone: '+91 0000000000',
      email: 'admin@elevate.com',
    },
  });
  console.log('Branches ensured.');

  // 3. Ensure Admin User
  const adminId = 'admin-user-id';
  const adminEmail = 'admin@elevate.com';
  
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: 'admin',
    },
    create: {
      id: adminId,
      name: 'Admin User',
      email: adminEmail,
      emailVerified: true,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Ensure Account for Admin
  await prisma.account.upsert({
    where: { id: 'admin-account-id' },
    update: { password: hashedPassword },
    create: {
      id: 'admin-account-id',
      accountId: adminId,
      providerId: 'credential',
      password: hashedPassword,
      userId: adminUser.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });
  console.log(`Admin user ensured: ${adminEmail}`);

  console.log('Clean seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
