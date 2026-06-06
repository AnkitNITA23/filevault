const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const db = require('./database');
const scheduler = require('./scheduler');
const storage = require('./storage');

// Routes
const auth = require('./routes/auth');
const filesRouter = require('./routes/files');
const mockS3Router = require('./routes/mock-s3');

const app = express();

// Configure CORS
app.use(cors({
  origin: '*', // Allow frontend connection
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());

// Initialize Database and Services
async function bootstrap() {
  console.log('FileVault Server Bootstrapping...');
  
  // 1. Database Connection and Schema verification
  await db.initDb();

  // 1.5. Ensure CORS configured on S3 bucket (if AWS mode)
  await storage.ensureBucketCors();
  
  // 2. Start Cleanup Scheduler
  scheduler.startScheduler();

  // 3. Register Routes
  app.use('/api/auth', auth.router);
  app.use('/api/files', filesRouter);
  
  // Register local mock-s3 storage endpoints if running in local mode
  if (config.storage.useLocal) {
    console.log('Registering Local Storage Mock Router (/api/mock-s3)');
    app.use('/api/mock-s3', mockS3Router);
  }

  // Basic API Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      mode: config.database.useLocal ? 'local-fallback' : 'aws-postgres',
      timestamp: new Date().toISOString()
    });
  });

  // Global Error Handler
  app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({ error: 'Internal server error occurred' });
  });

  // Start Express listener
  app.listen(config.PORT, () => {
    console.log(`=======================================================`);
    console.log(`FileVault Server listening on port ${config.PORT}`);
    console.log(`Running in ${config.NODE_ENV.toUpperCase()} mode`);
    console.log(`Operation Mode: ${config.database.useLocal ? 'LOCAL FALLBACK' : 'AWS S3 + POSTGRESQL'}`);
    console.log(`=======================================================`);
  });
}

bootstrap().catch(err => {
  console.error('Fatal error during startup bootstrap:', err);
  process.exit(1);
});
