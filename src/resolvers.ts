import AWS from 'aws-sdk';
import bcrypt from 'bcryptjs';
import GraphQLUpload from 'graphql-upload';
import jwt from 'jsonwebtoken';
import { FileModel } from './models/File';
import { UserModel } from './models/User';
import { uploadToS3 } from './utils/uploadToS3';

/**
 * Interface representing a file upload.
 * Some fields may exist at the top-level or inside the nested `file` object.
 */
interface FileUpload {
  filename?: string;
  mimetype?: string;
  encoding?: string;
  createReadStream?: () => NodeJS.ReadableStream;
  file?: {
    filename?: string;
    mimetype?: string;
    encoding?: string;
    createReadStream?: () => NodeJS.ReadableStream;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export const resolvers = {
  // Export the Upload scalar.
  Upload: GraphQLUpload,

  Query: {
    /**
     * Returns a simple greeting message.
     */
    hello: () => 'Hello from server!',

    /**
     * Retrieves a list of all uploaded files, sorted by upload date in descending order.
     * Transforms the uploadedAt field to an ISO string.
     */
    getFiles: async () => {
      const files = await FileModel.find().sort({ uploadedAt: -1 });
      return files.map(file => {
        const obj = file.toObject();
        return {
          ...obj,
          // Преобразуем uploadedAt в ISO строку, если оно определено.
          uploadedAt: obj.uploadedAt ? new Date(Number(obj.uploadedAt)).toISOString() : undefined,
        };
      });
    },

    /**
     * Retrieves metadata for a single file by its ID.
     * Transforms the uploadedAt field to an ISO string.
     * @param _ - Parent object (unused).
     * @param args - An object containing the file ID.
     * @returns The file metadata or null if not found.
     */
    getFile: async (_: unknown, { id }: { id: string }) => {
      const file = await FileModel.findById(id);
      if (!file) return null;
      const obj = file.toObject();
      return {
        ...obj,
        uploadedAt: obj.uploadedAt ? new Date(Number(obj.uploadedAt)).toISOString() : undefined,
      };
    },
  },

  Mutation: {
    /**
     * Authenticates a user with email and password.
     * Returns a LoginResponse containing a JWT token and user details.
     * @param _ - Parent object (unused).
     * @param args - An object with email and password.
     * @returns An object containing { token, user }.
     * @throws Error if the credentials are invalid.
     */
    login: async (_: unknown, { email, password }: { email: string; password: string }) => {
      const user = await UserModel.findOne({ email });
      if (!user) {
        throw new Error('Invalid credentials');
      }
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        throw new Error('Invalid credentials');
      }
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
      return { token, user };
    },

    /**
     * Uploads a file to AWS S3 and saves its metadata in MongoDB.
     * This mutation is protected and requires an authenticated user.
     * @param _ - Parent object (unused).
     * @param args - An object with a property `file` which is a Promise resolving to FileUpload.
     * @param context - The context containing user information from JWT verification.
     * @returns The metadata of the uploaded file.
     * @throws Error if the user is not authorized or if the upload process fails.
     */
    uploadFile: async (
      _: unknown,
      { file }: { file: Promise<FileUpload> },
      context: { user?: any }
    ) => {
      // Authorization: Ensure the request is made by an authenticated user.
      if (!context.user) {
        throw new Error('Not authorized');
      }
      try {
        const fileData = await file;
        // Determine effective filename: check top-level, then nested.
        const effectiveFilename = fileData.filename ?? fileData.file?.filename;
        if (!effectiveFilename) {
          throw new Error('Filename is not provided');
        }
        // Determine effective mimetype: check top-level, then nested.
        const effectiveMimetype = fileData.mimetype ?? fileData.file?.mimetype;
        if (!effectiveMimetype) {
          throw new Error('Mimetype is required and not provided');
        }
        // Determine the createReadStream function.
        const createStreamFn = fileData.createReadStream ?? fileData.file?.createReadStream;
        if (typeof createStreamFn !== 'function') {
          throw new Error('createReadStream function is not available');
        }
        const stream = createStreamFn();
        const chunks: Buffer[] = [];
        // Read the file stream in chunks.
        for await (const chunk of stream) {
          chunks.push(typeof chunk === 'string' ? Buffer.from(chunk, 'utf-8') : chunk);
        }
        const fileBuffer = Buffer.concat(chunks);
        // Upload the file to AWS S3.
        const uploaded = await uploadToS3(fileBuffer, effectiveFilename, effectiveMimetype);
        // Save file metadata to MongoDB.
        const savedFile = await FileModel.create({
          filename: effectiveFilename,
          mimetype: effectiveMimetype,
          size: fileBuffer.length,
          key: uploaded.key,
          url: uploaded.url,
        });
        return savedFile.toObject();
      } catch (error) {
        console.error('[uploadFile ERROR]', error);
        throw new Error('Upload failed');
      }
    },

    /**
     * Deletes a file by its ID.
     * This mutation is protected and requires an authenticated user.
     * It removes the file from AWS S3 and deletes its metadata from MongoDB.
     * @param _ - Parent object (unused).
     * @param args - An object containing the file ID.
     * @param context - The context containing user information from JWT verification.
     * @returns True if the file was successfully deleted; otherwise, false.
     * @throws Error if the user is not authorized.
     */
    deleteFile: async (_: unknown, { id }: { id: string }, context: { user?: any }) => {
      // Authorization: Ensure the request is made by an authenticated user.
      if (!context.user) {
        throw new Error('Not authorized');
      }
      // Find the file metadata in the database.
      const file = await FileModel.findById(id);
      if (!file) {
        throw new Error('File not found');
      }
      try {
        // Delete the file from AWS S3.
        await s3
          .deleteObject({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: file.key,
          })
          .promise();
        // Delete the file metadata from MongoDB.
        await file.deleteOne();
        return true;
      } catch (error) {
        console.error('[deleteFile ERROR]', error);
        throw new Error('Failed to delete file');
      }
    },
  },
};
