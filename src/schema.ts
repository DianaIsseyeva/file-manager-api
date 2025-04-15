import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  scalar Upload

  type FileMetadata {
    _id: ID!
    filename: String!
    url: String!
    mimetype: String!
    size: Int!
    uploadedAt: String
  }

  type Query {
    hello: String!
    getFiles: [FileMetadata!]!
  }

  type Mutation {
    uploadFile(file: Upload!): FileMetadata!
  }
`;
