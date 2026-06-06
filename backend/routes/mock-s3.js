const express = require('express');
const fs = require('fs');
const path = require('path');
const config = require('../config');

const router = express.Router();

/**
 * PUT /api/mock-s3/upload/*
 * Accepts direct binary PUT uploads (exactly like S3 presigned PUT URLs)
 */
router.put('/upload/*', (req, res) => {
  const fileKey = req.params[0];
  if (!fileKey) {
    return res.status(400).send('Missing file key');
  }

  const filePath = path.join(config.storage.localUploadDir, fileKey);

  // Ensure user sub-directory exists
  const fileDir = path.dirname(filePath);
  if (!fs.existsSync(fileDir)) {
    fs.mkdirSync(fileDir, { recursive: true });
  }

  const writeStream = fs.createWriteStream(filePath);
  
  req.pipe(writeStream);

  writeStream.on('finish', () => {
    console.log(`Mock S3: Saved file to ${filePath}`);
    res.status(200).send('Uploaded successfully to local mock storage');
  });

  writeStream.on('error', (err) => {
    console.error('Mock S3 Upload Error:', err);
    res.status(500).send('Local upload failed');
  });
});

/**
 * GET /api/mock-s3/download/*
 * Streams files back to the client (exactly like S3 presigned GET URLs)
 */
router.get('/download/*', (req, res) => {
  const fileKey = req.params[0];
  if (!fileKey) {
    return res.status(400).send('Missing file key');
  }

  const filePath = path.join(config.storage.localUploadDir, fileKey);

  if (!fs.existsSync(filePath)) {
    console.log(`Mock S3: File not found for download: ${filePath}`);
    return res.status(404).send('File not found');
  }

  // Force download as attachment
  const filename = req.query.filename || path.basename(filePath);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  
  // Set MIME type if available in query or fall back
  res.setHeader('Content-Type', 'application/octet-stream');

  const readStream = fs.createReadStream(filePath);
  readStream.pipe(res);
});

module.exports = router;
