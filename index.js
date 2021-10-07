import 'dotenv/config';
import signTx from './src/TransactionController.js';
import WalletController from './src/WalletController.js';
import express from 'express';
import bodyParser from "body-parser";

const app = express();

app.use( bodyParser.json());
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
  }));

app.get('/address', (req, res) => {
    const walletController = new WalletController();    
    return res.send(walletController.createAddress());
  });

  app.get('/getbalance/', (req, res) => {
    const walletController = new WalletController();    
    return res.send(walletController.getBalance(address));
  });

app.post('/sign-tx', (req, res) => {
    const {contractAbi, contractAddress, sender, pk, receiver, amountInDecimal} = req.body;  
    return signTx(contractAbi, contractAddress, sender, pk, receiver, amountInDecimal)
    .then((sign) => {
        return res.send(sign);
    }).catch((error) => {
        return res.send(error);
    })
    
});

app.listen(process.env.PORT, () =>
    console.log(`App listening on port ${process.env.PORT}!`),
);