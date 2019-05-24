var express = require('express');
var router = express.Router();
var deploy = require('../scripts/deploy_smartcontracts');
var www = require('../bin/www');
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

var startedVote = false;


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'DAO Water' });
});

router.get('/propose', function(req,res,next){
  let ManagerContract = deploy.retrieve("ManagerContract", www.ManagerContract.address);
  var addr = ManagerContract.address;
  res.render('proposal', {title: 'DAO Water', manager_address: addr.toString('hex'), proposal_abi: www.ProposalAbi, proposal_bytecode: www.ProposalCompile.bytecode});
});

router.get('/vote', function (req,res,next) {
  res.render('vote', {title: "DAO water", manager_address: www.ManagerContract.address, list_proposal_array: www.proposals, manager_abi_link: www.ManagerAbi, proposal_abi_link: www.ProposalAbi});
});




module.exports = router;
