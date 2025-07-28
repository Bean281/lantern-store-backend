import { S3Client } from '@aws-sdk/client-s3';

// Validate required environment variables
const requiredEnvVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_S3_BUCKET_NAME'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  throw new Error(`❌ Missing required AWS environment variables: ${missingVars.join(', ')}\n📝 Please set these in your .env file`);
}

const AWS_REGION = process.env.AWS_REGION || 'ap-southeast-2';
const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

export const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const S3_BUCKET_NAME = AWS_S3_BUCKET_NAME;
export const AWS_BUCKET_REGION = AWS_REGION;

// Helper function to generate correct S3 URL
export const generateS3Url = (key: string): string => {
  return `https://${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;
}; 