import Web3 from "web3";
import SystemWallet from "../models/SystemWallet.js";
import Wallet from "../models/Wallet.js";
import fetch from 'node-fetch';
import NetworkKey from "../models/NetworkKey.js";
import Token from "../models/Token.js";
import roundround from "roundround";
import https from "http";
import SystemNetwork from "../models/SystemNetwork.js";
import amqp from "amqplib";
import TransactionController from "./TransactionController.js";
import { Transaction } from "ethereumjs-tx";
import NetworkGas from "../models/NetworkGas.js";

class WalletController {

    createAddress(master) {
        const w = new Web3();
        const data = w.eth.accounts.create();

        this.saveAddress(data.address, data.privateKey, master.id);

        return data.address;
    }

    async getBalanceByContract(address, contract_addr, network)
    {
        const token = await Token.findOne({
            where: {
                contract_address: contract_addr
            }
        });

        const chain = await SystemNetwork.findOne({
            where: {
                name: network,
            }
        });

        const web3 = new Web3(chain.provider);


        const balance = await web3.eth.getBalance(address);
        const web3_token = new web3.eth.Contract(JSON.parse(token.contract_abi), token.contract_address);
        const token_balance = await web3_token.methods.balanceOf(address).call()


        return {
            status: 200,
            message: 'ok',
            token: token.name,
            balance: token_balance,
            bnb: balance,
        };
    }

    async getMasterBalanceByContract(contract_addr, network, master)
    {
        try {
            const token = await Token.findOne({
                where: {
                    contract_address: contract_addr
                }
            });
            // const master = await SystemWallet.findOne({
            //     where: {
            //         name: 'master',
            //     }
            // })
            const chain = await SystemNetwork.findOne({
                where: {
                    name: network,
                }
            });

            const web3 = new Web3(chain.provider);

            const balance = await web3.eth.getBalance(master.address);
            const web3_token = new web3.eth.Contract(JSON.parse(token.contract_abi), token.contract_address);
            const token_balance = await web3_token.methods.balanceOf(master.address).call()

            return {
                status: 200,
                message: 'system wallet',
                token: token.name,
                balance: web3.utils.fromWei(token_balance),
                bnb: web3.utils.fromWei(balance),
            };

        } catch (error) {
            console.error(error);
        }
    }

    async getInTransactions(address, abbr) {
        var contract_address = await this.getContract(abbr)

        const response = await fetch(process.env.BSC_ADDRESS+'api?module=account&action=tokentx&='+contract_address+'&address='+address+'&page=1&offset=0&startblock=0&endblock=999999999&sort=desc&apikey=8Z5ZEBBPEIFWWJA54XM24IQNSXZFC8ZDUS', {
        // const response = await fetch(process.env.BSC_ADDRESS+'api?module=account&action=tokentx&='+contract_address+'&address='+address+'&page=1&offset=0&startblock=0&endblock=999999999&sort=desc', {
            method: 'get',
            headers: {'Content-Type': 'application/json'}
            });

        const res = await response.json();
        var filtered = []

        if(res.result){
            res.result.forEach(r => {
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
        }

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

    async getAllowanceByToken(address, contract, network, master) {
        const token = await Token.findOne({
            where: {
                contract_address: contract
            }
        });
        // const master = await SystemWallet.findOne({
        //     where: {
        //         name: 'master',
        //     }
        // })
        const chain = await SystemNetwork.findOne({
            where: {
                name: network,
            }
        });
        const web3 = new Web3(chain.provider);

        const contract_std = new web3.eth.Contract(JSON.parse(token.contract_abi), token.contract_address);
        const response = await contract_std.methods.allowance(address, master.address).call()
        return response
    }

    async saveAddress(address, priv, master_id) {
        const model = await Wallet.create({
            'address': address,
            'priv': priv,
            'system_wallet_id': master_id
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

    async checkReceivedTransactionsByToken() {
        var networks = await SystemNetwork.findAll({
            where: {
                is_active: true
            }
        });
        var keyss = []
        for(const network of networks) {
            var keys = await NetworkKey.findAll({
                where: {
                    network_id: network.id,
                    is_active: true,
                    is_daily_expired: false
                }
            });
            for(const key of keys){
                keyss.push({key: key.key, url: key.url})
            };
            var next = roundround(keyss);

            var wallets = await Wallet.findAll();
            for(const wallet of wallets){

                const tokens = await Token.findAll({
                    where: {
                        is_active: true
                    }
                });

                const web3 = new Web3(network.provider);
                var balance = 0

                for(const token of tokens){
                    const web3_token = new web3.eth.Contract(JSON.parse(token.contract_abi), token.contract_address);
                    const token_balance = await web3_token.methods.balanceOf(wallet.address).call()
                    if(token_balance > 0){
                        balance++;
                    }
                    console.log('balance wallet '+wallet.address+': '+web3.utils.fromWei(token_balance)+' '+token.name);
                }


                if(balance > 0){
                    //bnb - eth
                // const response = await fetch(key.url+'api?module=account&action=txlist'+'&address='+address+'&page=1&offset=0&startblock=0&endblock=999999999&sort=desc&apikey='+key.key, {

                //tokens
                const response = await fetch(next().url+'api?module=account&action=tokentx'+'&address='+wallet.address+'&page=1&offset=0&startblock=0&endblock=999999999&sort=desc&apikey='+next().key, {
                    method: 'get',
                    headers: {'Content-Type': 'application/json'}
                    });

                    const res = await response.json();
                    if(res.result){
                        for(const r of res.result) {
                            // if(r.value > 0 && r.to.toLowerCase() == address.toLowerCase() && r.contractAddress.toLowerCase() == contract_address.toLowerCase()){
                            if(r.value > 0 && r.to.toLowerCase() == wallet.address.toLowerCase()){
                                const w3 = new Web3(process.env.PROVIDER_URL);
                                r.value = w3.utils.fromWei(r.value)
                                r.gasPrice = w3.utils.fromWei(r.gasPrice)
                                r.gasUsed = w3.utils.fromWei(r.gasUsed)
                                r.gas = w3.utils.fromWei(r.gas)
                                r.cumulativeGasUsed = w3.utils.fromWei(r.cumulativeGasUsed)
                                r.network = network.name
                                try{

                                    const master = await SystemWallet.findByPk(wallet.system_wallet_id);


                                    console.log(JSON.stringify(r));
                                    console.log('master host: '+master.name );
                                    const notified = await this.notifyExchange(JSON.stringify(r), master.host);
                                }catch(error){
                                    console.log(error);
                                }
                            }
                        };
                    }
                }
            };
        };
        return true;
    }

    async notifyExchange(data, host){
        console.warn('host: '+host)
        try {
            const options = {
                hostname: host,
                port: 8000,
                path: '/api/evmNotify',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Content-Length': data.length,
                },
            };

            const req = https.request(options, res => {

                res.on('data', d => {
                    console.warn(d)
                    process.stdout.write(d);
                    return d;
                });
            });

            req.on('error', error => {
                return error;
            });

            req.write(data);
            req.end();
            return  req
        } catch (error) {
            console.error(error);
        }
    }

    async checkBalanceHookToMaster(){
        try {
            const opt = { credentials: amqp.credentials.plain('admin', 'N@videv1') };

            const connection = await amqp.connect("amqp://177.38.215.101:5672", opt);
            const channel = await connection.createChannel();
            await channel.assertQueue("ex.token_balance_hook");
            channel.consume("ex.token_balance_hook", async message => {
                const input = JSON.parse(JSON.parse(message.content.toString()));
                // console.log(input);
                const wallet = await Wallet.findOne({
                    where: {
                        address: input.address,
                    }
                })
                const master = await SystemWallet.findOne({
                    where: {
                        id: wallet.system_wallet_id,
                    }
                })

                const web3 = new Web3();
                const transactionController = new TransactionController();

                const balance = await this.getBalanceByContract(input.address, input.contract, input.network);
                console.log(balance);
                console.log(web3.utils.fromWei(balance.balance));
                if(balance.balance > 0){
                    const allowance = await this.getAllowanceByToken(input.address, input.contract, input.network, master);

                    console.log('allowance');
                    console.log(allowance);

                    if(allowance <= 100 ){
                        const rec_gas = await NetworkGas.findOne();
                        const unit_estimate = await transactionController.EstimateAllowanceGasByToken(input.address, input.contract, input.network, master);
                        const estimate = web3.utils.toWei(rec_gas.fast, 'Gwei') * unit_estimate;
                        console.log('estimate: '+estimate);
                        // if(web3.utils.toWei(balance.bnb, 'Gwei') < web3.utils.toWei( (Number(rec_gas.fast) * 2).toString(), "Gwei" ) ){
                        if(web3.utils.toWei(balance.bnb, 'wei') < estimate * 3){
                            console.log('caiu no if')
                            console.log('ether estimated: '+web3.utils.fromWei(estimate.toString(), 'ether'));
                            // console.log(web3.utils.toWei(balance.bnb, 'Kwei'))
                            // console.log(web3.utils.toWei( (Number(rec_gas.fast) * 2).toString(), "Gwei" ) )
                            var gas = await transactionController.sendGasByToken(input.address, input.contract, input.network, master, (estimate * 4).toString()).then(async (res) => {
                            await sleep(10000);
                                channel.sendToQueue('ex.token_balance_hook', Buffer.from(message.content.toString()))
                            });
                            // channel.sendToQueue('ex.token_balance_hook', Buffer.from(message.content.toString()))
                        }else{
                            console.log('startou allowance')
                            var allowed = await transactionController.StartAllowanceByToken(input.address, input.contract, input.network, master).then(async (res) => {
                                await sleep(10000);
                                    channel.sendToQueue('ex.token_balance_hook', Buffer.from(message.content.toString()))
                                } );;
                            console.log(allowed);
                        }
                        //todo reinsert in queue
                    }else {
                        const transfer = await transactionController.TransferFromByToken(input.address,balance.balance, input.contract, input.network, master);
                        console.log(transfer);
                        channel.ack(message);

                    }
                } else{
                    console.log('balance zerado.');
                    channel.ack(message);
                }
            });
        } catch (error) {
            console.error(error);
        }

        function sleep(ms) {
            return new Promise((resolve) => {
                setTimeout(resolve, ms);
            });
        }
    }

}

export default WalletController;