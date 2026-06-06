const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from root directory .env file if it exists
dotenv.config({ path: path.join(__dirname, '../.env') });

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const JWT_SECRET = process.env.JWT_SECRET || 'filevault_fallback_secret_key';

// AWS S3
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

// PostgreSQL URL
const DATABASE_URL = process.env.DATABASE_URL;

// Determine if we should use local fallback mode
const forceLocalFallback = process.env.FORCE_LOCAL_FALLBACK === 'true';
const hasAwsCredentials = !!(AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY && AWS_S3_BUCKET_NAME);
const hasPostgres = !!DATABASE_URL;

const useLocalMode = forceLocalFallback || !hasAwsCredentials || !hasPostgres;

module.exports = {
  PORT,
  NODE_ENV,
  JWT_SECRET,
  database: {
    useLocal: useLocalMode,
    postgresUrl: DATABASE_URL,
    sqlitePath: path.join(__dirname, 'filevault.db')
  },
  storage: {
    useLocal: useLocalMode,
    aws: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
      region: AWS_REGION,
      bucketName: AWS_S3_BUCKET_NAME
    },
    localUploadDir: path.join(__dirname, 'uploads')
  }
};
