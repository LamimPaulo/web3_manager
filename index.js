import 'dotenv/config';
import signTx from './src/app/controllers/TransactionController.js';
import TransactionController from './src/app/controllers/TransactionController.js';
import NftController from './src/app/controllers/NftController.js';
import WalletController from './src/app/controllers/WalletController.js';
import express from 'express';
import bodyParser from "body-parser";
import database from './src/database/index.js';

const transactionController = new TransactionController();
const walletController = new WalletController();
const nftController = new NftController();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
  }));

app.get('/address', async (req, res) => {
    return await res.send(walletController.createAddress());
  });

app.post('/getbalance',async (req, res) => {
  const { address, abbr } = req.body;
  return res.send({
    status: 'ok',
    message: 'success',
    data: await walletController.getBalance(address, abbr)
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