const express = require('express');
const { Busboy } = require('busboy');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();

// Health check
app.get('/', (req, res) => {
  res.send('✅ Pandoc Cloud Run is alive!');
});

app.post('/convert', (req, res) => {
  console.log('POST /convert');

  const busboy = new Busboy({ headers: req.headers });
  let uploadPath;

  busboy.on('file', (fieldname, file, filename) => {
    console.log(`Receiving file: ${filename}`);
    uploadPath = `/tmp/${Date.now()}-${filename}`;
    const fstream = fs.createWriteStream(uploadPath);
    file.pipe(fstream);

    fstream.on('close', () => {
      console.log(`Saved to ${uploadPath}`);

      // Run pandoc to extract plain text
      exec(`pandoc "${uploadPath}" -t plain`, (err, stdout, stderr) => {
        if (err) {
          console.error('Pandoc error:', stderr);
          res.status(500).send(stderr);
          return;
        }
        console.log('Conversion complete');
        res.send(stdout);
        // Cleanup
        fs.unlink(uploadPath, () => {});
      });
    });
  });

  busboy.on('error', err => {
    console.error('Busboy error:', err);
    res.status(500).send('File upload failed.');
  });

  req.pipe(busboy);
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});