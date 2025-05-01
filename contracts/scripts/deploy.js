async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log(
    "Account balance:",
    (await ethers.provider.getBalance(deployer.address)).toString()
  );

  const SpacePuzzleGame = await ethers.getContractFactory("SpacePuzzleGame");
  const game = await SpacePuzzleGame.deploy();
  await game.waitForDeployment();

  const gameAddress = await game.getAddress();
  console.log("SpacePuzzleGame deployed to:", gameAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
