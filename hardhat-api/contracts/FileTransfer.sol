// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FileTransfer {
    struct File {
        address sender;
        address receiver;
        string content;
    }

    mapping(uint256 => File) private files;
    uint256 public fileCounter;

    event FileSent(uint256 fileId, address indexed sender, address indexed receiver, string content);

    function sendFile(string memory content, address _receiver) public {
        fileCounter++;
        files[fileCounter] = File(msg.sender, _receiver, content);
        emit FileSent(fileCounter, msg.sender, _receiver, content);
    }

    function getFile(uint256 fileId) public view returns (string memory) {
        File memory file = files[fileId];
        require(msg.sender == file.receiver, "Only the specified receiver can access the file.");
        return file.content;
    }

    function getFileDetails(uint256 fileId) public view returns (address, address, string memory) {
        File memory file = files[fileId];
        return (file.sender, file.receiver, file.content);
    }

    function ping() public pure returns (string memory) {
        return "Pong Reset";
    }

    function getFileCounter() public view returns (uint256) {
        return fileCounter;
    }   
}
