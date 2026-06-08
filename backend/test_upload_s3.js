const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const config = require('./config');

async function testUpload() {
  const client = new S3Client({
    region: config.storage.aws.region,
    credentials: {
      accessKeyId: config.storage.aws.accessKeyId,
      secretAccessKey: config.storage.aws.secretAccessKey
    }
  });

  try {
    console.log('Testing S3 upload to bucket:', config.storage.aws.bucketName);
    console.log('Region:', config.storage.aws.region);
    
    const command = new PutObjectCommand({
      Bucket: config.storage.aws.bucketName,
      Key: 'test_permission_check.txt',
      Body: 'Hello World',
      ContentType: 'text/plain'
    });
    
    await client.send(command);
    console.log('SUCCESS: Credentials are valid and have write permission!');
  } catch (err) {
    console.error('ERROR: S3 upload failed!');
    console.error('Code:', err.code || err.$metadata?.httpStatusCode);
    console.error('Message:', err.message);
  }
}

testUpload();
