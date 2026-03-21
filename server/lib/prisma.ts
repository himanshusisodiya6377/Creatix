import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js'

const connectionString = `${process.env.DATABASE_URL}`

if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

console.log('Connecting to database:', connectionString.split('@')[1]?.split('/')[1] || 'unknown');

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

// Test the connection
prisma.$connect().then(() => {
  console.log('✅ Prisma connected to database');
}).catch((error) => {
  console.error('❌ Prisma connection failed:', error);
  process.exit(1);
});

export default prisma;