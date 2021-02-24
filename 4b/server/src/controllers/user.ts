import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * createUser creates a new User object and persists it to the database. Returns the created user.
 * @param {string} firstName the user's first name
 * @param {string} lastName the user's last name
 * @param {string} email user's email address
 * @param {string} password unhashed password
 * @returns {Promise<User>} the newly created user object
 */
export const createUser = async (firstName: string, lastName: string, email: string, password: string): Promise<User | boolean> => {
  const foundUser = await prisma.user.findUnique({
    where: { email }
  });

  if (foundUser) {
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
