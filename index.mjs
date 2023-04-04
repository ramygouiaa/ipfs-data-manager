import express from 'express';
import { create } from 'ipfs-http-client';
import { nanoid } from 'nanoid'

// Initialize Express app
const app = express();

const port = process.env.PORT || 4000;

const client = create({ url: "http://127.0.0.1:5001" });

const retrieveDataFromIpfs = async (cid) => {
    const chunks = [];

    for await (const chunk of client.cat(cid)) {
      chunks.push(chunk);
    }
    const retrievedContent = Buffer.concat(chunks);
    //console.log(retrievedContent.toString());
    return retrievedContent.toString();
}

async function uploadToIpfs(data) {
    const { cid } = await client.add(data);
    console.log(`Data added with CID: ${cid.toString()}`);
    return cid.toString();
}

// Add middleware to parse request body as text
app.use(express.text());
app.use(express.json());

// Route to retrieve data from ipfs by CID
app.get('/getdata', async (req, res) => {
  try {
    // Get the birth act hash from the query string
    const cid = req.query.cid;
    console.log(cid);
    // Call the getBirthAct function in the contract with the hash parameter
    const data = await retrieveDataFromIpfs(cid);
    res.json({data});
  } catch (error) {
    console.error(error);
    res.status(500).send('Error getting data from ipfs!');
  }
});

app.post('/uploadToIpfs', async (req, res) => {
  try {
    console.log(req.body);
    const { dataToUpload } = req.body;
    console.log(dataToUpload);
    const cidOfData = await uploadToIpfs(dataToUpload);
    const nanoidId = nanoid(10);
    // Return the CID hash
    res.send({
      docId:nanoidId,
      cid:cidOfData
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error uploading to ipfs');
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

// Start the server
app.listen(port, () => {
  console.log(`Ipfs manager server listening at http://localhost:${port}`);
});

