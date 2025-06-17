const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();

// Enable file upload middleware
app.use(fileUpload());

// Health check
app.get('/', (req, res) => {
  console.log('Health check hit');
  res.send('✅ Pandoc Cloud Run is alive!');
});

app.post('/convert', (req, res) => {
  console.log('POST /convert called');

  if (!req.files || !req.files.file) {
    console.warn('No file uploaded in request');
    return res.status(400).send('No file uploaded.');
  }

  const file = req.files.file;
  const uploadPath = `/tmp/${Date.now()}-${file.name}`;
  console.log(`Incoming file: ${file.name} (${file.size} bytes)`);
  console.log(`Saving to: ${uploadPath}`);

  // Save uploaded file to /tmp
  file.mv(uploadPath, err => {
    if (err) {
      console.error('Error saving file:', err);
      return res.status(500).send('Failed to save file.');
    }

    console.log('File saved, starting pandoc conversion...');

    // Run pandoc
    exec(`pandoc "${uploadPath}" -t plain`, (err, stdout, stderr) => {
      if (err) {
        console.error('Pandoc conversion error:', stderr);
        return res.status(500).send(`Pandoc error: ${stderr}`);
      }

      console.log('Pandoc conversion done, sending response...');
      res.send(stdout);

      // Clean up temp file
      fs.unlink(uploadPath, unlinkErr => {
        if (unlinkErr) {
          console.error('Error deleting temp file:', unlinkErr);
        } else {
          console.log(`Cleaned up temp file: ${uploadPath}`);
        }
      });
    });
  });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Pandoc server listening on port ${PORT}`);
});