const FiatTokenV1 = artifacts.require("FiatTokenV1");
const FiatTokenProxy = artifacts.require("FiatTokenProxy");

// Any address will do, preferably one we generated
const throwawayAddress = "0xF7259090c88e43ABE4cA01689Abd793D30B77aEa";

module.exports = async (deployer, network) => {
  let admin, masterMinter, pauser, blacklister, owner;

  if (network.toLowerCase().includes("mainnet")) {
    require("dotenv").config();
    const {
      ADMIN_ADDRESS,
      MASTERMINTER_ADDRESS,
      PAUSER_ADDRESS,
      BLACKLISTER_ADDRESS,
      OWNER_ADDDRESS,
    } = process.env;

    if (
      !ADMIN_ADDRESS ||
      !MASTERMINTER_ADDRESS ||
      !PAUSER_ADDRESS ||
      !BLACKLISTER_ADDRESS ||
      !OWNER_ADDDRESS
    ) {
      throw new Error(
        "Env vars ADMIN_ADDRESS, MASTERMINTER_ADDRESS, PAUSER_ADDRESS, " +
          "BLACKLISTER_ADDRESS, and OWNER_ADDRESS must be defined for " +
          "mainnet deployment"
      );
    }

    admin = ADMIN_ADDRESS;
    masterMinter = MASTERMINTER_ADDRESS;
    pauser = PAUSER_ADDRESS;
    blacklister = BLACKLISTER_ADDRESS;
    owner = OWNER_ADDDRESS;
  } else {
    // Do not use these addresses for mainnet - these are the deterministic
    // addresses from ganache, so the private keys are well known and match the
    // values we use in the tests
    admin = "0xA07aFe33D4B471e0456dEe2632DbC7a5c515bb5C";
    masterMinter = "0x49D58f1A1a922596C00E38209Ae8aE33EC5a4F5A";
    pauser = "0x31243ee85931709926c2a8a7Eb6BE3b615B27CeE";
    blacklister = "0x80c379C1326286914867D2EFE270e7F72fcc1fc8";
    owner = "0x07238d79890931a1C1107A979AFeCBA26E90ec1B";
  }

  console.log("Deploying implementation contract...");
  await deployer.deploy(FiatTokenV1);
  const fiatTokenV1 = await FiatTokenV1.deployed();
  console.log("Deployed implementation contract at", FiatTokenV1.address);

  console.log("Initializing implementation contract with dummy values...");
  await fiatTokenV1.initialize(
    "",
    "",
    "",
    0,
    throwawayAddress,
    throwawayAddress,
    throwawayAddress,
    throwawayAddress
  );

  console.log("Deploying proxy contract...");
  await deployer.deploy(FiatTokenProxy, FiatTokenV1.address);
  const fiatTokenProxy = await FiatTokenProxy.deployed();
  console.log("Deployed proxy contract at", FiatTokenProxy.address);

  console.log("Reassigning proxy contract admin...");
  // need to change admin first, or the call to initialize won't work
  // since admin can only call methods in the proxy, and not forwarded methods
  await fiatTokenProxy.changeAdmin(admin);

  console.log("Initializing proxy contract...");
  const fiatTokenV1Proxied = await FiatTokenV1.at(FiatTokenProxy.address);
  // Pretend that the proxy address is a FiatTokenV1 - this is fine because the
  // proxy will forward all the calls to the FiatTokenV1 impl
  await fiatTokenV1Proxied.initialize(
    "THB Coin",
    "THBC",
    "THB",
    6,
    masterMinter,
    pauser,
    blacklister,
    owner
  );
};
