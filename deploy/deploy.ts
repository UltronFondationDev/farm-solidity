import { subtask, task, types } from "hardhat/config";

task("deploy", "Deploy MasterChef")
  .setAction(async (taskArgs, {ethers}) => {
        const signer = (await ethers.getSigners())[0];

        const wulx = '0xE2619ab40a445526B0AaDff944F994971d2EAc05';
        const developerAddress = signer.address; 
        const wulxPerSecond = ethers.utils.parseEther("6.12");
        const startTime = 0;

        const masterChefFactory = await ethers.getContractFactory("MasterChef");
        const masterChef = await masterChefFactory.deploy(wulx, developerAddress, wulxPerSecond, startTime);

        await masterChef.deployed();
        console.log("MasterChef deployed to:", masterChef.address);
    });

task("add-pools", "Adding pools")
    .setAction(async (taskArgs, {ethers}) => {
        const signer = (await ethers.getSigners())[0];

        const masterChefAddress = '0xc095B0cC5F7b10A78ed5FECE1798170c4acb671B';
        const masterChef = await ethers.getContractAt("MasterChef", masterChefAddress, signer);

        const factoryAddress = "0x58e103F46b99014e1A28113C7434fDB05e84Fb2a";
        const factory = await ethers.getContractAt("UniswapV2Factory", factoryAddress, signer);

        const usdc = '0xFac94031AA8f09e2858F93974178fd70F276EAD1';
        const avax = '0xA066a85923dFB145B947EB4A74c6e0ad7CEAE193';
        const dai = '0x9d40F4A04C737887a79902Caa7cE8003197D8B1C';
        const wulx = '0xE2619ab40a445526B0AaDff944F994971d2EAc05';
        const shib = '0x29263214978Db13A1b1cA0381f58Ca7b2054588c';

        const lp0 = await factory.getPair(usdc, avax);
        console.log(lp0)
        const lp1 = await factory.getPair(usdc, dai);
        const lp2 = await factory.getPair(usdc, wulx);
        const lp3 = await factory.getPair(usdc, shib);

        const lp4 = await factory.getPair(avax, dai);
        const lp5 = await factory.getPair(avax, wulx);
        const lp6 = await factory.getPair(avax, shib);

        const lp7 = await factory.getPair(dai, wulx);
        const lp8 = await factory.getPair(dai, shib);

        const lp9 = await factory.getPair(wulx, shib);

        const lps = [lp0, lp1, lp2, lp3, lp4, lp5, lp6, lp7, lp8, lp9];

        const alloc_points = [2500, 1800, 1100, 1000, 900, 800, 800, 600, 500];
        
        for(let i:number = 0; i < alloc_points.length; i++) {
            await masterChef.add(alloc_points[i], lps[i])
            console.log(`Added pool ${alloc_points[i]} ${lps[i]}`)
        }
    });