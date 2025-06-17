const express = require('express');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();

// Accept raw binary for any type — limit size as needed
app.use('/convert', express.raw({ type: '*/*', limit: '50mb' }));

// Health check
app.get('/', (req, res) => {
  res.send('✅ Pandoc RAW Body Server is alive!');
});

// Raw binary upload & pandoc
app.post('/convert', (req, res) => {
  console.log('POST /convert called');

  if (!req.body || !Buffer.isBuffer(req.body)) {
    console.warn('No binary body found!');
    return res.status(400).send('No binary data received.');
  }

  const uploadPath = `/tmp/${Date.now()}.docx`;
  console.log(`Saving raw body to: ${uploadPath} (${req.body.length} bytes)`);

  fs.writeFile(uploadPath, req.body, (err) => {
    if (err) {
      console.error('Error saving file:', err);
      return res.status(500).send('Error saving uploaded file.');
    }

    console.log('File saved, running pandoc...');
    exec(`pandoc "${uploadPath}" -t plain`, (err, stdout, stderr) => {
      if (err) {
        console.error('Pandoc conversion error:', stderr);
        return res.status(500).send(`Pandoc error: ${stderr}`);
      }

      console.log('Pandoc conversion done, sending result...');
      res.send(stdout);

      fs.unlink(uploadPath, (unlinkErr) => {
        if (unlinkErr) {
          console.error('Cleanup error:', unlinkErr);
        } else {
          console.log(`Temp file cleaned up: ${uploadPath}`);
        }
      });
    });
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ RAW Body Server listening on port ${PORT}`));