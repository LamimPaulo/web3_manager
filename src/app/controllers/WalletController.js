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

    async getInTransactions(address, abbr) {
        var contract_address = await this.getContract(abbr)

        // const response = await fetch(process.env.BSC_ADDRESS+'api?module=account&action=tokentx&='+contract_address+'&address='+address+'&page=1&offset=0&startblock=0&endblock=999999999&sort=desc&apikey=8Z5ZEBBPEIFWWJA54XM24IQNSXZFC8ZDUS', {
        const response = await fetch(process.env.BSC_ADDRESS+'api?module=account&action=tokentx&='+contract_address+'&address='+address+'&page=1&offset=0&startblock=0&endblock=999999999&sort=desc', {
            method: 'get',
            headers: {'Content-Type': 'application/json'}
            });

        const res = await response.json();
        var filtered = []

        res.result.forEach(r => {
            console.log(r.value)
            if(r.value > 0 && r.to.toLowerCase() == address.toLowerCase() && r.contractAddress.toLowerCase() == contract_address.toLowerCase()){
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

    async getBalance(address, abbr) {
        const web3 = new Web3(process.env.PROVIDER_URL);
        const balance = await web3.eth.getBalance(address);
        var usdtBalance = 0
        var contract_address = await this.getContract(abbr)
        var contract_abi = await this.getABI(abbr)

        const usdt = new web3.eth.Contract(JSON.parse(contract_abi), contract_address);
        usdtBalance = await usdt.methods.balanceOf(address).call()

        if(abbr == 'NFT'){
            return {
                bnb: await web3.utils.fromWei(balance),
                usdt: await usdtBalance
            }
        } else {
            return {
                bnb: await web3.utils.fromWei(balance),
                usdt: await web3.utils.fromWei(usdtBalance)
            }
        }

        // return data
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

    async getAllowance(owner, abbr) {
        var contract_address = await this.getContract(abbr)
        var contract_abi = await this.getABI(abbr)

        const web3 = new Web3(process.env.PROVIDER_URL);
        const master = await SystemWallet.findOne({where: {name: 'master'}})

        if(abbr == 'NFT'){
            const usdt = new web3.eth.Contract(JSON.parse(contract_abi), contract_address);
            const response = await usdt.methods.isApprovedForAll(owner, master.address).call()
            console.log(response)
            return response
        } else{
            const usdt = new web3.eth.Contract(JSON.parse(contract_abi), contract_address);
            const response = await usdt.methods.allowance(owner, master.address).call()
            console.log(response)
            return response
        }
    }

    async saveAddress(address, priv) {
        const model = await Wallet.create({
            'address': address,
            'priv': priv,
        })
        model.save();

        return true
    }

    async getContract(abbr){
        var contract = ''
        switch (abbr) {
            case 'USDT':
                contract = process.env.USDT_ADDRESS
                break;
            case 'NFT':
                contract = process.env.NFT_CONTRACT_ADDRESS
                break;
            case 'BTCC':
                contract = process.env.BTCC_CONTRACT_ADDRESS
                break;
            default:
                contract = process.env.USDT_ADDRESS
                break;
            }

            return contract
    }

    async getABI(abbr){
        var ABI = ''
        switch (abbr) {
            case 'USDT':
                ABI = process.env.USDT_ABI_ENCODED
                break;
            case 'NFT':
                ABI = process.env.NFT_CONTRACT_ABI
                break;
            case 'BTCC':
                ABI = process.env.BTCC_CONTRACT_ABI
                break;
            default:
                ABI = process.env.USDT_ABI_ENCODED
                break;
            }

            return ABI
    }
}

export default WalletController;