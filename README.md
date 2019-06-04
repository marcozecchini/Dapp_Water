# Dapp Water

This is a Dapp that realizes a system aiming to reduce
the water consumption through the active participation of citizens
in the proposal of policies to incentive people in reducing the demand,
in the participation in a election system to elect the best proposal and
in the application of the winning proposal.

More in details, the citizens can create and deploy a smart contract (*ProposalContract*)
summarizing their proposal while the election system is managed by another smart contract
(*ManagerContract*). 

*ProposalContract* has also the role of running its 
proposal in case of victory of the election. During the creation of this
the participants may choose between several options to realize their own
proposal. 

```solidity
//Enum for elaborate the proposals
     enum Who { //ENTITY MONITORED
         Home, //Monitor consumption of just a citizen
         Block, //Monitor consumption of a group of citizen
         Neighborhood //Monitor consumption of a larger group of citizen
     }
     enum Modes{ //CRITERIA USE TO DISTRIBUTE THE INCENTIVES
         LessThan, //The entity monitored must respect a certain threshold
         LessPossible //The entities monitored must consume less water as much as they can
     }
     enum Incentives { //HOW TO SELECT THOSE ONES THAT HAVE THE INCENTIVE
         First, //The entities that consume less have the incentive
         WhoIsUnder, //The entities who respect a threshold have an incentive
         WhoIsUnderPercentage //The entities who reduce of a certain percentage have an incentive
     }
     enum Periods { //PERIOD MONITORED AFTER WHICH INCENTIVES ARE DISTRIBUTED
         Month,
         Trimester,
         Semester
     }
```  

Another smart contract (*WaterOracle*) aims to retrieve, through the
use of an oracle system ([Oraclize/Provable](https://provable.xyz/)), water
consumption data, used in the running phase of the winning solution.

Finally, a *nodejs* backend is proposed to interact with the blockchain (through *web3js*).
A solution with smart contract compiler can be evaluated. 

## How to use the website

* *Page "Home"*: Just homepage of the site
* *Page "Proposal"*: Page to realize the proposal. Once submitted the ownership of the deployed smart contract is changed to the address of the ManagerContract.
* *Page "Vote"*: Page to ask the permission to vote, available until the beginning of the elections; here you can see the proposals submitted and their content, clicking on one of the listed address, and once you have identified a proposal you can vote it, inserting its index. 
* *Page "Run"*: Page to see the execution of the winning node: it calls the oracle and update `consumptions` list within the winner ProposalContract to keep track of the consumptions and redistribute the incentives.

## Images
![alt-text](https://github.com/marcozecchini/Smartage/blob/master/images/proposal.png)
![alt-text](https://github.com/marcozecchini/Smartage/blob/master/images/vote.png)
![alt-text](https://github.com/marcozecchini/Smartage/blob/master/images/run.png)
