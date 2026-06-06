const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('../database');
const storage = require('../storage');
const { authenticateToken } = require('./auth');

const router = express.Router();

/**
 * Helper to generate random string tokens
 */
function generateToken(length = 16) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * POST /api/files/upload-request
 * Pre-registers a file and generates a secure S3 upload pre-signed URL
 */
router.post('/upload-request', authenticateToken, async (req, res) => {
  const { filename, fileSize, mimeType, expiryHours, oneTimeDownload, password } = req.body;

  if (!filename || !fileSize) {
    return res.status(400).json({ error: 'Filename and fileSize are required' });
  }

  // Cap expiration at 24 hours, default to 24
  let hours = parseInt(expiryHours) || 24;
  if (hours < 1 || hours > 24) {
    hours = 24;
  }

  try {
    const fileId = crypto.randomUUID ? crypto.randomUUID() : generateToken(16);
    const shareToken = generateToken(20);
    
    // Create S3 folder structure: userId/fileId_filename
    const sanitisedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileKey = `${req.user.id}/${fileId}_${sanitisedFilename}`;

    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

    // Hash password if provided
    let passwordHash = null;
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password, salt);
    }

    // Save to Database as pending
    await db.query(
      `INSERT INTO files (id, user_id, filename, file_key, file_size, mime_type, status, share_token, expires_at, one_time_download, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        fileId,
        req.user.id,
        filename,
        fileKey,
        fileSize,
        mimeType || 'application/octet-stream',
        'pending',
        shareToken,
        expiresAt.toISOString(),
        oneTimeDownload ? 1 : 0, // coerces boolean to int/bit for database drivers
        passwordHash
      ]
    );

    // Generate Upload Presigned URL
    const uploadUrl = await storage.getUploadUrl(fileKey, mimeType);

    res.status(201).json({
      fileId,
      uploadUrl,
      shareToken,
      expiresAt: expiresAt.toISOString()
    });
  } catch (err) {
    console.error('Upload request error:', err);
    res.status(500).json({ error: 'Failed to create upload request' });
  }
});

/**
 * POST /api/files/upload-confirm
 * Marks a file status as active after the client successfully uploads to the presigned URL
 */
router.post('/upload-confirm', authenticateToken, async (req, res) => {
  const { fileId } = req.body;

  if (!fileId) {
    return res.status(400).json({ error: 'FileId is required' });
  }

  try {
    // Verify file belongs to user
    const files = await db.query('SELECT * FROM files WHERE id = $1 AND user_id = $2', [fileId, req.user.id]);
    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'File registration not found' });
    }

    await db.query("UPDATE files SET status = 'active' WHERE id = $1", [fileId]);

    res.json({ message: 'Upload confirmed successfully', fileId });
  } catch (err) {
    console.error('Confirm upload error:', err);
    res.status(500).json({ error: 'Failed to confirm upload' });
  }
});

/**
 * GET /api/files/history
 * Returns the authenticated user's upload history
 */
router.post('/history', authenticateToken, async (req, res) => {
  // Use POST or GET. Usually GET, but we'll use regular route. 
  // Let's create a GET route too just in case, but let's register GET /api/files/history.
  // Wait, let's keep GET /history.
});

// Since the user might call GET /api/files/history, let's write both GET and POST.
router.get('/history', authenticateToken, async (req, res) => {
  try {
    // Find files for user
    const files = await db.query(
      `SELECT id, filename, file_size, mime_type, status, share_token, created_at, expires_at, one_time_download, download_count, password_hash 
       FROM files 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    // Map rows and mark expired files dynamically if current time > expires_at
    const mappedFiles = files.map(file => {
      const isExpired = new Date(file.expires_at) < new Date();
      if (isExpired && file.status === 'active') {
        file.status = 'expired';
      }
      return {
        id: file.id,
        filename: file.filename,
        file_size: file.file_size,
        mime_type: file.mime_type,
        status: file.status,
        share_token: file.share_token,
        created_at: file.created_at,
        expires_at: file.expires_at,
        one_time_download: !!file.one_time_download,
        download_count: file.download_count || 0,
        password_protected: !!file.password_hash
      };
    });

    res.json(mappedFiles);
  } catch (err) {
    console.error('Get history error:', err);
    res.status(500).json({ error: 'Failed to retrieve file history' });
  }
});

/**
 * DELETE /api/files/:id
 * Manually revokes and deletes a file from storage and database
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Check ownership
    const files = await db.query('SELECT * FROM files WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'File not found or unauthorized' });
    }

    const file = files[0];

    // Delete from S3/local storage
    await storage.deleteFile(file.file_key);

    // Delete from database
    await db.query('DELETE FROM files WHERE id = $1', [id]);

    res.json({ message: 'File revoked and deleted successfully' });
  } catch (err) {
    console.error('Delete file error:', err);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

/**
 * GET /api/files/download/:shareToken
 * Public endpoint to retrieve metadata and temporary read URL for a shareable link
 */
router.get('/download/:shareToken', async (req, res) => {
  const { shareToken } = req.params;

  try {
    const files = await db.query('SELECT * FROM files WHERE share_token = $1', [shareToken]);
    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'File link invalid or does not exist' });
    }

    const file = files[0];
    const isExpired = new Date(file.expires_at) < new Date();

    if (file.status !== 'active' || isExpired) {
      // Update DB if not marked expired yet
      if (file.status === 'active') {
        await db.query("UPDATE files SET status = 'expired' WHERE id = $1", [file.id]);
      }
      return res.status(410).json({ error: 'This file link has expired and is no longer available' });
    }

    // Check if the file is password-protected
    const isPasswordProtected = !!file.password_hash;
    if (isPasswordProtected) {
      // Do not return the downloadUrl. Just inform the frontend that a password is required.
      return res.json({
        filename: file.filename,
        fileSize: file.file_size,
        mimeType: file.mime_type,
        expiresAt: file.expires_at,
        passwordProtected: true
      });
    }

    // Otherwise, generate temporary read URL and return it
    const downloadUrl = await storage.getDownloadUrl(file.file_key, file.filename);

    // Update download count
    await db.query('UPDATE files SET download_count = download_count + 1 WHERE id = $1', [file.id]);

    // If one-time download, expire and clean up file from storage
    if (file.one_time_download) {
      await db.query("UPDATE files SET status = 'expired' WHERE id = $1", [file.id]);
      // Remove S3/local object in background after a slight 10s delay to allow browser to finish starting connection
      setTimeout(() => {
        storage.deleteFile(file.file_key).catch(err => console.error('One-time auto-delete failed:', err));
      }, 10000);
    }

    res.json({
      filename: file.filename,
      fileSize: file.file_size,
      mimeType: file.mime_type,
      expiresAt: file.expires_at,
      passwordProtected: false,
      downloadUrl
    });
  } catch (err) {
    console.error('Resolve download error:', err);
    res.status(500).json({ error: 'Failed to process download link' });
  }
});

/**
 * POST /api/files/download/:shareToken/verify
 * Unlocks a password-protected file share and returns the secure download URL
 */
router.post('/download/:shareToken/verify', async (req, res) => {
  const { shareToken } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password is required to unlock this file' });
  }

  try {
    const files = await db.query('SELECT * FROM files WHERE share_token = $1', [shareToken]);
    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'File link invalid or does not exist' });
    }

    const file = files[0];
    const isExpired = new Date(file.expires_at) < new Date();

    if (file.status !== 'active' || isExpired) {
      return res.status(410).json({ error: 'This file link has expired and is no longer available' });
    }

    if (!file.password_hash) {
      return res.status(400).json({ error: 'This file share is not password-protected' });
    }

    // Verify password match
    const isMatch = await bcrypt.compare(password, file.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password. Access denied.' });
    }

    // Generate secure read URL
    const downloadUrl = await storage.getDownloadUrl(file.file_key, file.filename);

    // Update download count
    await db.query('UPDATE files SET download_count = download_count + 1 WHERE id = $1', [file.id]);

    // Handle one-time download
    if (file.one_time_download) {
      await db.query("UPDATE files SET status = 'expired' WHERE id = $1", [file.id]);
      setTimeout(() => {
        storage.deleteFile(file.file_key).catch(err => console.error('One-time verify auto-delete failed:', err));
      }, 10000);
    }

    res.json({
      filename: file.filename,
      fileSize: file.file_size,
      mimeType: file.mime_type,
      expiresAt: file.expires_at,
      downloadUrl
    });
  } catch (err) {
    console.error('Password verification error:', err);
    res.status(500).json({ error: 'Failed to verify password' });
  }
});

module.exports = router;
