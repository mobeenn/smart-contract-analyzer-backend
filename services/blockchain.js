const { ethers } = require("ethers");
require("dotenv").config();

// const ABI = ["function storeReport(string _hash) public"];

const ABI = [
   {
      anonymous: false,
      inputs: [
         {
            indexed: true,
            internalType: "address",
            name: "user",
            type: "address",
         },
         {
            indexed: false,
            internalType: "string",
            name: "hash",
            type: "string",
         },
         {
            indexed: false,
            internalType: "uint256",
            name: "timestamp",
            type: "uint256",
         },
      ],
      name: "ReportStored",
      type: "event",
   },
   {
      inputs: [],
      name: "getTotalReports",
      outputs: [
         {
            internalType: "uint256",
            name: "",
            type: "uint256",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "uint256",
            name: "",
            type: "uint256",
         },
      ],
      name: "reports",
      outputs: [
         {
            internalType: "string",
            name: "hash",
            type: "string",
         },
         {
            internalType: "address",
            name: "user",
            type: "address",
         },
         {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "string",
            name: "_hash",
            type: "string",
         },
      ],
      name: "storeReport",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
];
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, ABI, wallet);

async function storeOnBlockchain(hash) {
   const tx = await contract.storeReport(hash);
   const receipt = await tx.wait();

   return receipt.hash; // txHash
}

async function getAllReports() {
   const total = await contract.getTotalReports();

   const reports = [];

   for (let i = 0; i < total; i++) {
      const report = await contract.reports(i);

      reports.push({
         id: i,

         hash: report.hash,

         user: report.user,

         timestamp: Number(report.timestamp),

         date: new Date(Number(report.timestamp) * 1000).toISOString(),
      });
   }

   return reports.reverse();
}

module.exports = { storeOnBlockchain, getAllReports };
