const express = require('express');
// const { ethers } = require('ethers');
const { JsonRpcProvider, Wallet, Contract } = require("ethers");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Contract configuration
const CONTRACT_ADDRESS = '0x5fbdb2315678afecb367f032d93f642f64180aa3';
const CONTRACT_ABI = [
    // Replace with your contract's ABI
    {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "fileId",
            "type": "uint256"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "sender",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "receiver",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "content",
            "type": "string"
          }
        ],
        "name": "FileSent",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "fileId",
            "type": "uint256"
          }
        ],
        "name": "getFile",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "fileId",
            "type": "uint256"
          }
        ],
        "name": "getFileDetails",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "ping",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "pure",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "content",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "_receiver",
            "type": "address"
          }
        ],
        "name": "sendFile",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
];

// Configure the provider and signer
const provider = new JsonRpcProvider('http://127.0.0.1:8545');
const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // Replace with a test account private key from Hardhat
const wallet = new Wallet(privateKey, provider);
console.log('Wallet Created! : ' + wallet);

// Contract instance
const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
console.log('Contract Created! : ' + contract); 
// Middleware to parse JSON requests
app.use(express.json());

// Endpoint to send a model
app.get('/ping', async (req, res) => {
  console.log('ping called');
  res.status(200).send({ message: 'Pong!'});
});

app.get('/pingContract', async (req, res) => {
  try {
      const contractResponse = await contract.ping();
      res.status(200).send({ message: 'Contract responsed ' + contractResponse });
  } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Failed to send model\n' + error });
  }
});

app.get('/getCounter', async (req, res) => {
  try {
      const count = await contract.getFileCounter();
      res.status(200).send({ message: 'Files array size ' + count});
  } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Failed to get file sent counter\n' + error });
  }
});

// Endpoint to send a model
app.post('/sendFile', async (req, res) => {
    const { url, receiver } = req.body;
    try {
        const tx = await contract.sendFile(url, receiver);
        await tx.wait();
        res.status(200).send({ message: 'Model sent successfully', txHash: tx.hash });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Failed to send model\n' + error });
    }
});

// Endpoint to get a model
app.get('/getFileDetails/:modelId', async (req, res) => {
    const modelId = req.params.modelId;
    try {
        const [sender, receiver, content] = await contract.getFileDetails(modelId);
        res.status(200).send({ sender, receiver, content});
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Failed to get model\n' + error });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
