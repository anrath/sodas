import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createUser = async (firstName: string, lastName: string, email: string, password: string) => {
    const user = await prisma.user.create({
        data: {
            email,
            password,
            firstName,
            lastName
            
        }
    });
    return user;
};