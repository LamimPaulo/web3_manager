import Web3 from "web3";
import Tx from 'ethereumjs-tx';
import { Buffer } from 'buffer';


async function signTx(contractAbi, contractAddress, sender, pk, receiver, amountInDecimal) {
    var web3 = new Web3(process.env.PROVIDER_URL);
    const myContract = new web3.eth.Contract(contractAbi, contractAddress);
    var txObject = {};
    var result = await web3.eth.getTransactionCount(
        sender,
        "pending"
    );

    const privKey = pk.substr(2)

    const privateKey = Buffer(privKey, "hex");

    txObject.nonce = web3.utils.toHex(result);
    txObject.gasLimit = web3.utils.toHex(30000000);
    txObject.gasPrice = '0x' + await web3.eth.getGasPrice();
    txObject.to = contractAddress;
    txObject.from = sender;
    txObject.value = '0x';

    // Calling transfer function of contract and encode it in AB format
    txObject.data = myContract.methods.transfer(receiver, web3.utils.toHex(
        web3.utils.toWei(amountInDecimal.toString(), "ether"))).encodeABI();

    //Sign transaction before sending
    var tx = new Tx.Transaction(txObject);
    tx.sign(privateKey);

    var serializedTx = tx.serialize();
    return await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
    // .on('transactionHash', ((data) => {
    //     console.log(data);
    // })).catch(err => {
    //     console.log(err);
    // })
}

export default signTx;