// import { PrismaClient } from '@prisma/client';

// export const prisma = new PrismaClient();

import { PrismaClient } from '../../generated/prisma'; // 👈 point directly to generated client
export const prisma = new PrismaClient();