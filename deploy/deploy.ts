import { subtask, task, types } from "hardhat/config";
import * as Helpers from './helpers';


require('dotenv').config();


const fs = require('fs');

const filename = process.env.DIRNAME + "/deployed_storage.json";

let deployed_storage: any = {};
try {
  deployed_storage = JSON.parse(fs.readFileSync(filename).toString().trim());
} catch (err) {
}

task("deploy", "Deploy MasterChef")
  .setAction(async (taskArgs, {ethers}) => {
        const signer = (await ethers.getSigners())[0];

        const wulx = JSON.parse(fs.readFileSync(filename).toString().trim())["wulx"];
        const wulxPerSecond = ethers.utils.parseEther("6.12");
        const startTime = 1659312000; // 01.08.2022 00:00 UTC

        const masterChefFactory = await ethers.getContractFactory("MasterChef", signer);
        const masterChef = await (await masterChefFactory.deploy(wulx, wulxPerSecond, startTime)).deployed();

        deployed_storage["masterChef"] = masterChef.address;
        fs.writeFileSync(filename, JSON.stringify(deployed_storage));
        console.log("MasterChef deployed to:", masterChef.address);
    });

task('set-pool', "Changing pool's alloc point")
    .setAction(async (taskArgs, {ethers}) => {
        const signer = (await ethers.getSigners())[0];

        const masterChefAddress = JSON.parse(fs.readFileSync(filename).toString().trim())["masterChef"];
        const masterChef = await ethers.getContractAt("MasterChef", masterChefAddress, signer);

        // await masterChef.set(0, 500, { gasLimit: 2000000 });
        // await masterChef.set(1, 300, { gasLimit: 2000000 });
        // await masterChef.set(2,  50, { gasLimit: 2000000 });
        // await masterChef.set(3, 150, { gasLimit: 2000000 });

        for(let i = 0; i < await masterChef.poolLength(); i++) {
            console.log(`POOL ${i} | ${await masterChef.poolInfo(i)}`);
        }
});

task('deposit', "Deposit")
    .setAction(async (taskArgs, {ethers}) => {
        const signer = (await ethers.getSigners())[0];

        const masterChefAddress = JSON.parse(fs.readFileSync(filename).toString().trim())["masterChef"];;
        const masterChef = await ethers.getContractAt("MasterChef", masterChefAddress, signer);

        const lpAddress = '0x944086C14Ea9ee4dD6c887ca88B3521a4F2e2F83';
        const lp = await ethers.getContractAt("UniswapV2ERC20", lpAddress, signer);
        const poolBalance = await lp.balanceOf(signer.address);
        const poolId = 7;

        await lp.approve(masterChefAddress, poolBalance);
        await masterChef.deposit(poolId, poolBalance);
});

task("add-pools", "Adding pools")
    .setAction(async (taskArgs, {ethers}) => {
        const signer = (await ethers.getSigners())[0];

        const masterChefAddress = JSON.parse(fs.readFileSync(filename).toString().trim())["masterChef"];
        const masterChef = await ethers.getContractAt("MasterChef", masterChefAddress, signer);

        const factoryAddress = JSON.parse(fs.readFileSync(filename).toString().trim())["UniswapV2Factory"];
        const factory = await ethers.getContractAt("UniswapV2Factory", factoryAddress, signer);

        const wbtc  = JSON.parse(fs.readFileSync(filename).toString().trim())["wBTC"];
        const weth  = JSON.parse(fs.readFileSync(filename).toString().trim())["wETH"];
        const bnb   = JSON.parse(fs.readFileSync(filename).toString().trim())["bnb"];
        const avax  = JSON.parse(fs.readFileSync(filename).toString().trim())["avax"];
        const busd  = JSON.parse(fs.readFileSync(filename).toString().trim())["bUSD"];
        const shib  = JSON.parse(fs.readFileSync(filename).toString().trim())["shib"];
        const matic = JSON.parse(fs.readFileSync(filename).toString().trim())["matic"];
        const ftm   = JSON.parse(fs.readFileSync(filename).toString().trim())["ftm"];
        const dai   = JSON.parse(fs.readFileSync(filename).toString().trim())["dai"];
        const link  = JSON.parse(fs.readFileSync(filename).toString().trim())["link"];
        const usdt  = JSON.parse(fs.readFileSync(filename).toString().trim())["uUSDT"];
        const usdc  = JSON.parse(fs.readFileSync(filename).toString().trim())["uUSDC"];
        const wulx  = JSON.parse(fs.readFileSync(filename).toString().trim())["wulx"];

        const lp0 = await factory.getPair(usdt, wulx);
        const lp1 = await factory.getPair(usdc, wulx);
        const lp2 = await factory.getPair(bnb, wulx);
        const lp3 = await factory.getPair(matic, wulx);

        const lp4 = await factory.getPair(ftm, wulx);
        const lp5 = await factory.getPair(weth, wulx);
        const lp6 = await factory.getPair(wbtc, wulx);

        const lp7 = await factory.getPair(avax, wulx);
        const lp8 = await factory.getPair(usdt, usdc);
        
        const lps = [lp0, lp1, lp2, lp3, lp4, lp5, lp6, lp7, lp8];

        const alloc_points = [2500, 1800, 1100, 1000, 900, 800, 800, 600, 500];
        
        for(let i:number = 0; i < alloc_points.length; i++) {
            await masterChef.add(alloc_points[i], lps[i], { gasLimit: 3000000 });
            await Helpers.delay(4000);
            console.log(`POOL ${i} | ${await masterChef.poolInfo(i)}`);
        }
    });

task("change-owner", "Transfer ownership")
    .setAction(async (taskArgs, {ethers}) => {
        const signer = (await ethers.getSigners())[0];

        const masterChefAddress = '0x9F8eFbc1A35f9D5941efEA8F8aD30703e667F009';
        const masterChef = await ethers.getContractAt("MasterChef", masterChefAddress, signer);

        const owner = '0x4CE535D6E2D47690e33CA646972807BeB264dFBf';

        await masterChef.transferOwnership(owner);
        await Helpers.delay(4000);
        console.log(await masterChef.owner())
    });