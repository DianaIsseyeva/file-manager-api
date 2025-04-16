import AWS from 'aws-sdk';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

/**
 * Uploads a file to AWS S3 and returns the metadata of the uploaded file.
 *
 * This function generates a unique filename using a UUID, uploads the file to the specified
 * bucket under the `uploads` directory, and returns:
 * - The URL of the uploaded file.
 * - The key under which the file is stored.
 * - The original filename.
 * - The size of the file in bytes.
 * - The MIME type of the file.
 *
 * @param fileBuffer - A Buffer containing the file's data.
 * @param originalName - The original name of the file (used to determine the file extension).
 * @param mimetype - The MIME type of the file (e.g., "image/jpeg").
 * @returns An object containing the file metadata: { url, key, filename, size, mimetype }.
 * @throws If the file upload to S3 fails.
 */
export async function uploadToS3(fileBuffer: Buffer, originalName: string, mimetype: string) {
  const extension = path.extname(originalName);
  const filename = `${uuidv4()}${extension}`;

  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: `uploads/${filename}`,
    Body: fileBuffer,
    ContentType: mimetype,
  };

  const result = await s3.upload(uploadParams).promise();
  return {
    url: result.Location,
    key: result.Key,
    filename: originalName,
    size: fileBuffer.length,
    mimetype,
  };
}
