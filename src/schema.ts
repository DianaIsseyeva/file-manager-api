import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  """
  The Upload scalar is used for file uploads.
  """
  scalar Upload

  """
  Represents the metadata for an uploaded file.
  """
  type FileMetadata {
    _id: ID! # Unique identifier for the file.
    filename: String! # The original name of the file.
    url: String! # URL where the file is stored (e.g., on AWS S3).
    mimetype: String! # The MIME type of the file.
    size: Int! # The size of the file in bytes.
    uploadedAt: String # The date and time when the file was uploaded (in ISO format).
  }

  """
  The root Query type.
  """
  type Query {
    """
    A simple test query.
    """
    hello: String!

    """
    Retrieves a list of all uploaded files.
    """
    getFiles: [FileMetadata!]!

    """
    Retrieves a single file by its ID.
    """
    getFile(id: ID!): FileMetadata
  }

  """
  The root Mutation type.
  """
  type Mutation {
    """
    Uploads a file and returns its metadata.
    """
    uploadFile(file: Upload!): FileMetadata!

    """
    Deletes a file by its ID. Returns true if deletion was successful.
    """
    deleteFile(id: ID!): Boolean!

    """
    Authenticates a user using email and password.
    Returns a LoginResponse containing a JWT token and user information.
    """
    login(email: String!, password: String!): LoginResponse!
  }

  """
  Represents a user in the system.
  """
  type User {
    _id: ID! # Unique identifier of the user.
    email: String! # Email address of the user.
    name: String! # Name of the user.
    # Additional fields can be added here if required.
  }

  """
  The response returned after a successful login.
  Contains the authentication token and user details.
  """
  type LoginResponse {
    token: String! # JWT token to be used for authenticated requests.
    user: User! # Details of the authenticated user.
  }
`;
