const fs = require("fs");
const contract = JSON.parse(
  fs.readFileSync("./build/contracts/FiatTokenV1.json", "utf8")
);
console.log(JSON.stringify(contract.abi));
