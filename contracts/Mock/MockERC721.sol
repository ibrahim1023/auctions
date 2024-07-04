// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockERC721 is ERC721, Ownable {
    uint256 private _tokenIdCounter;

    constructor() ERC721("MockERC721", "M721") Ownable(msg.sender) {
        // Mint an NFT to the deployer of the contract
        _safeMint(msg.sender, _tokenIdCounter);
        _tokenIdCounter++;
    }

    function safeMint(address to) public onlyOwner {
        _safeMint(to, _tokenIdCounter);
        _tokenIdCounter++;
    }
}
