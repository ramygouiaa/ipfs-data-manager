import express from 'express';
import { create } from 'ipfs-http-client';

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

// Route to retrieve data from ipfs by CID
app.get('/getdata', async (req, res) => {
  try {
    // Get the birth act hash from the query string
    const cid = req.query.cid;
    console.log(cid);
    // Call the getBirthAct function in the contract with the hash parameter
    const data = await retrieveDataFromIpfs(cid);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error getting data from ipfs!');
  }
});

app.post('/uploadToIpfs', async (req, res) => {
  try {
    console.log(req.body);
    const cidOfData = await uploadToIpfs(req.body);
    // Return the CID hash
    res.send(cidOfData);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error uploading to ipfs');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Ipfs manager server listening at http://localhost:${port}`);
});

