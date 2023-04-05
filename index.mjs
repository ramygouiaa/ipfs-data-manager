import express from 'express';
import { create } from 'ipfs-http-client';
import { nanoid } from 'nanoid'

const app = express();
const port = process.env.PORT || 4000;
const ipfs = create({ url: "http://127.0.0.1:5001" });

// Middleware to parse request body as text or JSON
app.use(express.text());
app.use(express.json());

// GET endpoint to retrieve data from IPFS by CID
app.get('/data/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const data = await retrieveDataFromIpfs(cid);
    res.json({ data });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error getting data from IPFS!');
  }
});

// POST endpoint to upload data to IPFS and get a CID
app.post('/data', async (req, res) => {
  try {
    const { data } = req.body;
    const cid = await uploadToIpfs(data);
    const id = nanoid(10);
    res.status(201).json({ id, cid });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error uploading data to IPFS');
  }
});

// Error handling middleware
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Process event listeners
process.on('uncaughtException', function(err) {
  console.error('Uncaught Exception:', err.stack);
});

process.on('unhandledRejection', function(reason, promise) {
  console.error('Unhandled Rejection:', reason.stack || reason);
});

// Functions to retrieve and upload data to IPFS
async function retrieveDataFromIpfs(cid) {
  const chunks = [];

  for await (const chunk of ipfs.cat(cid)) {
    chunks.push(chunk);
  }
  const retrievedContent = Buffer.concat(chunks);
  return retrievedContent.toString();
}

async function uploadToIpfs(data) {
  const { cid } = await ipfs.add(data);
  console.log(`Data added with CID: ${cid.toString()}`);
  return cid.toString();
}

// Start the server
app.listen(port, () => {
  console.log(`IPFS Manager Server listening at http://localhost:${port}`);
});