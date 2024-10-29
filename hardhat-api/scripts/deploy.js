const hre = require("hardhat");

async function main() {
  const FileTransferContract = await hre.ethers.getContractFactory("FileTransfer");
  const FileTransferInstance = await FileTransferContract.deploy();
  //   I don't think this method exists 
  //   await FileTransferInstance.deployed();

  console.log("FileTransfer deployed to:", FileTransferInstance.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
