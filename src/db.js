// Yeh file Prisma Client ko ek baar banake export karti hai
// taaki har jagah same connection use ho, naya connection na bane

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;
