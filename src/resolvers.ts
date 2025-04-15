// @ts-ignore
import { graphqlUploadExpress } from 'graphql-upload';
import { uploadToS3 } from './utils/uploadToS3';

interface FileUpload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => NodeJS.ReadableStream;
}

export const resolvers = {
  Upload: graphqlUploadExpress,

  Query: {
    hello: () => 'Hello from server!',
  },

  Mutation: {
    uploadFile: async (_: unknown, { file }: { file: Promise<FileUpload> }) => {
      const { createReadStream, filename, mimetype } = await file;

      const stream = createReadStream();
      const chunks: Buffer[] = [];

      for await (const chunk of stream) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk, 'utf-8') : chunk);
      }

      const fileBuffer = Buffer.concat(chunks);

      // Отправка в S3
      const uploaded = await uploadToS3(fileBuffer, filename, mimetype);

      return uploaded;
    },
  },
};
