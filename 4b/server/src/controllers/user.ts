import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * createUser creates a new User object and persists it to the database. Returns it to the user.
 * @param {string} firstName 
 * @param {string} lastName 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<User>} the newly created user object
 */
export const createUser = async (firstName: string, lastName: string, email: string, password: string): Promise<User | boolean> => {
    if (await prisma.user.findUnique({ where: { email } })) {
        return false;
    }

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