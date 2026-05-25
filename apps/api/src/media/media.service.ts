import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

@Injectable()
export class MediaService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private readonly config: ConfigService) {
    const endpoint = config.get('MINIO_ENDPOINT', 'localhost');
    const port = config.get('MINIO_PORT', '9000');
    const useSsl = config.get('MINIO_USE_SSL', 'false') === 'true';

    this.s3 = new S3Client({
      region: 'us-east-1',
      endpoint: `${useSsl ? 'https' : 'http'}://${endpoint}:${port}`,
      credentials: {
        accessKeyId: config.getOrThrow('MINIO_ACCESS_KEY'),
        secretAccessKey: config.getOrThrow('MINIO_SECRET_KEY'),
      },
      forcePathStyle: true,
    });
    this.bucket = config.getOrThrow('MINIO_BUCKET');
    this.publicUrl = config.getOrThrow('MINIO_PUBLIC_URL').replace(/\/$/, '');
  }

  async createPresignedUpload(
    userId: string,
    contentType: string,
  ): Promise<{ uploadUrl: string; objectKey: string; publicUrl: string }> {
    const ext = contentType.split('/')[1] ?? 'bin';
    const objectKey = `users/${userId}/${randomUUID()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: objectKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 600 });

    return {
      uploadUrl,
      objectKey,
      publicUrl: `${this.publicUrl}/${objectKey}`,
    };
  }

  toPublicUrl(objectKey: string): string {
    return `${this.publicUrl}/${objectKey}`;
  }
}
