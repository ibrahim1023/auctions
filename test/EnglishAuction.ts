import { expect } from "chai";
import { time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import hre from "hardhat";
import { ethers } from "ethers";

describe("EnglishAuction", function () {
  let englishAuction: any;
  let mockERC721: any;
  let seller: any;
  let bidderOne: any;
  let startingBid: any;
  let bidderTwo: any;
  let nftID: number = 0;
  let endedAt: number = 604800;

  before(async () => {
    startingBid = ethers.parseEther("100");

    [seller, bidderOne, bidderTwo] = await hre.ethers.getSigners();

    const EnglishAuction = await hre.ethers.getContractFactory(
      "EnglishAuction"
    );
    const MockERC721 = await hre.ethers.getContractFactory("MockERC721");
    mockERC721 = await MockERC721.deploy();

    englishAuction = await EnglishAuction.deploy(
      mockERC721.target,
      nftID,
      startingBid
    );

    await mockERC721.connect(seller).approve(englishAuction.target, nftID);
    await englishAuction.start();
  });

  it("Should place a bid", async function () {
    await englishAuction
      .connect(bidderOne)
      .bid({ value: ethers.parseEther("105") });
    expect(await englishAuction.highestBidder()).to.equal(bidderOne.address);
    expect(await englishAuction.highestBid()).to.equal(
      ethers.parseEther("105")
    );
  });

  it("Should place a higher bid", async function () {
    await englishAuction
      .connect(bidderTwo)
      .bid({ value: ethers.parseEther("110") });
    expect(await englishAuction.highestBidder()).to.equal(bidderTwo.address);
    expect(await englishAuction.highestBid()).to.equal(
      ethers.parseEther("110")
    );
  });

  it("Should end the auction", async function () {
    const auctionEnded = (await time.latest()) + endedAt;
    await time.increaseTo(auctionEnded);

    await englishAuction.end();
    await expect(await mockERC721.ownerOf(0)).to.be.equal(bidderTwo);
  });
});
