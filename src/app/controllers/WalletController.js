import Web3 from "web3";
import SystemWallet from "../models/SystemWallet.js";
import Wallet from "../models/Wallet.js";
import fetch from 'node-fetch';
class WalletController {

    createAddress() {
        const w = new Web3();
        const data = w.eth.accounts.create();

        this.saveAddress(data.address, data.privateKey);

        return data.address;
    }

    async getInTransactions(address) {
        const response = await fetch(process.env.BSC_ADDRESS+'api?module=account&action=tokentx&='+process.env.USDT_ADDRESS+'&address='+address+'&page=1&offset=0&startblock=0&endblock=999999999&sort=desc&apikey=8Z5ZEBBPEIFWWJA54XM24IQNSXZFC8ZDUS', {
            method: 'get',
            headers: {'Content-Type': 'application/json'}
            });

        const res = await response.json();

        var filtered = []
        res.result.forEach(r => {
            console.log(r.value)
            if(r.value > 0 && r.to == address.toLowerCase()){
                const w3 = new Web3(process.env.PROVIDER_URL);
                r.value = w3.utils.fromWei(r.value)
                r.gasPrice = w3.utils.fromWei(r.gasPrice)
                r.gasUsed = w3.utils.fromWei(r.gasUsed)
                r.gas = w3.utils.fromWei(r.gas)
                r.cumulativeGasUsed = w3.utils.fromWei(r.cumulativeGasUsed)
                filtered.push(r)
            }
        });

        return filtered
    }

    async getBalance(address) {
        const web3 = new Web3(process.env.PROVIDER_URL);
        const balance = await web3.eth.getBalance(address);

        const usdt = new web3.eth.Contract(JSON.parse(process.env.USDT_ABI_ENCODED), process.env.USDT_ADDRESS);
        const usdtBalance = await usdt.methods.balanceOf(address).call()

        const data = {
            bnb: await web3.utils.fromWei(balance),
            usdt: await web3.utils.fromWei(usdtBalance)
        }

        return data
    }

    async getSystemBalance() {
        const master = await SystemWallet.findOne({
            where: {
                name: 'master',
            }
        })

        const web3 = new Web3(process.env.PROVIDER_URL);
        const balance = await web3.eth.getBalance(master.address);

        const usdt = new web3.eth.Contract(JSON.parse(process.env.USDT_ABI_ENCODED), process.env.USDT_ADDRESS);
        const usdtBalance = await usdt.methods.balanceOf(master.address).call()

        const data = {
            bnb: await web3.utils.fromWei(balance),
            usdt: await web3.utils.fromWei(usdtBalance)
        }

        return data
    }

    async getAllowance(owner) {
        const web3 = new Web3(process.env.PROVIDER_URL);
        const master = await SystemWallet.findOne({where: {name: 'master'}})

        const usdt = new web3.eth.Contract(JSON.parse(process.env.USDT_ABI_ENCODED), process.env.USDT_ADDRESS);
        const response = await usdt.methods.allowance(owner, master.address).call()

        const data = response
        console.log(data)
        return data
    }

    async saveAddress(address, priv) {
        const model = await Wallet.create({
            'address': address,
            'priv': priv,
        })
        model.save();

        return true
    }

}

export default WalletController;