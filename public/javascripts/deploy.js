function deploy(who, mode, period, man_address, bytes, final_callback) {

    // If estimated gas does not match the actual gas usage, add additionalGas
    let additionalGas = 0;
    let senderAddress = web3.eth.defaultAccount;
    // Deploy a contract with ether attached (= transferValueWei)
    // The transferValueWei is in wei
    var transferValueWei = 20000000000;

    // 1 Eth = 173 euro
    let ethToFiatCurrency = 217;
    let currencyUnit = "Euro";
    console.log("1 Ether: " + ethToFiatCurrency + " " + currencyUnit + " (roughly)");

    // Show account balance
    web3.eth.getBalance(senderAddress, function (err, balanceWei) {
        if (err) console.log(err);
        else{
            let balanceEther = web3.fromWei(balanceWei, "ether");

            let balanceEtherBig = web3.toBigNumber(balanceEther);
            let balanceInFiatCurrencyBig = balanceEtherBig.times(ethToFiatCurrency);
            console.log("Account: " + senderAddress);
            //console.log("Account balance (Wei): " + balanceWei);
            //console.log("Account balance (Ether): " + balanceEther);
            //console.log("Account balance (" + currencyUnit + "): " + balanceInFiatCurrencyBig);

            // Extracts all data from the javascript object after contracts.fileName:contractName.bytecode
            // and prepend with "0x". Bytecode should always start with 0x.
            let bytecode = "0x" + bytes;
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
            //let estimateGas = web3.eth.estimateGas({data: bytecode}, function (err, estimateGas) {
                //if (err)
                //    console.log(err);
                //else {
                 //   let estimateGasBig = web3.toBigNumber(estimateGas);
                 //   let additionalGasBig = web3.toBigNumber(additionalGas);
                  //  let totalEstimateGasBig = estimateGasBig.add(additionalGasBig);
                   // console.log("Estimate gas: " + estimateGas);
            //        console.log("User added additionalGas: " + additionalGas);
                    //console.log("Total estimate gas: " + totalEstimateGasBig);

                    // Get the gasPrice. Default value set in the Geth node.
                    // The gas price is based per unit gas.
                    //let gasPriceWei = web3.eth.gasPrice;
                    //let gasPriceEther = web3.fromWei(gasPriceWei, "ether");
                    //let gasPriceEtherBig = web3.toBigNumber(gasPriceEther);
                    //let gasPriceInFiatCurrencyBig = gasPriceEtherBig.times(ethToFiatCurrency);
                    //console.log("GasPrice (Wei/gas unit): " + gasPriceWei);
                    //console.log("GasPrice (Ether/gas unit): " + gasPriceEther.toString(10));
                    //console.log("GasPrice (" + currencyUnit + "/gas unit): " + gasPriceInFiatCurrencyBig);

                    // Calculate the TOTAL PRICE
                    // https://github.com/ethereum/wiki/blob/master/JavaScript-API.md
                    // http://mikemcl.github.io/bignumber.js/
                    //let gasPriceWeiBig = web3.toBigNumber(gasPriceWei);
                    //let priceWeiBig = totalEstimateGasBig.times(gasPriceWeiBig);
                    //let priceEtherBig = web3.fromWei(priceWeiBig, "ether");
                    //let priceInFiatCurrencyBig = priceEtherBig.times(ethToFiatCurrency);
                    //console.log("Estimated price = total estimate gas * gasPrice");
                    //console.log("Estimated price (Wei): " + priceWeiBig);
                    //console.log("Estimated price (Ether): " + priceEtherBig);
                    //console.log("Estimated price (" + currencyUnit + "): " + priceInFiatCurrencyBig);

                    // Create a javascript contract object. This contract is going to be deployed.
                    var MyContract = web3.eth.contract(abi);
                    //console.log("MyContract: "+JSON.stringify(MyContract,null,4));

                    // DEPLOY the contract into the blockchain
                    var contract = MyContract.new(who, mode, period, man_address,{from: senderAddress, data: bytecode, gas: 3000000}, function (err, contract) {
                        if (err) console.log(err);
                        else {
                            // Transaction has entered to geth memory pool
                            console.log("Contract is being deployed, please wait...");
                            console.log("TransactionHash: " + contract.transactionHash);
                            waitBlock(contract, function(err, addr){
                                contract.address = addr;
                                console.log("Contract Address:"+contract.address);
                                final_callback(null, contract);
                            });
                        }
                    });
                }
            });
        //}
    //});

}

// Wait for a miner to include the transaction in a block.
// Only when the transaction is included in a block the contract address in available.
function waitBlock(contract, callback) {
        let receipt = web3.eth.getTransactionReceipt(contract.transactionHash, function(err, receipt){
            if (err)
                console.log(err);
            else {
                if (receipt && receipt.contractAddress) {
                    console.log("Contract is deployed at contract address: " + receipt.contractAddress);
                    callback( null, receipt.contractAddress);
                }
            }
        });
}