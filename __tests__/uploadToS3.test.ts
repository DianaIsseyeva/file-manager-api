import path from 'path';
import { uploadToS3 } from '../src/utils/uploadToS3';

// This is the mock result simulating a successful S3 upload.
const mockResult = {
  Location: 'https://s3.amazonaws.com/testbucket/uploads/fakefilename.jpg',
  Key: 'uploads/fakefilename.jpg',
};

// Mock the AWS SDK S3 class. We override the upload method so that it accepts parameters and returns an object with a promise() method.
jest.mock('aws-sdk', () => {
  const mS3 = {
    upload: jest.fn((params: any) => ({
      promise: () => Promise.resolve(mockResult),
    })),
  };
  return { S3: jest.fn(() => mS3) };
});

describe('uploadToS3', () => {
  it('should upload the file and return correct metadata', async () => {
    // Arrange: Create a buffer with sample file content, the original filename, and MIME type.
    const fileBuffer = Buffer.from('test content');
    const originalName = 'testfile.jpg';
    const mimetype = 'image/jpeg';

    // Act: Call the uploadToS3 function with the test buffer and file details.
    const result = await uploadToS3(fileBuffer, originalName, mimetype);

    // Assert: Verify that the returned metadata matches the expectations.
    expect(result.url).toEqual(mockResult.Location);
    expect(result.key).toEqual(mockResult.Key);
    expect(result.filename).toEqual(originalName);
    expect(result.size).toEqual(fileBuffer.length);
    expect(result.mimetype).toEqual(mimetype);
    expect(path.extname(originalName)).toEqual('.jpg');
  });
});
