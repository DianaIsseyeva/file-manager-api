# File Manager Backend

This is the backend for the file management system. It allows users to upload files with image previews, view a list of uploaded files, delete files, and authenticate via JWT. The backend uses GraphQL (Apollo Server), MongoDB (with Typegoose), AWS S3 for file storage, and Node.js with Express.

## Features

- **GraphQL API:**
  - **Queries:**
    - `hello`: Test query.
    - `getFiles`: Returns a list of uploaded files.
    - `getFile(id: ID!)`: Returns metadata for a single file.
  - **Mutations:**
    - `uploadFile(file: Upload!)`: Uploads a file to AWS S3 and saves its metadata in MongoDB.
    - `deleteFile(id: ID!)`: Deletes a file from AWS S3 and removes its metadata.
    - `login(email: String!, password: String!)`: Authenticates a user and returns a JWT token along with user data.
- **AWS S3 Integration:**  
  Files are stored in AWS S3. Policies and IAM permissions must be configured to allow file uploads and deletions.
- **MongoDB Integration:**  
  Files and user data are stored in a MongoDB database using Typegoose models.
- **JWT Authentication:**  
  The `login` mutation authenticates users and returns a JWT which is used for protected operations (file upload, deletion).

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or above recommended)
- [MongoDB](https://www.mongodb.com/) (either local or cloud instance)
- An AWS account with S3 access (or use AWS free tier)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/file-manager-api.git
   cd file-manager-api

2. Install dependencies:
  npm install

3. Create a .env file in the root directory of the project with the following required variables:
   PORT=4000
MONGODB_URI=mongodb://localhost:27017/file-manager
JWT_SECRET=your-secret-key

# AWS configuration
AWS_REGION=your-aws-region
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_BUCKET_NAME=your-bucket-name
Note: Replace placeholders with your actual configuration values. For example, if you are using the AWS free tier, ensure that your S3 bucket policies allow file upload and deletion via your IAM user credentials.

Seed Script
To facilitate local testing, run the seed script to create a test user in your MongoDB. This way, other developers don’t have to manually create a test user.

1. Make sure your .env file includes the following optional variables (or defaults will be used):
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=password123
TEST_USER_NAME=Test User

2. Run the seed script using ts-node:
   npx ts-node src/seed.ts

This script will:
  Connect to your MongoDB instance.
  Check if a user with the given email exists.
  If not, hash the given password and create a new test user.

Running the Server
Start the development server using:
npm run dev

This will launch the server on the port specified in your .env (default is 4000), and the GraphQL API will be available at:
http://localhost:4000/graphql

Testing
To run unit tests (if implemented), use:
npm run test

