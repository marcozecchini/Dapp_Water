var express = require('express');
var router = express.Router();
var deploy = require('../scripts/deploy_smartcontracts');
var www = require('../bin/www');
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

var startedVote = false;


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Dapp Water' });
});

router.get('/propose', function(req,res,next){
  //let ManagerContract = deploy.retrieve("ManagerContract", www.ManagerContract.address);
  var addr = www.ManagerContractAddress;
  res.render('proposal', {title: 'Dapp Water', manager_address: addr.toString('hex'), proposal_abi: www.ProposalAbi, proposal_bytecode: www.ProposalCompile.bytecode, oracle_address: www.WaterOracleAddress});
});

router.get('/vote', function (req,res,next) {
  res.render('vote', {title: "Dapp water", startedVote: www.startedVote, manager_address: www.ManagerContractAddress, list_proposal_array: www.proposals, manager_abi_link: www.ManagerAbi, proposal_abi_link: www.ProposalAbi});
});




module.exports = router;
