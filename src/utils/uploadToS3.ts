import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export async function uploadToS3(fileBuffer: Buffer, originalName: string, mimetype: string) {
  const extension = path.extname(originalName);
  const filename = `${uuidv4()}${extension}`;

  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: `uploads/${filename}`,
    Body: fileBuffer,
    ContentType: mimetype,
    ACL: 'public-read',
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
