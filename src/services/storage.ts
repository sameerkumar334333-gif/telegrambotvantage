import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { config } from '../config';

const s3Client = new S3Client({
  endpoint: config.supabaseS3Endpoint,
  region: 'us-east-1', // Supabase uses us-east-1
  credentials: {
    accessKeyId: config.supabaseS3AccessKey,
    secretAccessKey: config.supabaseS3SecretKey,
  },
  forcePathStyle: true, // Required for Supabase
});

const BUCKET_NAME = config.supabaseS3Bucket;
const SUPABASE_URL = config.supabaseUrl;

export interface UploadResult {
  imageUrl: string;
  fileName: string;
}

/**
 * Downloads an image from a URL and uploads it to Supabase Storage
 */
export async function uploadImageToSupabase(
  imageUrl: string,
  fileExtension: string = 'jpg'
): Promise<UploadResult> {
  // Download the image from Telegram
  const response = await axios.get(imageUrl, {
    responseType: 'arraybuffer',
  });

  const imageBuffer = Buffer.from(response.data);
  const fileName = `${uuidv4()}.${fileExtension}`;
  const key = `screenshots/${fileName}`;

  // Upload to Supabase Storage
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: imageBuffer,
    ContentType: `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`,
    ACL: 'public-read', // Make the file publicly accessible
  });

  await s3Client.send(command);

  // Construct the public URL
  // Supabase Storage public URL format: https://[project-ref].supabase.co/storage/v1/object/public/[bucket]/[path]
  if (!SUPABASE_URL) {
    throw new Error('SUPABASE_URL is not set');
  }
  const imageUrl_public = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${key}`;

  return {
    imageUrl: imageUrl_public,
    fileName,
  };
}

