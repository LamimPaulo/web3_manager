import 'dotenv/config';
import signTx from './src/app/controllers/TransactionController.js';
import TransactionController from './src/app/controllers/TransactionController.js';
import GasController from './src/app/controllers/GasController.js';
import NftController from './src/app/controllers/NftController.js';
import WalletController from './src/app/controllers/WalletController.js';
import SystemWallet from './src/app/models/SystemWallet.js';
import express from 'express';
import bodyParser from "body-parser";
import database from './src/database/index.js';
import * as cron from 'node-cron';
import bcrypt from 'bcrypt';
import StakingController from './src/app/controllers/StakingController.js';

const transactionController = new TransactionController();
const stakingController = new StakingController();
const walletController = new WalletController();
const nftController = new NftController();
const gasController = new GasController();

const app = express();
var running1 = false;
var running2 = false;
var running3 = false;

const cronCheckTransactions = new cron.schedule("*/5 * * * *", async() => {
  if(running1){
    console.log('cronCheckTransactions: already running');
    return
  }
  try {
    console.log('cronCheckTransactions: started running');
    running1 = true
    await walletController.checkReceivedTransactionsByToken();
  } catch (error) {
    console.error(error);
    running1 = false
  }
  running1 = false
}, {
  scheduled: false
});

const cronCheckHookBalance = new cron.schedule("* * * * *", async() => {
  if(running2){
    console.log('cronCheckHookBalance: already running');
    return
  }
  try {
    console.log('cronCheckHookBalance: started running');
    running2 = true
    await walletController.checkBalanceHookToMaster()
  } catch (error) {
    console.log(error);
    running2 = false
  }
}, {
  scheduled: false
});

const cronCheckNetworkGas = new cron.schedule("0 * * * *", async() => {
  if(running3){
    console.log('cronCheckNetworkGas: already running');
    return
  }
  try {
    console.log('cronCheckNetworkGas: started running');
    await gasController.syncGas();
  } catch (error) {
    //
    cronCheckNetworkGas.taskRunning = false;
  }
  cronCheckNetworkGas.taskRunning = false;
}, {
  scheduled: false
});

cronCheckNetworkGas.taskRunning = false;

cronCheckTransactions.start();
cronCheckHookBalance.start();
cronCheckNetworkGas.start();


async function masterMiddleware(req, res, next) {
  const token = req.headers['os-token'];
  const name = req.headers['os-system'];
  if(!token){
    res.status(400).send({
      status: 'error',
      message: 'os-token header not set',
    });
  }
  if(!name){
    res.status(400).send({
      status: 'error',
      message: 'os-system header not set'
    });
  }

  const wallet = await SystemWallet.findOne({
    where: {
      name: name
    }
  });

  if(!wallet){
    res.status(400).send({
      status: 'error',
      message: 'os-system is invalid'
    });
  }

  var check = bcrypt.compareSync(token, wallet.token);
  if(!check){
      res.status(403).send();
  }else{
    req.master = wallet;
    next()
  }
}

app.use(masterMiddleware);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
  }));

app.get('/test', async (req, res) => {
  return res.send(walletController.checkReceivedTransactionsByToken());
  // return await res.send(walletController.checkBalanceHookToMaster());
  // return await res.send(gasController.syncGas());
});

app.get('/newhash', async (req, res) => {
  return await res.send(gasController.generateHash());
});

app.get('/address', async (req, res) => {
  return res.send(walletController.createAddress(req.master));
});

app.post('/getbalance',async (req, res) => {
  const { address, abbr } = req.body;
  return res.send({
    status: 'ok',
    message: 'success',
    data: await walletController.getBalance(address, abbr)
  });
});

app.post('/mintBrl',async (req, res) => {
  const { amount } = req.body;
  return res.send({
    status: 'ok',
    message: 'success',
    data: await transactionController.mintBrl(amount, req.master)
  });
});

app.post('/confirmations',async (req, res) => {
  const { txid, network } = req.body;
  return res.send({
    status: 'ok',
    message: 'success',
    data: await transactionController.CheckConfirmations(txid, network, req.master)
  });
});

app.post('/getbalanceByToken',async (req, res) => {
  const { address, contract, network } = req.body;
  return res.send({
    status: 'ok',
    message: 'success',
    data: await walletController.getBalanceByContract(address, contract, network, req.master)
  });
});

app.post('/getbalanceByContract',async (req, res) => {
  const { address, contract } = req.body;
  
  try {
    const data = await walletController.getBalanceByContract(address, contract, req.master)
    return res.send({
      status: 'ok',
      message: 'success',
      data: data,
    });
  } catch (error) {
    return res.send(400, {
      status: 'error',
      message: error.message,
    });
    
  }
});

app.post('/getMasterBalanceByToken',async (req, res) => {
  const {contract_address} = req.body;
  const data = await walletController.getMasterBalanceByContract(contract, req.master);
  return res.send({
    status: 'ok',
    message: 'success',
    data: data,
  });
});

app.post('/getintransactions',async (req, res) => {
  const { address, abbr } = req.body;
  const data = await walletController.getInTransactions(address, abbr)

  return res.send({
    status: 'ok',
    message: 'success',
    count: data.length,
    data: data
  });
});

app.post('/get-allowance',async (req, res) => {
  const { user_address, contract } = req.body;
  return res.send({
    status: 'ok',
    message: 'success',
    data: await walletController.getAllowanceByToken(user_address, contract, req.master)
  });
});

app.post('/sign-tx', async (req, res) => {
    const {receiver, amount, abbr} = req.body;
    return await transactionController.signTx(receiver, amount, abbr)
    .then((sign) => {
        return res.send(sign);
    }).catch((error) => {
        return res.status(500).send(error);
    })
    
});

app.post('/send-from', async (req, res) => {
    const {client_address, amount, abbr} = req.body;
    return await transactionController.TransferFrom(client_address, amount, abbr)
    .then((sign) => {
        return res.send(sign);
    }).catch((error) => {
        return res.status(400).send(error.message);
    })
});

app.post('/send-to', async (req, res) => {
    const {target_address, amount, abbr} = req.body;
    return await transactionController.TransferTo(target_address, amount, abbr)
    .then((sign) => {
        return res.send(sign);
    }).catch((error) => {
        return res.status(400).send({ok: false, data: error.message});
    })
});

app.post('/transferToByToken', async (req, res) => {
    const {target_address, amount, contract, network} = req.body;
      return await transactionController.TransferToByToken(target_address, amount, contract, network, req.master)
      .then((sign) => {
        return res.send(sign);
    }).catch((error) => {
        return res.status(400).send({
          ok: false,
          data: error.message,
        });
    })
});

app.post('/staking/test', async (req, res) => {
    const {name} = req.body;
      return await stakingController.TestController(name)
      .then((response) => {
        return res.send(response);
    }).catch((error) => {
      console.error(error);
        return res.status(400).send({
          ok: false,
          data: error.message,
        });
    })
});


app.post('/staking/checkBalance', async (req, res) => {
    const {contract_address, address} = req.body;
      return await stakingController.contractBalanceOf(contract_address, address)
      .then((response) => {
        return res.send(response);
    }).catch((error) => {
      console.error(error);
        return res.status(400).send({
          ok: false,
          data: error.message,
        });
    })
});

app.post('/staking/checkRewards', async (req, res) => {
    const {contract_address, address} = req.body;
      return await stakingController.contractCheckReward(contract_address, address)
      .then((response) => {
        return res.send(response);
    }).catch((error) => {
      console.error(error);
        return res.status(400).send({
          ok: false,
          data: error.message,
        });
    })
});

app.post('/staking/checkAccumulatedReward', async (req, res) => {
    const {contract_address, address} = req.body;
      return await stakingController.contractCheckAccumulatedReward(contract_address, address)
      .then((response) => {
        return res.send(response);
    }).catch((error) => {
      console.error(error);
        return res.status(400).send({
          ok: false,
          data: error.message,
        });
    })
});

app.post('/staking/minStake', async (req, res) => {
    const { contract_address } = req.body;
      return await stakingController.contractMinValueStake(contract_address)
      .then((response) => {
        return res.send(response);
    }).catch((error) => {
      console.error(error);
        return res.status(400).send({
          ok: false,
          data: error.message,
        });
    })
});

app.post('/staking/apm', async (req, res) => {
    const {contract_address} = req.body;
      return await stakingController.contractPercentageOfAPM(contract_address)
      .then((response) => {
        return res.send(response);
    }).catch((error) => {
      console.error(error);
        return res.status(400).send({
          ok: false,
          data: error.message,
        });
    })
});

app.post('/staking/bonusPercentage', async (req, res) => {
    const {contract_address} = req.body;
      return await stakingController.contractPercentageOfBonus(contract_address)
      .then((response) => {
        return res.send(response);
    }).catch((error) => {
      console.error(error);
        return res.status(400).send({
          ok: false,
          data: error.message,
        });
    })
});

app.post('/staking/penaltyPercentage', async (req, res) => {
    const {contract_address} = req.body;
      return await stakingController.contractPercentageOfPenalty(contract_address)
      .then((response) => {
        return res.send(response);
    }).catch((error) => {
      console.error(error);
        return res.status(400).send({
          ok: false,
          data: error.message,
        });
    })
});

app.post('/staking/rewardSupply', async (req, res) => {
    const {contract_address} = req.body;
      return await stakingController.contractRewardSupply(contract_address)
      .then((response) => {
        return res.send(response);
    }).catch((error) => {
      console.error(error);
        return res.status(400).send({
          ok: false,
          data: error.message,
        });
    })
});

app.post('/staking/totalSupply', async (req, res) => {
    const {contract_address} = req.body;
      return await stakingController.contractTotalSupply(contract_address)
      .then((response) => {
        return res.send(response);
    }).catch((error) => {
      console.error(error);
        return res.status(400).send({
          ok: false,
          data: error.message,
        });
    })
});

app.post('/staking/accumulateReward', async (req, res) => {
    const {contract_address} = req.body;
      return await stakingController.contractAccumulateReward(contract_address, req.master)
      .then((response) => {
        return res.send(response);
    }).catch((error) => {
      console.error(error);
        return res.status(400).send({
          ok: false,
          data: error.message,
        });
    })
});

app.post('/staking/claimAllReward', async (req, res) => {
    const {contract_address} = req.body;
      return await stakingController.contractClaimAllReward(contract_address, req.master)
      .then((response) => {
        return res.send(response);
    }).catch((error) => {
      console.error(error);
        return res.status(400).send({
          ok: false,
          data: error.message,
        });
    })
});

app.post('/staking/updateAllInfo', async (req, res) => {
    const {contract_address, minStake, rewardSupply, apm, bonus, penalty} = req.body;
      return await stakingController.contractUpdateAllInfo(
          contract_address,minStake, rewardSupply, apm, bonus, penalty, req.master
        )
      .then((response) => {
        return res.send(response);
    }).catch((error) => {
      console.error(error);
        return res.status(400).send({
          ok: false,
          data: error.message,
        });
    })
});

app.post('/staking/updateAPM', async (req, res) => {
    const {contract_address, apm} = req.body;
      return await stakingController.contractUpdateAPM(
          contract_address, apm, req.master
        )
      .then((response) => {
        return res.send(response);
    }).catch((error) => {
      console.error(error);
        return res.status(400).send({
          ok: false,
          data: error.message,
        });
    })
});

app.post('/staking/updateBonus', async (req, res) => {
    const {contract_address, bonus} = req.body;
      return await stakingController.contractUpdateBonus(
          contract_address, bonus, req.master
        )
      .then((response) => {
        return res.send(response);
    }).catch((error) => {
      console.error(error);
        return res.status(400).send({
          ok: false,
          data: error.message,
        });
    })
});

app.post('/staking/updatePenalty', async (req, res) => {
    const {contract_address, penalty} = req.body;
      return await stakingController.contractUpdatePenalty(
          contract_address, penalty, req.master
        )
      .then((response) => {
        return res.send(response);
    }).catch((error) => {
      console.error(error);
        return res.status(400).send({
          ok: false,
          data: error.message,
        });
    })
});

app.post('/staking/updateRewardSupply', async (req, res) => {
    const {contract_address, rewardSupply} = req.body;
      return await stakingController.contractUpdateRewardSupply(
          contract_address, rewardSupply, req.master
        )
      .then((response) => {
        return res.send(response);
    }).catch((error) => {
      console.error(error);
        return res.status(400).send({
          ok: false,
          data: error.message,
        });
    })
});

app.post('/staking/updateMinValueStake', async (req, res) => {
    const {contract_address, minStake} = req.body;
      return await stakingController.contractUpdateMinValueStake(
          contract_address, minStake, req.master
        )
      .then((response) => {
        return res.send(response);
    }).catch((error) => {
      console.error(error);
        return res.status(400).send({
          ok: false,
          data: error.message,
        });
    })
});

app.get('/staking/all', async (req, res) => {
      return await stakingController.listAllContracts()
      .then((response) => {
        return res.send({
          message: 'success',
          data: response
        });
    }).catch((error) => {
      console.error(error);
        return res.status(400).send({
          ok: false,
          data: error.message,
        });
    })
});

app.post('/staking/stake', async (req, res) => {
  const {contract_address, user_address, amount} = req.body;
      return await stakingController.contractStake(contract_address, user_address, amount, req.master)
      .then((response) => {
        return res.send({
          message: 'success',
          data: response
        });
    }).catch((error) => {
      console.error(error);
        return res.status(400).send({
          ok: false,
          data: error.message,
        });
    })
});

app.post('/staking/unstake', async (req, res) => {
  const {contract_address, user_address, amount} = req.body;
      return await stakingController.contractUnstake(contract_address, user_address, amount, req.master)
      .then((response) => {
        return res.send({
          message: 'success',
          data: response
        });
    }).catch((error) => {
      console.error(error);
        return res.status(400).send({
          ok: false,
          data: error.message,
        });
    })
});




app.post('/TransferNoGasBRLFromInfinityWallet', async (req, res) => {
    const {target_address, amount} = req.body;
    return await transactionController.TransferNoGasBRLFromInfinityWallet(target_address, amount, req.master)
    .then((sign) => {
        return res.send(sign);
    }).catch((error) => {
        return res.status(400).send({
          ok: false,
          data: error.message,
        });
    })
});

app.post('/TransferNoGasBRLToCoinageWallet', async (req, res) => {
    const {amount} = req.body;
    return await transactionController.TransferNoGasBRLToInfinityFromCoinage(amount, req.master)
    .then((sign) => {
        return res.send(sign);
    }).catch((error) => {
        return res.status(400).send({
          ok: false,
          data: error.message,
        });
    })
});

app.post('/start-allowance', async (req, res) => {
    const {client_address, abbr} = req.body;
    return await transactionController.StartApprove(client_address, abbr)
    .then((sign) => {
        return res.send(sign);
    }).catch((error) => {
        console.log(error)
        return res.status(400).send(error.message);
    })
    
});

app.post('/send-gas', async (req, res) => {
    const {target, amount} = req.body;
    return await transactionController.sendGas(target, amount)
    .then((sign) => {
        return res.send(sign);
    }).catch((error) => {
        console.log(error)
        return res.status(400).send(error.message);
    })
    
});

app.post('/sync', async (req, res) => {
    return await transactionController.checkTransactions()
    .then((sign) => {
        return res.send(sign);
    }).catch((error) => {
        console.log(error)
        return res.status(400).send(error.message);
    })
});

app.post('/nft/safe-mint', async (req, res) => {
  const { uri } = req.body
    return await nftController.safeMint(uri)
    .then((data) => {
        return res.send(data);
    }).catch((error) => {
        console.log(error)
        return res.status(400).send(error.message);
    }) 
});

app.post('/nft/fetch', async (req, res) => {
  const { id } = req.body
    return await nftController.fetchId(id)
    .then((data) => {
        return res.send(data);
    }).catch((error) => {
        console.log(error)
        return res.status(400).send(error.message);
    }) 
});

app.post('/nft/withdrawal', async (req, res) => {
    const { token_id, address } = req.body
      return await nftController.withdrawalToken(token_id, address)
      .then((data) => {
        return res.status(200).send(data);
      }).catch((error) => {
        return res.status(400).send(error);
      })
});

app.post('/nft/transfer', async (req, res) => {
    const { from, token_id, to } = req.body
      return await nftController.transferToken(from, to, token_id)
      .then((data) => {
        return res.status(200).send(data);
      }).catch((error) => {
        return res.status(400).send(error);
      })
  });

app.post('/nft/abi', async (req, res) => {
//   const { uri } = req.body
    return await nftController.contractAbi()
    .then((data) => {
        return res.send(data);
    }).catch((error) => {
        console.log(error)
        return res.status(400).send(error.message);
    }) 
});


app.listen(process.env.PORT, () =>
    console.log(`App listening on port ${process.env.PORT}!`),
);