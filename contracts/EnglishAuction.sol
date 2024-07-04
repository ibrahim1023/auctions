// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract EnglishAuction {
    IERC721 public nft;

    bool public started;
    bool public ended;

    address payable public seller;
    address payable public highestBidder;

    uint256 public nftID;
    uint256 public endAt;
    uint256 public highestBid;

    mapping(address => uint256) bids;

    event Start();
    event Bid(address indexed sender, uint256 amount);
    event Withdraw(address indexed bidder, uint256 amount);
    event End(address winner, uint256 amount);

    constructor(address _nft, uint256 _nftID, uint256 _startingBid) {
        nft = IERC721(_nft);
        nftID = _nftID;
        highestBid = _startingBid;

        seller = payable(msg.sender);
    }

    function start() external {
        require(!started, "started");
        require(msg.sender == seller, "not seller");

        nft.transferFrom(msg.sender, address(this), nftID);

        started = true;
        endAt = block.timestamp + 7 days;

        emit Start();
    }

    function bid() external payable {
        require(started, "!started");
        require(block.timestamp < endAt, "Auction ended!");
        require(msg.value > highestBid, "Incorrect value");

        if (highestBidder != address(0)) {
            bids[highestBidder] += highestBid;
        }

        highestBidder = payable(msg.sender);
        highestBid = msg.value;

        emit Bid(msg.sender, msg.value);
    }

    function withdraw() external {
        uint256 balance = bids[msg.sender];
        bids[msg.sender] = 0;

        payable(msg.sender).transfer(balance);

        emit Withdraw(msg.sender, balance);
    }

    function end() external {
        require(started, "!started");
        require(block.timestamp >= endAt, "not ended");
        require(!ended, "ended");

        ended = true;

        if (highestBidder != address(0)) {
            nft.safeTransferFrom(address(this), highestBidder, nftID);
            seller.transfer(highestBid);
        } else {
            nft.safeTransferFrom(address(this), seller, nftID);
        }

        emit End(highestBidder, highestBid);
    }
}
