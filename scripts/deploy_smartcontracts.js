
//----------------------------------------------------------------------------
// Node require
//----------------------------------------------------------------------------
var solc = require('solc');
var fs = require("fs");
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
var BigNumber = require('bignumber.js/bignumber.js');


//----------------------------------------------------------------------------
// Change the settings below according to your situation
//----------------------------------------------------------------------------
let senderAddress = null; //web3.eth.accounts[0];
let fileName = "Contracts.sol";
let contractName = "ManagerContract";

//----------------------------------------------------------------------------
// Below this line do not make changes unless you know what you are doing.
//----------------------------------------------------------------------------

// Unlock account.
//web3.personal.unlockAccount(senderAddress, password);

exports.compile = function compileContract(fileName, contractName) {
// Read the solidity file and store the content in source
    // https://nodejs.org/api/fs.html
    let source = fs.readFileSync(fileName, 'utf8');
    let oraclize_source = fs.readFileSync("Oraclize.sol", "utf8");
    let datetime_source = fs.readFileSync("Datetime.sol", "utf8")

    // inputFilesContent is an associative array inputFilesContent['Filename.sol'] = FileContent
    let inputFilesContent = {};
    inputFilesContent[fileName] = source;
    inputFilesContent["Oraclize.sol"] = oraclize_source;
    inputFilesContent["Datetime.sol"] = datetime_source;

    // https://github.com/ethereum/solc-js
    // Setting 1 as second parameter activates the optimiser
    let compiledContract = solc.compile({sources: inputFilesContent}, 1);

    // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
    // JSON.stringify
    // replacer function = null
    // space = 4: Number of spaces for an indent. For readability of the compiled_output.json.
    console.log("Contract is compiled, see file compiled_output.json");
    fs.writeFileSync("scripts/build/compiled_output.json", JSON.stringify(compiledContract, null, 4));

    // Extracts all data from the javascript object after contracts.fileName:contractName
    let theContract = compiledContract.contracts[fileName + ":" + contractName];
    //console.log("theContract: "+JSON.stringify(theContract,null,4));

    // Extracts all data from the javascript object after contracts.fileName:contractName.interface
    // Store to content in file compiled_output.abi
    let abi = theContract.interface;
    fs.writeFileSync("scripts/build/compiled_output_"+contractName+".abi", abi);
    //console.log("abi: "+JSON.stringify(JSON.parse(abi),null,4));
    return [theContract, abi];
};

function retrieveCompile(fileName, contractName){
    let compiledContract = JSON.parse(fs.readFileSync("scripts/build/compiled_output.json"));
    let theContract = compiledContract.contracts[fileName+":"+contractName];
    let abi = fs.readFileSync("scripts/build/compiled_output_"+contractName+".abi");

    return {theContract, abi};
}

exports.retrieveCompile = function  retrieveCompile(fileName, contractName){
    let compiledContract = JSON.parse(fs.readFileSync("scripts/build/compiled_output.json"));
    let theContract = compiledContract.contracts[fileName+":"+contractName];
    let abi = fs.readFileSync("scripts/build/compiled_output_"+contractName+".abi");

    return {theContract, abi};
};

exports.compile_deploy = function compile_and_deploy(fileName, contractName, senderAddress) {


    let deployContract = true;

    // If estimated gas does not match the actual gas usage, add additionalGas
    let additionalGas = 50000;

    // Deploy a contract with ether attached (= transferValueWei)
    // The transferValueWei is in wei
    var transferValueWei = 20000000000;

    // 1 Eth = 173 euro
    let ethToFiatCurrency = 173;
    let currencyUnit = "Euro";
    console.log("1 Ether: " + ethToFiatCurrency + " " + currencyUnit + " (roughly)");

    // Show account balance
    let balanceWei = web3.eth.getBalance(senderAddress);
    let balanceEther = web3.fromWei(balanceWei, "ether");

    let balanceEtherBig = web3.toBigNumber(balanceEther);
    let balanceInFiatCurrencyBig = balanceEtherBig.times(ethToFiatCurrency);
    console.log("Account: " + senderAddress);
    //console.log("Account balance (Wei): " + balanceWei);
    //console.log("Account balance (Ether): " + balanceEther);
    //console.log("Account balance (" + currencyUnit + "): " + balanceInFiatCurrencyBig);

    let {theContract, abi} = compileContract(fileName, contractName);

    // Extracts all data from the javascript object after contracts.fileName:contractName.bytecode
    // and prepend with "0x". Bytecode should always start with 0x.
    let bytecode = "0x" + theContract.bytecode;
    //console.log("bytecode: "+bytecode);

    // Convert transferValueWei in different units
    let transferValueEther = web3.fromWei(transferValueWei, "ether");
    let transferValueEtherBig = web3.toBigNumber(transferValueEther);
    let transferValueInFiatCurrencyBig = transferValueEtherBig.times(ethToFiatCurrency);
    //console.log("TransferValue (Wei): " + transferValueWei);
    //console.log("TransferValue (Ether): " + transferValueEther);
    //console.log("TransferValue (" + currencyUnit + "): " + transferValueInFiatCurrencyBig);

    // Get the estimated gas required to  the code.
    // Add additional gas if the gasLimit is too low.
    let estimateGas = web3.eth.estimateGas({data: bytecode});
    let estimateGasBig = web3.toBigNumber(estimateGas);
    let additionalGasBig = web3.toBigNumber(additionalGas);
    let totalEstimateGasBig = estimateGasBig.add(additionalGasBig);
    //console.log("Estimate gas: " + estimateGas);
    //console.log("User added additionalGas: " + additionalGas);
    //console.log("Total estimate gas: " + totalEstimateGasBig);

    // Get the gasPrice. Default value set in the Geth node.
    // The gas price is based per unit gas.
    let gasPriceWei = web3.eth.gasPrice;
    let gasPriceEther = web3.fromWei(gasPriceWei, "ether");
    let gasPriceEtherBig = web3.toBigNumber(gasPriceEther);
    let gasPriceInFiatCurrencyBig = gasPriceEtherBig.times(ethToFiatCurrency);
    //console.log("GasPrice (Wei/gas unit): " + gasPriceWei);
    //console.log("GasPrice (Ether/gas unit): " + gasPriceEther.toString(10));
    //console.log("GasPrice (" + currencyUnit + "/gas unit): " + gasPriceInFiatCurrencyBig);

    // Calculate the TOTAL PRICE
    // https://github.com/ethereum/wiki/blob/master/JavaScript-API.md
    // http://mikemcl.github.io/bignumber.js/
    let gasPriceWeiBig = web3.toBigNumber(gasPriceWei);
    let priceWeiBig = totalEstimateGasBig.times(gasPriceWeiBig);
    let priceEtherBig = web3.fromWei(priceWeiBig, "ether")
    let priceInFiatCurrencyBig = priceEtherBig.times(ethToFiatCurrency);
    //console.log("Estimated price = total estimate gas * gasPrice");
    //console.log("Estimated price (Wei): " + priceWeiBig);
    //console.log("Estimated price (Ether): " + priceEtherBig);
    //console.log("Estimated price (" + currencyUnit + "): " + priceInFiatCurrencyBig);

    // Create a javascript contract object. This contract is going to be deployed.
    var MyContract = web3.eth.contract(JSON.parse(abi));
    //console.log("MyContract: "+JSON.stringify(MyContract,null,4));


    // DEPLOY the contract into the blockchain
    // If there is NO contructor
    // MyContract.new({from:senderAddress, data:bytecode, gas:estimatedGas});
    // If there is a constructor with 1 or more parameters
    // MyContract.new(param1, param2, paramN, {from:senderAddress, data:bytecode, gas:totalEstimateGasBig});
    if (deployContract) {
        var contract = MyContract.new({from: senderAddress, data: bytecode, gas: totalEstimateGasBig});

        // Transaction has entered to geth memory pool
        console.log("Contract is being deployed, please wait...");
        console.log("TransactionHash: " + contract.transactionHash);

        contract.address = waitBlock(contract);
    }

    return contract;
};

exports.deploy = function deploy(fileName, contractName, senderAddress) {


    let deployContract = true;

    // If estimated gas does not match the actual gas usage, add additionalGas
    let additionalGas = 50000;

    // Deploy a contract with ether attached (= transferValueWei)
    // The transferValueWei is in wei
    var transferValueWei = 20000000000;

    // 1 Eth = 173 euro
    let ethToFiatCurrency = 173;
    let currencyUnit = "Euro";
    console.log("1 Ether: " + ethToFiatCurrency + " " + currencyUnit + " (roughly)");

    // Show account balance
    let balanceWei = web3.eth.getBalance(senderAddress);
    let balanceEther = web3.fromWei(balanceWei, "ether");

    let balanceEtherBig = web3.toBigNumber(balanceEther);
    let balanceInFiatCurrencyBig = balanceEtherBig.times(ethToFiatCurrency);
    console.log("Account: " + senderAddress);
    //console.log("Account balance (Wei): " + balanceWei);
    //console.log("Account balance (Ether): " + balanceEther);
    //console.log("Account balance (" + currencyUnit + "): " + balanceInFiatCurrencyBig);

    let {theContract, abi} = retrieveCompile(fileName, contractName);

    // Extracts all data from the javascript object after contracts.fileName:contractName.bytecode
    // and prepend with "0x". Bytecode should always start with 0x.
    let bytecode = "0x" + theContract.bytecode;
    //console.log("bytecode: "+bytecode);

    // Convert transferValueWei in different units
    let transferValueEther = web3.fromWei(transferValueWei, "ether");
    let transferValueEtherBig = web3.toBigNumber(transferValueEther);
    let transferValueInFiatCurrencyBig = transferValueEtherBig.times(ethToFiatCurrency);
    //console.log("TransferValue (Wei): " + transferValueWei);
    //console.log("TransferValue (Ether): " + transferValueEther);
    //console.log("TransferValue (" + currencyUnit + "): " + transferValueInFiatCurrencyBig);

    // Get the estimated gas required to  the code.
    // Add additional gas if the gasLimit is too low.
    let estimateGas = web3.eth.estimateGas({data: bytecode});
    let estimateGasBig = web3.toBigNumber(estimateGas);
    let additionalGasBig = web3.toBigNumber(additionalGas);
    let totalEstimateGasBig = estimateGasBig.add(additionalGasBig);
    //console.log("Estimate gas: " + estimateGas);
    //console.log("User added additionalGas: " + additionalGas);
    //console.log("Total estimate gas: " + totalEstimateGasBig);

    // Get the gasPrice. Default value set in the Geth node.
    // The gas price is based per unit gas.
    let gasPriceWei = web3.eth.gasPrice;
    let gasPriceEther = web3.fromWei(gasPriceWei, "ether");
    let gasPriceEtherBig = web3.toBigNumber(gasPriceEther);
    let gasPriceInFiatCurrencyBig = gasPriceEtherBig.times(ethToFiatCurrency);
    //console.log("GasPrice (Wei/gas unit): " + gasPriceWei);
    //console.log("GasPrice (Ether/gas unit): " + gasPriceEther.toString(10));
    //console.log("GasPrice (" + currencyUnit + "/gas unit): " + gasPriceInFiatCurrencyBig);

    // Calculate the TOTAL PRICE
    // https://github.com/ethereum/wiki/blob/master/JavaScript-API.md
    // http://mikemcl.github.io/bignumber.js/
    let gasPriceWeiBig = web3.toBigNumber(gasPriceWei);
    let priceWeiBig = totalEstimateGasBig.times(gasPriceWeiBig);
    let priceEtherBig = web3.fromWei(priceWeiBig, "ether");
    let priceInFiatCurrencyBig = priceEtherBig.times(ethToFiatCurrency);
    //console.log("Estimated price = total estimate gas * gasPrice");
    //console.log("Estimated price (Wei): " + priceWeiBig);
    //console.log("Estimated price (Ether): " + priceEtherBig);
    //console.log("Estimated price (" + currencyUnit + "): " + priceInFiatCurrencyBig);

    // Create a javascript contract object. This contract is going to be deployed.
    var MyContract = web3.eth.contract(JSON.parse(abi));
    //console.log("MyContract: "+JSON.stringify(MyContract,null,4));


    // DEPLOY the contract into the blockchain
    // If there is NO contructor
    // MyContract.new({from:senderAddress, data:bytecode, gas:estimatedGas});
    // If there is a constructor with 1 or more parameters
    // MyContract.new(param1, param2, paramN, {from:senderAddress, data:bytecode, gas:totalEstimateGasBig});
    if (deployContract) {
        var contract = MyContract.new({from: senderAddress, data: bytecode, gas: totalEstimateGasBig});

        // Transaction has entered to geth memory pool
        console.log("Contract is being deployed, please wait...");
        console.log("TransactionHash: " + contract.transactionHash);

        contract.address = waitBlock(contract);
    }

    return contract;
};
//contract = deploy(fileName, contractName, senderAddress);
//console.log(contract.address);
exports.retrieve = function retrieveContract(contractName, address){
    let abi = JSON.parse(fs.readFileSync("scripts/build/compiled_output_"+contractName+".abi"));
    return web3.eth.contract(abi).at(address);
};
// http://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Wait for a miner to include the transaction in a block.
// Only when the transaction is included in a block the contract address in available.
//async function waitBlock(contract) {
function waitBlock(contract) {
    while (true) {
        let receipt = web3.eth.getTransactionReceipt(contract.transactionHash);
        if (receipt && receipt.contractAddress) {
            console.log("Contract is deployed at contract address: " + receipt.contractAddress);
            return receipt.contractAddress
        }
        //await sleep(4000);
    }
}