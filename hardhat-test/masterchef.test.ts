import {ethers} from "hardhat";
import { ERC20Mock, ERC20Mock__factory, MasterChef, MasterChef__factory, WETH, WETH__factory } from "../typechain-types";
import {expect} from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { LogDescription } from "ethers/lib/utils";
import * as helpers from "./helpers";
import { BigNumber } from "ethers";

describe("\x1b[33mMasterChef tests\x1b[0m\n", () => {
    const beforeTest = "\t";
    const colorGreen = "\x1b[32m";
    const colorBlue = "\x1b[36m";
    const colorReset = "\x1b[0m";

    const zeroAddress = "0x0000000000000000000000000000000000000000";
    const someAddress = "0xcafecafecafecafecafecafecafecafecafecafe";
    let provider: any;

    let owner: SignerWithAddress;
    let someAccount: SignerWithAddress;

    let weth: WETH;
    let masterChef: MasterChef;
    let lp: ERC20Mock;
    
    beforeEach(async () => {
        provider = ethers.provider;

        [ owner, someAccount ] = await ethers.getSigners();

        weth = await (await new WETH__factory(owner).deploy()).deployed();

        const blockNumBefore = await ethers.provider.getBlockNumber();
        const blockBefore = await ethers.provider.getBlock(blockNumBefore);
        const timestampBefore = blockBefore.timestamp;

        masterChef = await (await new MasterChef__factory(owner).deploy(weth.address, ethers.utils.parseEther("0.0001"), timestampBefore)).deployed();
        await weth.setMinter(masterChef.address);

        lp = await (await new ERC20Mock__factory(owner).deploy("LP", "LP", ethers.utils.parseEther("1000"))).deployed();
    });

    it("setWULX per second\n", async () => {
        await expect(masterChef.connect(someAccount).setwULXPerSecond(ethers.utils.parseEther("2"))).revertedWith("Ownable: caller is not the owner");
        await expect(masterChef.connect(owner).setwULXPerSecond(ethers.utils.parseEther("2"))).revertedWith("setwULXPerSecond: too many wULXs!");
        const newPerSecond = ethers.utils.parseEther("0.1");
        await masterChef.connect(owner).setwULXPerSecond(newPerSecond);
        expect(newPerSecond).equals(await masterChef.wULXPerSecond());
    });

    it("add lp token to pools\n", async () => {
        await expect(masterChef.connect(someAccount).add(100, lp.address)).revertedWith("Ownable: caller is not the owner");
        await expect(masterChef.connect(owner).add(ethers.utils.parseEther("1"), lp.address)).revertedWith("add: too many alloc points!!");

        await masterChef.connect(owner).add(100, lp.address);

        await expect(masterChef.connect(owner).add(100, lp.address)).revertedWith("add: pool already exists!!!!");
        expect(1).equals(await masterChef.poolLength());
    });

    it("add load of lp tokens to pools\n", async () => {
        const tokensCount = 10;
        for(let i: number = 0; i < tokensCount; i++) {
            const tokenLp = await (await new ERC20Mock__factory(owner).deploy("LP", "LP", ethers.utils.parseEther("100"))).deployed();
            await masterChef.connect(owner).add(100, tokenLp.address);
        }

        expect(tokensCount).equals(await masterChef.poolLength());
    });

    it("set lp token's alloc point\n", async () => {
        await masterChef.connect(owner).add(100, lp.address);

        await expect(masterChef.connect(someAccount).set(0, ethers.utils.parseEther("1"))).revertedWith("Ownable: caller is not the owner");
        await expect(masterChef.connect(owner).set(0, ethers.utils.parseEther("1"))).revertedWith("add: too many alloc points!!");

        await masterChef.connect(owner).set(0, 200);

        await expect(masterChef.connect(owner).add(200, lp.address)).revertedWith("add: pool already exists!!!!");
        expect(1).equals(await masterChef.poolLength());
    });

    it("get multip[lier between blocks\n", async () => {
        expect(0).equals(await masterChef.connect(owner).getMultiplier(Date.now(), Date.now()));
        expect(20).equals(await masterChef.connect(owner).getMultiplier(Date.now(), Date.now() + 20));
    });

    it("deposit\n", async () => {
        await masterChef.connect(owner).add(100, lp.address);

        const transferAmount = ethers.utils.parseEther("10");
        await lp.connect(owner).transfer(someAccount.address, transferAmount);
        await lp.connect(someAccount).approve(masterChef.address, transferAmount)
        const log1 = await masterChef.connect(someAccount).deposit(0, transferAmount);
        await helpers.advanceTimeAndBlock(100);
        const log2 = await masterChef.updatePool(0);

        let time1 = await helpers.timestamp(log1.blockNumber)
        let time2 = await helpers.timestamp(log2.blockNumber)

        let expected = (await masterChef.wULXPerSecond()).mul(time2 - time1)
        expect(expected).equals(await weth.balanceOf(masterChef.address))
        expect(expected).equals(await masterChef.connect(someAccount).pendingwULX(0, someAccount.address))
    }); 

    it("deposit and instant withdraw\n", async () => {
        await masterChef.connect(owner).add(100, lp.address);

        const transferAmount = ethers.utils.parseEther("10");
        await lp.connect(owner).transfer(someAccount.address, transferAmount);
        await lp.connect(someAccount).approve(masterChef.address, transferAmount)
        
        const log1 = await masterChef.connect(someAccount).deposit(0, transferAmount);
        const log2 = await masterChef.connect(someAccount).withdraw(0, transferAmount);

        const time1 = await helpers.timestamp(log1.blockNumber)
        const time2 = await helpers.timestamp(log2.blockNumber)

        const expectedWithdraw = (await masterChef.wULXPerSecond()).mul(time2 - time1);
        expect(expectedWithdraw).equals(await weth.balanceOf(someAccount.address));
    }); 

    it("deposit and withdraw after waiting 1 sec\n", async () => {
        await masterChef.connect(owner).add(100, lp.address);

        const transferAmount = ethers.utils.parseEther("10");
        await lp.connect(owner).transfer(someAccount.address, transferAmount);
        await lp.connect(someAccount).approve(masterChef.address, transferAmount)
        const log1 = await masterChef.connect(someAccount).deposit(0, transferAmount);
        await helpers.advanceTimeAndBlock(100);
        const log2 = await masterChef.updatePool(0);

        const time1 = await helpers.timestamp(log1.blockNumber)
        const time2 = await helpers.timestamp(log2.blockNumber)

        const expected = (await masterChef.wULXPerSecond()).mul(time2 - time1)
        expect(expected).equals(await weth.balanceOf(masterChef.address))
        expect(expected).equals(await masterChef.connect(someAccount).pendingwULX(0, someAccount.address))
    
        const log3 = await masterChef.connect(someAccount).withdraw(0, transferAmount);
        await helpers.advanceTimeAndBlock(100);
        const log4 = await masterChef.updatePool(0);

        const time3 = await helpers.timestamp(log3.blockNumber)
        const time4 = await helpers.timestamp(log4.blockNumber)
  
        const expectedWithdraw = (await masterChef.wULXPerSecond()).mul(time4 - time3).add(await masterChef.wULXPerSecond());
        expect(expectedWithdraw).equals(await weth.balanceOf(someAccount.address));
    }); 

    it("deposit and emergency withdraw\n", async () => {
        await masterChef.connect(owner).add(100, lp.address);

        const transferAmount = ethers.utils.parseEther("10");
        await lp.connect(owner).transfer(someAccount.address, transferAmount);
        await lp.connect(someAccount).approve(masterChef.address, transferAmount)
        
        await masterChef.connect(someAccount).deposit(0, transferAmount);
        await masterChef.connect(someAccount).emergencyWithdraw(0);

        expect(transferAmount).equals(await lp.balanceOf(someAccount.address));
        expect(0).equals(await weth.balanceOf(someAccount.address));
    }); 

    it("two deposits and harvest all\n", async () => {
        await masterChef.connect(owner).add(100, lp.address);

        const tokenLp = await (await new ERC20Mock__factory(owner).deploy("LP", "LP", ethers.utils.parseEther("100"))).deployed();
        await masterChef.connect(owner).add(100, tokenLp.address);

        const transferAmount = ethers.utils.parseEther("10");
        await lp.connect(owner).transfer(someAccount.address, transferAmount);
        await lp.connect(someAccount).approve(masterChef.address, transferAmount)
        await tokenLp.connect(owner).transfer(someAccount.address, transferAmount);
        await tokenLp.connect(someAccount).approve(masterChef.address, transferAmount)
        await masterChef.connect(someAccount).deposit(0, transferAmount);    
        const log1 = await masterChef.connect(someAccount).deposit(1, transferAmount);
        await helpers.advanceTimeAndBlock(100);
        const log2 = await masterChef.connect(someAccount).harvestAll();
        
        const time1 = await helpers.timestamp(log1.blockNumber)
        const time2 = await helpers.timestamp(log2.blockNumber)
        const expected = (await masterChef.wULXPerSecond()).mul(time2 - time1).add((await masterChef.wULXPerSecond()).div(2))
        expect(expected).equals(await weth.balanceOf(someAccount.address));
    }); 
});