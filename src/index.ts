import { ApolloServer } from 'apollo-server-express';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { typeDefs } from './schema';
dotenv.config();
// @ts-ignore
import { graphqlUploadExpress } from 'graphql-upload';
import { resolvers } from './resolvers';

const PORT = process.env.PORT || 4000;
const app = express();

app.use(graphqlUploadExpress());

const startServer = async () => {
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  await mongoose.connect(process.env.MONGODB_URI!);

  const httpServer = http.createServer(app);
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}${apolloServer.graphqlPath}`);
  });
};

startServer().catch(console.error);
