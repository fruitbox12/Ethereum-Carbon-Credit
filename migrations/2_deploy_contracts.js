var CarbonCredit = artifacts.require("./CarbonCredit.sol");

module.exports = function(deployer) {
  deployer.deploy(CarbonCredit);
};