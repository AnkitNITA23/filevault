const cron = require('node-cron');
const db = require('./database');
const storage = require('./storage');

/**
 * Start background cron scheduler to clean up expired files
 */
function startScheduler() {
  // Runs every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    console.log('Scheduler: Checking for expired files...');
    try {
      const now = new Date().toISOString();
      
      // Get files that have passed their expiration date
      const expiredFiles = await db.query(
        "SELECT id, filename, file_key FROM files WHERE expires_at <= $1",
        [now]
      );

      if (expiredFiles.length === 0) {
        console.log('Scheduler: No expired files found.');
        return;
      }

      console.log(`Scheduler: Found ${expiredFiles.length} expired files to clean up.`);

      for (const file of expiredFiles) {
        try {
          // 1. Delete actual file from S3 / Local storage
          await storage.deleteFile(file.file_key);
          
          // 2. Delete database entry
          await db.query('DELETE FROM files WHERE id = $1', [file.id]);
          
          console.log(`Scheduler: Successfully deleted expired file: ${file.filename} (${file.id})`);
        } catch (fileErr) {
          console.error(`Scheduler: Error cleaning up file ${file.id} (${file.filename}):`, fileErr);
        }
      }
    } catch (err) {
      console.error('Scheduler: Cron task error:', err);
    }
  });

  console.log('Scheduler: Expired files cleanup service started (interval: 5m).');
}

module.exports = {
  startScheduler
};
