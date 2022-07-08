import {ethers} from "hardhat";
import { MasterChef, MasterChef__factory, WETH, WETH__factory } from "../typechain-types";
import {expect} from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("\x1b[33mUniswap test\x1b[0m\n", () => {
    const beforeTest = "\t";
    const colorGreen = "\x1b[32m";
    const colorBlue = "\x1b[36m";
    const colorReset = "\x1b[0m";

    const zeroAddress = "0x0000000000000000000000000000000000000000";
    const soэmeAddress = "0xcafecafecafecafecafecafecafecafecafecafe";
    let provider: any;

    let owner: SignerWithAddress;
    let someAccount: SignerWithAddress;

    let weth: WETH;
    let masterChef: MasterChef;
    
    beforeEach(async () => {
        provider = ethers.provider;

        [ owner, someAccount ] = await ethers.getSigners();

        weth = await (await new WETH__factory(owner).deploy()).deployed();

        masterChef = await (await new MasterChef__factory(owner).deploy(weth.address, owner.address, 100, Date.now())).deployed();
        
    });

    it("setWULX per second\n", async () => {
        await expect(masterChef.connect(owner).setwULXPerSecond(ethers.utils.parseEther("2"))).revertedWith("setwULXPerSecond: too many wULXs!");
        masterChef.connect(owner).setwULXPerSecond(ethers.utils.parseEther("0.1"));
    });

    it("Set dev address\n", async () => {
        await expect(masterChef.connect(someAccount).dev(owner.address)).revertedWith("dev: wut?");
        masterChef.connect(owner).dev(owner.address);
    });

});