const { Pool } = require('pg');
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');

// AWS S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1'
});

// PostgreSQL Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sslmode=require') 
    ? { rejectUnauthorized: false } 
    : false
});

/**
 * AWS Lambda Handler
 * This function should be scheduled using AWS EventBridge Rules (e.g. rate(1 hour))
 */
exports.handler = async (event) => {
  console.log('AWS Lambda Cleanup: Starting scan for expired uploads...');
  
  if (!process.env.DATABASE_URL || !process.env.AWS_S3_BUCKET_NAME) {
    console.error('DATABASE_URL or AWS_S3_BUCKET_NAME is not defined in environment variables.');
    return {
      statusCode: 500,
      body: 'Configuration error: Environment variables missing'
    };
  }

  const now = new Date().toISOString();
  let client;

  try {
    client = await pool.connect();
    
    // Select expired active records
    const expiredRes = await client.query(
      "SELECT id, filename, file_key FROM files WHERE expires_at <= $1",
      [now]
    );

    const expiredFiles = expiredRes.rows;

    if (expiredFiles.length === 0) {
      console.log('AWS Lambda Cleanup: No expired records found.');
      return {
        statusCode: 200,
        body: 'No expired files found.'
      };
    }

    console.log(`AWS Lambda Cleanup: Found ${expiredFiles.length} expired files to delete.`);
    let successCount = 0;

    for (const file of expiredFiles) {
      try {
        // 1. Delete S3 Object
        const deleteCmd = new DeleteObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: file.file_key
        });
        await s3Client.send(deleteCmd);
        console.log(`Deleted S3 Object: ${file.file_key}`);

        // 2. Delete Database Record
        await client.query('DELETE FROM files WHERE id = $1', [file.id]);
        console.log(`Deleted Database Record: ${file.filename} (${file.id})`);
        
        successCount++;
      } catch (fileErr) {
        console.error(`Error deleting file ${file.id}:`, fileErr);
      }
    }

    return {
      statusCode: 200,
      body: `Cleanup complete. Successfully deleted ${successCount} of ${expiredFiles.length} expired files.`
    };
  } catch (err) {
    console.error('Database connection error in Lambda:', err);
    return {
      statusCode: 500,
      body: `Database connection error: ${err.message}`
    };
  } finally {
    if (client) {
      client.release();
    }
  }
};
