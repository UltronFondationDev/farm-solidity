import { subtask, task, types } from "hardhat/config";

task("deploy", "Deploy MasterChef")
  .addParam("wulx", "wULX address")
  .addParam("devaddr", "Dev address")
  .addParam("persec", "wULX PerSecond")
  .addParam("starttime", "Start Time", 0, types.int)
  .setAction(async (taskArgs, {ethers}) => {
      const MasterChef = await ethers.getContractFactory("MasterChef");
      const masterChef = await MasterChef.deploy(taskArgs.wulx, taskArgs.devaddr, taskArgs.persec, taskArgs.starttime);

      await masterChef.deployed();
      console.log("MasterChef deployed to:", masterChef.address);
  });
