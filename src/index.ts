import { ApolloServer } from 'apollo-server-express';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { resolvers } from './resolvers';
import { typeDefs } from './schema';

dotenv.config();

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const app = express();

// Middleware для обработки загрузок файлов
// @ts-ignore
import { graphqlUploadExpress } from 'graphql-upload';
app.use(graphqlUploadExpress());

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  /**
   * The context function retrieves the Authorization header from the request,
   * verifies the JWT token, and adds user information to the context if the token is valid.
   */
  context: ({ req }) => {
    const authHeader = req.headers.authorization || '';
    // Expect header format: "Bearer <token>"
    const token = authHeader.split('Bearer ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return { user: decoded };
      } catch (error) {
        console.error('Invalid or expired token:', error);
        // При неверном токене можно не добавлять user или выбрасывать ошибку
      }
    }
    return {}; // no user in context if no token
  },
});

const startServer = async () => {
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });
  await mongoose.connect(process.env.MONGODB_URI!);
  const httpServer = http.createServer(app);
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}${apolloServer.graphqlPath}`);
  });
};

startServer().catch(console.error);
