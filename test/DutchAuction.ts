import { expect } from "chai";
import { time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import hre from "hardhat";
import { ethers } from "ethers";

describe("Dutch Auction", function () {
  let dutchAuction: any;
  let mockERC721: any;
  let seller: any;
  let buyer: any;
  let startingPrice: any;
  let discountRate: any;
  let nftID: number = 0;
  let oneDay: number = 86400;

  before(async () => {
    startingPrice = ethers.parseEther("10000");
    discountRate = ethers.parseEther("0.005");

    [seller, buyer] = await hre.ethers.getSigners();

    const DutchAuction = await hre.ethers.getContractFactory("DutchAuction");
    const MockERC721 = await hre.ethers.getContractFactory("MockERC721");

    mockERC721 = await MockERC721.deploy();

    dutchAuction = await DutchAuction.deploy(
      startingPrice,
      discountRate,
      mockERC721.target,
      nftID
    );

    await mockERC721.connect(seller).approve(dutchAuction.target, nftID);
  });

  it("Should get the price", async function () {
    const updatedTime = (await time.latest()) + oneDay;
    await time.increaseTo(updatedTime);

    let price = await dutchAuction.getPrice();
    expect(price).to.be.lessThanOrEqual(ethers.parseEther("9568"));
  });

  it("Should buy successfully", async function () {
    const updatedTime = (await time.latest()) + oneDay * 3;
    await time.increaseTo(updatedTime);

    let price = await dutchAuction.getPrice();
    expect(price).to.be.lessThanOrEqual(ethers.parseEther("8272"));

    await expect(
      dutchAuction.connect(buyer).buy({ value: ethers.parseEther("800") })
    ).to.be.revertedWith("ETH < price");

    await dutchAuction.connect(buyer).buy({ value: ethers.parseEther("8300") });
  });
});
