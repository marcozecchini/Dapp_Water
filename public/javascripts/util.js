function getTypeOfProposal(who, mode, incentive, period){
    var res = "";
    switch (who) {
        case 0:
            res += "Home, "; break;
        case 1:
            res += "Block, "; break;
        case 2:
            res += "Neighbour, ";
            break;
    }
    if (mode)
        res += "Less Possible, ";
    else
        res += "Less Than, ";

    switch (incentive) {
        case 0:
            res += "First, ";
            break;
        case 1:
            res += "WhoIsUnder, ";
            break;
        case 2:
            res += "WhoIsUnderPercentage, ";
            break;
    }

    switch (period) {
        case 0:
            res += "Month";
            break;
        case 1:
            res += "Trimester";
            break;
        case 2:
            res += "Semester";
            break;
    }

    return res;
}

function estimateGas(contractAddr, data, cb) {
    //var sign = web3.sha3(signature);//.substring(0, 10);
    web3.eth.estimateGas({
        data: data,
        to: contractAddr,
    }, function(err, estimatedGas) {
        if (err) console.log(err);
        else {
            console.log("estimatedGas: " + estimatedGas);
            console.log("estimatedGas Metamask slow fee: " + estimatedGas * 1.49586029e-9);
            cb(err, estimatedGas);
        }
    });
}