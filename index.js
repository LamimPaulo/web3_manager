import 'dotenv/config';
import signTx from './src/app/controllers/TransactionController.js';
import TransactionController from './src/app/controllers/TransactionController.js';
import WalletController from './src/app/controllers/WalletController.js';
import express from 'express';
import bodyParser from "body-parser";
import database from './src/database/index.js';

const transactionController = new TransactionController();
const walletController = new WalletController();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
  }));

app.get('/address', async (req, res) => {
    return await res.send(walletController.createAddress());
  });

app.post('/getbalance',async (req, res) => {
  const { address } = req.body;
  return res.send({
    status: 'ok',
    message: 'success',
    data: await walletController.getBalance(address)
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
  const { owner } = req.body;
  return res.send({
    status: 'ok',
    message: 'success',
    data: await walletController.getAllowance(owner)
  });
});

app.post('/sign-tx', async (req, res) => {
    const {receiver, amount} = req.body;
    return await transactionController.signTx(receiver, amount)
    .then((sign) => {
        return res.send(sign);
    }).catch((error) => {
        return res.status(500).send(error);
    })
    
});

app.post('/send-from', async (req, res) => {
    const {client_address, amount} = req.body;
    return await transactionController.TransferFrom(client_address, amount)
    .then((sign) => {
        return res.send(sign);
    }).catch((error) => {
        return res.status(400).send(error.message);
    })
});

app.post('/start-allowance', async (req, res) => {
    const {client_address} = req.body;
    return await transactionController.StartApprove(client_address)
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

app.listen(process.env.PORT, () =>
    console.log(`App listening on port ${process.env.PORT}!`),
);