var Mortal = artifacts.require("./Mortal.sol");
var SafeMath = artifacts.require("./SafeMath.sol");
var Slotthereum = artifacts.require("./Slotthereum.sol");

module.exports = function(deployer) {
    deployer.deploy(Mortal);
    deployer.deploy(SafeMath);
    deployer.link(Mortal, SafeMath, Slotthereum);
    deployer.deploy(Slotthereum);
};
