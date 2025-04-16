import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../src/models/User';
import { resolvers } from '../src/resolvers';

/**
 * A dummy user object used for testing the login resolver.
 * Note: the 'password' field here should represent a hashed password.
 */
const dummyUser = {
  _id: 'user123',
  email: 'test@example.com',
  password: 'hashedpassword', // This is a hashed password for testing purposes.
  name: 'Test User',
};

describe('Resolvers - login', () => {
  beforeEach(() => {
    // Reset all mocks before each test.
    jest.resetAllMocks();
  });

  it('should return token and user for valid credentials', async () => {
    // Mock UserModel.findOne to return our dummyUser.
    jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(dummyUser as any);

    // Mock bcrypt.compare to simulate a correct password.
    const compareMock = jest.spyOn(bcrypt, 'compare') as jest.Mock;
    compareMock.mockResolvedValueOnce(true);

    // Mock jwt.sign to return a dummy token.
    const signMock = jest.spyOn(jwt, 'sign') as jest.Mock;
    signMock.mockReturnValue('dummy-token');

    // Act: Call the login resolver with valid credentials.
    const result = await resolvers.Mutation.login(null, {
      email: dummyUser.email,
      password: 'password123',
    });

    // Assert: The result should match the expected token and user.
    expect(result).toEqual({
      token: 'dummy-token',
      user: dummyUser,
    });
  });

  it('should throw error for invalid credentials when user is not found', async () => {
    // Mock UserModel.findOne to return null, simulating a non-existent user.
    jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(null as any);

    // Act & Assert: Expect the login resolver to throw an error.
    await expect(
      resolvers.Mutation.login(null, {
        email: 'nonexistent@example.com',
        password: 'password123',
      })
    ).rejects.toThrow('Invalid credentials');
  });

  it('should throw error for invalid credentials when password is incorrect', async () => {
    // Mock UserModel.findOne to return the dummy user.
    jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(dummyUser as any);

    // Mock bcrypt.compare to return false, simulating an incorrect password.
    const compareMock = jest.spyOn(bcrypt, 'compare') as jest.Mock;
    compareMock.mockResolvedValueOnce(false);

    // Act & Assert: Expect the login resolver to throw an error.
    await expect(
      resolvers.Mutation.login(null, {
        email: dummyUser.email,
        password: 'wrongpassword',
      })
    ).rejects.toThrow('Invalid credentials');
  });
});
