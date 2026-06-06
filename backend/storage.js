const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, PutBucketCorsCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const fs = require('fs');
const path = require('path');
const config = require('./config');

const isLocal = config.storage.useLocal;
let s3Client = null;

if (!isLocal) {
  console.log('Storage Client: Using AWS S3 (Production Mode)');
  s3Client = new S3Client({
    region: config.storage.aws.region,
    credentials: {
      accessKeyId: config.storage.aws.accessKeyId,
      secretAccessKey: config.storage.aws.secretAccessKey
    }
  });
} else {
  console.log(`Storage Client: Using Local Folder fallback at ${config.storage.localUploadDir} (Local Mode)`);
  // Ensure the local uploads directory exists
  if (!fs.existsSync(config.storage.localUploadDir)) {
    fs.mkdirSync(config.storage.localUploadDir, { recursive: true });
  }
}

/**
 * Generate a pre-signed URL for uploading a file
 * @param {string} fileKey Unique key for the file in storage
 * @param {string} mimeType MIME type of the file
 * @returns {Promise<string>} The pre-signed upload URL
 */
async function getUploadUrl(fileKey, mimeType) {
  if (!isLocal) {
    const command = new PutObjectCommand({
      Bucket: config.storage.aws.bucketName,
      Key: fileKey,
      ContentType: mimeType
    });
    // Link expires in 15 minutes for uploading
    return getSignedUrl(s3Client, command, { expiresIn: 900 });
  } else {
    // Return mock upload link pointing back to local server
    return `http://localhost:${config.PORT}/api/mock-s3/upload/${fileKey}`;
  }
}

/**
 * Generate a temporary URL for downloading a file
 * @param {string} fileKey Unique key for the file in storage
 * @param {string} filename The original name of the file for Content-Disposition header
 * @returns {Promise<string>} The temporary download URL
 */
async function getDownloadUrl(fileKey, filename) {
  if (!isLocal) {
    const command = new GetObjectCommand({
      Bucket: config.storage.aws.bucketName,
      Key: fileKey,
      ResponseContentDisposition: `attachment; filename="${filename}"`
    });
    // Link expires in 60 minutes for downloading
    return getSignedUrl(s3Client, command, { expiresIn: 3600 });
  } else {
    // Return mock download link pointing back to local server
    return `http://localhost:${config.PORT}/api/mock-s3/download/${fileKey}?filename=${encodeURIComponent(filename)}`;
  }
}

/**
 * Delete a file from storage
 * @param {string} fileKey Unique key for the file in storage
 */
async function deleteFile(fileKey) {
  if (!isLocal) {
    const command = new DeleteObjectCommand({
      Bucket: config.storage.aws.bucketName,
      Key: fileKey
    });
    await s3Client.send(command);
    console.log(`Deleted file from S3 bucket: ${fileKey}`);
  } else {
    const filePath = path.join(config.storage.localUploadDir, fileKey);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted file from local storage: ${filePath}`);
    } else {
      console.log(`File not found in local storage for deletion: ${filePath}`);
    }
  }
}

/**
 * Try to automatically apply CORS configuration on the S3 bucket.
 * Prints manual steps in console logs if access is denied or another error occurs.
 */
async function ensureBucketCors() {
  if (isLocal) return;
  try {
    const command = new PutBucketCorsCommand({
      Bucket: config.storage.aws.bucketName,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ['*'],
            AllowedMethods: ['PUT', 'POST', 'GET', 'DELETE', 'HEAD'],
            AllowedOrigins: ['http://localhost:5173'],
            ExposeHeaders: ['ETag'],
            MaxAgeSeconds: 3000
          }
        ]
      }
    });
    await s3Client.send(command);
    console.log('AWS S3: Verified and applied CORS configuration on bucket.');
  } catch (err) {
    console.warn('\n======================================================================');
    console.warn('⚠️  S3 CORS CONFIGURATION WARNING');
    console.warn('======================================================================');
    console.warn(`Could not automatically apply CORS configuration to S3 bucket "${config.storage.aws.bucketName}".`);
    console.warn(`Reason: ${err.message}`);
    console.warn('\nTo resolve "Network connection lost during secure upload stream" errors in the browser,');
    console.warn('please manually configure CORS on your S3 bucket in the AWS Console:');
    console.warn('\n1. Open the AWS Console -> S3 -> click your bucket ("' + config.storage.aws.bucketName + '").');
    console.warn('2. Go to the "Permissions" tab.');
    console.warn('3. Scroll to "Cross-origin resource sharing (CORS)" and click "Edit".');
    console.warn('4. Paste this configuration:');
    console.warn(JSON.stringify([
      {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["PUT", "POST", "GET", "DELETE", "HEAD"],
        "AllowedOrigins": ["http://localhost:5173"],
        "ExposeHeaders": ["ETag"],
        "MaxAgeSeconds": 3000
      }
    ], null, 2));
    console.warn('======================================================================\n');
  }
}

module.exports = {
  getUploadUrl,
  getDownloadUrl,
  deleteFile,
  ensureBucketCors,
  isLocal
};
