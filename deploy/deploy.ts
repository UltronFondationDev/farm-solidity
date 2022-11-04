import { subtask, task, types } from "hardhat/config";
import * as Helpers from './helpers';

task("deploy", "Deploy MasterChef")
  .setAction(async (taskArgs, {ethers}) => {
        const signer = (await ethers.getSigners())[0];

        const wulx = '0x3a4F06431457de873B588846d139EC0d86275d54';
        const wulxPerSecond = ethers.utils.parseEther("6.12");
        const startTime = 1659312000; // 01.08.2022 00:00 UTC

        const masterChefFactory = await ethers.getContractFactory("MasterChef", signer);
        const masterChef = await (await masterChefFactory.deploy(wulx, wulxPerSecond, startTime)).deployed();

        console.log("MasterChef deployed to:", masterChef.address);
    });

task('set-pool', "Changing pool's alloc point")
    .setAction(async (taskArgs, {ethers}) => {
        const signer = (await ethers.getSigners())[0];

        const masterChefAddress = '0x51D62Ca04e955AbB7f8BB380FD6f93E1F7d5E5fC'; // 0x9F8eFbc1A35f9D5941efEA8F8aD30703e667F009
        const masterChef = await ethers.getContractAt("MasterChef", masterChefAddress, signer);

        // await masterChef.set(0,  1325, { gasLimit: 2000000 });
        // await masterChef.set(1,  736, { gasLimit: 2000000 });
        // await masterChef.set(2,  147, { gasLimit: 2000000 });
        // await masterChef.set(3,  442, { gasLimit: 2000000 });
        // await masterChef.set(4,  295, { gasLimit: 2000000 });
        // await masterChef.set(5,  2055, { gasLimit: 2000000 });

        for(let i = 0; i < await masterChef.poolLength(); i++) {
            console.log(`POOL ${i} | ${await masterChef.poolInfo(i)}`);
        }
});

task('deposit', "Deposit")
    .setAction(async (taskArgs, {ethers}) => {
        const signer = (await ethers.getSigners())[0];

        const masterChefAddress = '0x83227EeaDd0Efd554AE5175DD80CCfAF969E0cAC';
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

        const masterChefAddress = '0x9F8eFbc1A35f9D5941efEA8F8aD30703e667F009';
        const masterChef = await ethers.getContractAt("MasterChef", masterChefAddress, signer);

        const factoryAddress = "0xe1F0D4a5123Fd0834Be805d84520DFDCd8CF00b7";
        const factory = await ethers.getContractAt("UniswapV2Factory", factoryAddress, signer);

        const wbtc  = '0xd2b86a80A8f30b83843e247A50eCDc8D843D87dD';
        const weth  = '0x2318Bf5809a72AaBAdd15a3453A18e50Bbd651Cd';
        const bnb   = '0x169ac560852ed79af3D97A8977DCf2EBA54A0488';
        const avax  = '0x6FE94412953D373Ef464b85637218EFA9EAB8e97';
        const busd  = '0xc7cAc85C1779d2B8ADA94EFfff49A4754865e2E4';
        const shib  = '0xb5Bb1911cf6C83C1a6E439951C40C2949B0d907f';
        const matic = '0x6094a1e3919b302E236B447f45c4eb2DeCE9D9F4';
        const ftm   = '0xE8Ef8A6FE387C2D10951a63ca8f37dB6B8fA02C1';
        const dai   = '0x045F0f2DE758743c84b756B1Fca735a0dDf0b8f4';
        const link  = '0xc8Fb7999d62072E12fE8f3EDcd7821204FCa0344';
        const usdt  = '0x97FDd294024f50c388e39e73F1705a35cfE87656';
        const usdc  = '0x3c4E0FdeD74876295Ca36F62da289F69E3929cc4';
        const wulx  = '0x3a4F06431457de873B588846d139EC0d86275d54';

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
        
        for(let i:number = 0; i < lps.length; i++) {
            console.log(lps[i]);
        }
        console.log('\n');

        await masterChef.add(0, lp5, { gasLimit: 3000000 });
        const i = await masterChef.poolLength() - 1;
        console.log(`POOL ${i} | ${await masterChef.poolInfo(i)}`);

        // const alloc_points = [2500, 1800, 1100, 1000, 900, 800, 800, 600, 500];
        
        // for(let i:number = 0; i < alloc_points.length; i++) {
        //     await masterChef.add(alloc_points[i], lps[i], { gasLimit: 3000000 });
        //     await Helpers.delay(4000);
        //     console.log(`POOL ${i} | ${await masterChef.poolInfo(i)}`);
        // }
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