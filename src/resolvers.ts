import AWS from 'aws-sdk';
// @ts-ignore
import { GraphQLUpload } from 'graphql-upload';
import { FileModel } from './models/File';
import { uploadToS3 } from './utils/uploadToS3';
interface FileUpload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => NodeJS.ReadableStream;
}

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export const resolvers = {
  Upload: GraphQLUpload,

  Query: {
    hello: () => 'Hello from server!',
    getFiles: async () => {
      return await FileModel.find().sort({ uploadedAt: -1 });
    },

    getFile: async (_: unknown, { id }: { id: string }) => {
      return await FileModel.findById(id);
    },
  },

  Mutation: {
    uploadFile: async (_: unknown, { file }: { file: Promise<FileUpload> }) => {
      try {
        const fileData = await file;
        const { createReadStream, filename, mimetype } = fileData;

        const stream = createReadStream();
        const chunks: Buffer[] = [];

        for await (const chunk of stream) {
          chunks.push(typeof chunk === 'string' ? Buffer.from(chunk, 'utf-8') : chunk);
        }

        const fileBuffer = Buffer.concat(chunks);

        const uploaded = await uploadToS3(fileBuffer, filename, mimetype);

        const savedFile = await FileModel.create({
          filename,
          mimetype,
          size: fileBuffer.length,
          key: uploaded.key,
          url: uploaded.url,
        });

        return savedFile;
      } catch (e) {
        console.error('[uploadFile ERROR]', e);
        throw new Error('Upload failed');
      }
    },
    deleteFile: async (_: unknown, { id }: { id: string }) => {
      const file = await FileModel.findById(id);
      if (!file) return false;

      await s3
        .deleteObject({
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: file.key,
        })
        .promise();

      await file.deleteOne();

      return true;
    },
  },
};
