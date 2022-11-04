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

const transactionController = new TransactionController();
const walletController = new WalletController();
const nftController = new NftController();
const gasController = new GasController();

const app = express();

const cronCheckTransactions = new cron.schedule("*/2 * * * *", async() => {
  if(cronCheckTransactions.taskRunning){
    console.log('cronCheckTransactions already running')
    return
  }
  cronCheckTransactions.taskRunning = true;
  try {
    await walletController.checkReceivedTransactionsByToken();
  } catch (error) {
    cronCheckTransactions.taskRunning = false
  }
  cronCheckTransactions.taskRunning = false
}, {
  scheduled: false
});

const cronCheckHookBalance = new cron.schedule("* * * * *", async() => {
  console.log('cronCheckHookBalance triggered');
  console.log('cronCheckHookBalance: '.cronCheckHookBalance.taskRunning);
  if(!cronCheckHookBalance.taskRunning){
    cronCheckHookBalance.taskRunning = true
    try {
      await walletController.checkBalanceHookToMaster();
    } catch (error) {
      cronCheckHookBalance.taskRunning = false
    }
  }
  // cronCheckHookBalance.taskRunning = false
}, {
  scheduled: false
});

const cronCheckNetworkGas = new cron.schedule("0 * * * *", async() => {
  if(cronCheckNetworkGas.taskRunning){
    return
  }

  cronCheckNetworkGas.taskRunning = true
  try {
    await gasController.syncGas();
  } catch (error) {
    //
    cronCheckNetworkGas.taskRunning = false;
  }
  cronCheckNetworkGas.taskRunning = false;
}, {
  scheduled: false
});

cronCheckHookBalance.taskRunning = false
cronCheckNetworkGas.taskRunning = false;

cronCheckHookBalance.start();
cronCheckNetworkGas.start();
cronCheckTransactions.start();


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
      message: 'os-system has no matching record on db'
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
  // return res.send(walletController.checkReceivedTransactionsByToken());
  return await res.send(walletController.checkBalanceHookToMaster());
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

app.post('/getbalanceByToken',async (req, res) => {
  const { address, contract, network } = req.body;
  return res.send({
    status: 'ok',
    message: 'success',
    data: await walletController.getBalanceByContract(address, contract, network, req.master)
  });
});

app.post('/getMasterBalanceByToken',async (req, res) => {
  const {contract, network} = req.body;
  const data = await walletController.getMasterBalanceByContract(contract, network, req.master);
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

app.post('/system/balance',async (req, res) => {
  const { address } = req.body;
  return res.send({
    status: 'ok',
    message: 'success',
    data: await walletController.getSystemBalance(address)
  });
});

app.post('/get-allowance',async (req, res) => {
  const { owner, abbr } = req.body;
  return res.send({
    status: 'ok',
    message: 'success',
    data: await walletController.getAllowance(owner, abbr)
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

app.post('/TransferNoGasBRLToInfinityWallet', async (req, res) => {
    const {target_address, amount} = req.body;
    return await transactionController.TransferNoGasBRLToInfinityWallet(target_address, amount, req.master)
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