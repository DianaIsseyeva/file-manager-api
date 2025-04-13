import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  scalar Upload

  type FileMetadata {
    filename: String!
    url: String!
    mimetype: String!
    size: Int!
  }

  type Query {
    hello: String!
  }

  type Mutation {
    uploadFile(file: Upload!): FileMetadata!
  }
`;
