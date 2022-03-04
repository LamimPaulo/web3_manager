import Web3 from "web3";
import Wallet from "../models/Wallet.js";
import fetch from 'node-fetch';
import SystemWallet from "../models/SystemWallet.js";
// import Https from "Https"`

class NftController {

    async safeMint(uri) {
        const contractAbi = JSON.parse(process.env.NFT_CONTRACT_ABI);
        const contractAddress = process.env.NFT_CONTRACT_ADDRESS;
        const pk = await SystemWallet.findOne({
            where: {
                name: 'master',
            }
        });

        var web3 = new Web3(process.env.PROVIDER_URL);
        web3.defaultAccount = pk.address

        const myContract = new web3.eth.Contract(contractAbi, contractAddress);

        const contractData = await myContract.methods.safeMint(pk.address, uri).encodeABI();

        const rawTransaction = {
            from: pk.address,
            to: contractAddress,
            gas: web3.utils.toHex(5000000),
            gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'Gwei')),
            data: contractData,
        }

        const signed = await web3.eth.accounts.signTransaction(rawTransaction, pk.priv)
        const responseData = await web3.eth.sendSignedTransaction(signed.rawTransaction)

        console.log(responseData)
        return responseData
    }

    async fetchId(id) {
        const web3 = new Web3(process.env.PROVIDER_URL);
        // const balance = await web3.eth.getBalance(address);

        const contract = new web3.eth.Contract(JSON.parse(process.env.NFT_CONTRACT_ABI), process.env.NFT_CONTRACT_ADDRESS);
        const data = await contract.methods.tokenURI(id).call()

        return data
    }

    async systemBalance() {
        const web3 = new Web3(process.env.PROVIDER_URL);
        const pk = await SystemWallet.findOne({
            where: {
                name: 'master',
            }
        });

        const contract = new web3.eth.Contract(JSON.parse(process.env.NFT_CONTRACT_ABI), process.env.NFT_CONTRACT_ADDRESS);
        const data = await contract.methods.balanceOf(pk.address).call()

        return data
    }

    async withdrawalToken() {
        const contractAbi = JSON.parse(process.env.NFT_CONTRACT_ABI);
        const contractAddress = process.env.NFT_CONTRACT_ADDRESS;
        const pk = await SystemWallet.findOne({
            where: {
                name: 'master',
            }
        });

        var web3 = new Web3(process.env.PROVIDER_URL);
        web3.defaultAccount = pk.address

        const myContract = new web3.eth.Contract(contractAbi, contractAddress);

        const contractData = await myContract.methods.transferFrom(pk.address, uri).encodeABI();

        const rawTransaction = {
            from: pk.address,
            to: contractAddress,
            gas: web3.utils.toHex(5000000),
            gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'Gwei')),
            data: contractData,
        }

        const signed = await web3.eth.accounts.signTransaction(rawTransaction, pk.priv)
        const responseData = await web3.eth.sendSignedTransaction(signed.rawTransaction)

        console.log(responseData)
        return responseData
    }

    async transferToken() {
        const contractAbi = JSON.parse(process.env.NFT_CONTRACT_ABI);
        const contractAddress = process.env.NFT_CONTRACT_ADDRESS;
        const pk = await SystemWallet.findOne({
            where: {
                name: 'master',
            }
        });

        var web3 = new Web3(process.env.PROVIDER_URL);
        web3.defaultAccount = pk.address

        const myContract = new web3.eth.Contract(contractAbi, contractAddress);

        const contractData = await myContract.methods.transferFrom(pk.address, uri).encodeABI();

        const rawTransaction = {
            from: pk.address,
            to: contractAddress,
            gas: web3.utils.toHex(5000000),
            gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'Gwei')),
            data: contractData,
        }

        const signed = await web3.eth.accounts.signTransaction(rawTransaction, pk.priv)
        const responseData = await web3.eth.sendSignedTransaction(signed.rawTransaction)

        console.log(responseData)
        return responseData
    }

    async contractAbi() {

        const response = await fetch(process.env.BSC_ADDRESS+'api?module=contract&action=getabi&address=0x7F19b3dEDAC275773144D58216F2785bF4CAE630&apikey=8Z5ZEBBPEIFWWJA54XM24IQNSXZFC8ZDUS', {
            method: 'get',
            headers: {'Content-Type': 'application/json'}
            });

        const res = await response.json();

        return res
    }
}

export default NftController;