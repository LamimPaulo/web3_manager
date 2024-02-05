import Web3 from "web3";
import SystemWallet from "../models/SystemWallet.js";
import Wallet from "../models/Wallet.js";
import fetch from 'node-fetch';
import NetworkKey from "../models/NetworkKey.js";
import Token from "../models/Token.js";
import roundround from "roundround";
import https from "https";
import SystemNetwork from "../models/SystemNetwork.js";
import amqp from "amqplib";
import TransactionController from "./TransactionController.js";
import { Transaction } from "ethereumjs-tx";
import NetworkGas from "../models/NetworkGas.js";
import Staking from "../models/Staking.js";

class WalletController {

    createAddress(master) {
        const w = new Web3();
        const data = w.eth.accounts.create();

        this.saveAddress(data.address, data.privateKey, master.id);

        return data.address;
    }

    async getBalanceByContract(address, contract_addr)
    {
        const token = await this.getContractV2(contract_addr);
        
        if(!token || token == null){
            throw new Error('invalid token!')
        }

        const chain = await SystemNetwork.findByPk(token.network_id);
        const web3 = new Web3(chain.provider);


        const balance = await web3.eth.getBalance(address);
        const web3_token = new web3.eth.Contract(JSON.parse(token.contract_abi), token.contract_address);
        const token_balance = await web3_token.methods.balanceOf(address).call()


        return {
            token: token.name,
            balance: token_balance,
            chain_coin: balance,
        };
    }

    async getMasterBalance(network, master)
    {
        try {
            const chain = await SystemNetwork.findOne({
                where: {
                    name: network,
                }
            });
            
            const web3 = new Web3(chain.provider);
            
            const balance = await web3.eth.getBalance(master.address);

            return {
                status: 200,
                message: 'system wallet',
                balance: web3.utils.fromWei(balance, 'ether'),
            };

        } catch (error) {
            console.error(error);
        }
    }

    async getMasterBalanceByContract(contract_addr, master)
    {
        try {
            const token = await this.getContractV2(contract_addr);
        
            if(!token || token == null){
                throw new Error('invalid token!')
            }
    
            const chain = await SystemNetwork.findByPk(token.network_id);
            const web3 = new Web3(chain.provider);
            
            const balance = await web3.eth.getBalance(master.address);

            const web3_token = new web3.eth.Contract(JSON.parse(token.contract_abi), token.contract_address);
            const token_balance = await web3_token.methods.balanceOf(master.address).call()

            return {
                status: 200,
                message: 'system wallet',
                // token: token_name ?? token.name,
                token: token.name,
                token_balance: web3.utils.fromWei(token_balance, 'ether'),
                chain_balance: web3.utils.fromWei(balance, 'ether'),
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

    async getBalance(address, network) {
        const chain = await SystemNetwork.findOne({
            where: {
                name: network,
            }
        });

        const web3 = new Web3(chain.provider);
        const balance = (await web3.eth.getBalance(address));
        return balance
    }

    async getAllowanceByToken(address, contract, master) {
        const token = await this.getContractV2(contract);
        
        if(!token || token == null){
            throw new Error('invalid token!')
        }

        const chain = await SystemNetwork.findByPk(token.network_id);
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
    
    async getContractV2(address){
        const contract = await Token.findOne({
            where: {
                contract_address: address,
            }
        });

        return contract
    }

    async checkReceivedTransactionsByToken() {
        var networks = await SystemNetwork.findAll({
            where: {
                is_active: true
            }
        });
        for(const network of networks) {
            var keyss = []
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
                        is_active: true,
                        network_id: network.id
                    }
                });
                // console.log(network.provider);
                const web3 = new Web3(network.provider);
                var balance = 0

                const chain_balance = await (web3.eth.getBalance(wallet.address));

                console.log('balance wallet '+wallet.address+': '+web3.utils.fromWei(chain_balance)+' '+network.name);

                if(web3.utils.fromWei(chain_balance) >= network.address){ // network.address has a string with the minimun acceptable to notify
                    // const response = await fetch(next().url+'api?module=account&action=tokentx'+'&address='+wallet.address+'&page=1&offset=0&startblock=0&endblock=999999999&sort=desc&apikey=' {
                        var url = next().url+'api?module=account&action=txlist'+'&address='+wallet.address+'&page=1&offset=0&startblock=0&endblock=999999999&sort=desc&apikey='+next().key
                        const response = await fetch(url, {
                            method: 'get',
                            headers: {'Content-Type': 'application/json'}
                        });

                        const res = await response.json();

                    if(res.result){
                        const sWallet = await SystemWallet.findAll();
                        for(const r of res.result) {
                            if(r.value > 0 && r.to.toLowerCase() == wallet.address.toLowerCase()){
                                for( const sw of sWallet){
                                    if(r.from.toLowerCase == sw.address){
                                    }
                                }
                                if(r.from.toLowerCase == '0xbc111c9e7eadc2f457beb6e363d370f0e62e213e'){
                                // if(false){
                                    console.log('CBRL ignored')
                                }
                                else{
                                    const w3 = new Web3(process.env.PROVIDER_URL);
                                    r.value = w3.utils.fromWei(r.value)
                                    r.gasPrice = w3.utils.fromWei(r.gasPrice)
                                    r.gasUsed = w3.utils.fromWei(r.gasUsed)
                                    r.gas = w3.utils.fromWei(r.gas)
                                    r.cumulativeGasUsed = w3.utils.fromWei(r.cumulativeGasUsed)
                                    r.network = network.name
                                    r.contractAddress = network.name

                                    const master = await SystemWallet.findByPk(wallet.system_wallet_id);
                                    const notified = await this.notifyExchange(JSON.stringify(r), master.host);
                                    
                                    
                                    if(notified == 'Já notificado'){
                                        console.log(notified);   
                                        console.log('foi true');
                                    } else{
                                        console.log(notified);   
                                        console.log('foi false');
                                    }
                                }
                            }
                        };
                    }

                }

                for(const token of tokens){
                    const web3_token = new web3.eth.Contract(JSON.parse(token.contract_abi), token.contract_address);
                    const token_balance = await web3_token.methods.balanceOf(wallet.address).call()

                    // if(token_balance > 0 && token.name != 'CBRL'){
                    if(token_balance > 0){
                        balance++;
                    }

                    console.log('balance wallet '+wallet.address+': '+web3.utils.fromWei(token_balance)+' '+token.name);
                }

                if(balance > 0){
                    const response = await fetch(next().url+'api?module=account&action=tokentx'+'&address='+wallet.address+'&page=1&offset=0&startblock=0&endblock=999999999&sort=desc&apikey='+next().key, {
                        method: 'get',
                        headers: {'Content-Type': 'application/json'}
                    });

                    const res = await response.json();
                    if(res.result){
                        for(const r of res.result) {
                            // if(r.value > 0 && r.to.toLowerCase() == address.toLowerCase() && r.contractAddress.toLowerCase() == contract_address.toLowerCase()){
                            if(r.value > 0 && r.to.toLowerCase() == wallet.address.toLowerCase()){
                                if(r.contractAddress == '0xbc111c9e7eadc2f457beb6e363d370f0e62e213e'){
                                    console.log('CBRL ignored')
                                }
                                else{
                                    const w3 = new Web3(process.env.PROVIDER_URL);
                                    r.value = w3.utils.fromWei(r.value)
                                    r.gasPrice = w3.utils.fromWei(r.gasPrice)
                                    r.gasUsed = w3.utils.fromWei(r.gasUsed)
                                    r.gas = w3.utils.fromWei(r.gas)
                                    r.cumulativeGasUsed = w3.utils.fromWei(r.cumulativeGasUsed)
                                    r.network = network.name

                                    if(network.name = 'POLYGON') {
                                        const reward_c = await Staking.findOne({
                                            where:{
                                                reward_address: r.contractAddress
                                            }
                                        })

                                        //é reward de staking?!
                                        if(reward_c) {
                                            console.log(r.transactionIndex);
                                            console.log(r.nonce+'+'+r.transactionIndex);

                                            var web33 = new Web3(network.provider);
                                            const extract = await web33.eth.getTransactionReceipt(r.hash);

                                            const reward_contract = new web33.eth.Contract(JSON.parse(reward_c.reward_abi), reward_c.reward_address);
                                            const reward_events = await reward_contract.getPastEvents('Transfer',{
                                                fromBlock: r.blockNumber,
                                                toBlock: r.blockNumber,
                                            });
                                            
                                            r.interactWith = extract.to

                                            for(const re in reward_events){
                                                // console.log('re', reward_events[re].returnValues.to);
                                                r.to = (reward_events[re].returnValues.to);
                                                r.value = web33.utils.fromWei(reward_events[re].returnValues.value, 'ether');
                                                
                                                const master = await SystemWallet.findByPk(wallet.system_wallet_id);
                                                const notified = await this.notifyExchange(JSON.stringify(r), master.host);
                                                
                                                if(notified == 'Já notificado'){
                                                    console.log('já notificado');
                                                } else{
                                                    console.log('notified', notified);
                                                    console.log('nova notificação concluida');
                                                }
                                            }
                                            continue;
                                        }
                                    }

                                    const master = await SystemWallet.findByPk(wallet.system_wallet_id);
                                    const notified = await this.notifyExchange(JSON.stringify(r), master.host);

                                    if(notified == 'já notificado'){
                                        console.log(notified)
                                    } else{
                                        console.log(notified)
                                        console.log('foi false');
                                    }
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
        try {
            const options = {
                hostname: host,
                port: 443,
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
                console.warn(error);
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

            const connection = await amqp.connect("amqp://"+process.env.AMQP_ADDR+":5672", opt);
            const channel = await connection.createChannel();
            await channel.assertQueue("ex.token_balance_hook");

            connection.on('close', function connectionClose() {
                log('Connection closed');
                throw error('closed');
            });

            channel.consume("ex.token_balance_hook", async message => {
                const input = JSON.parse(JSON.parse(message.content.toString()));
                console.log(input.network);
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

                // "{\"address\":\"0x3661431F9c87d6826351dC3ACcaed8956150BBe4\",\"contract\":\"BEP20\",\"network\":\"BEP20\"}"
                const web3 = new Web3();
                const transactionController = new TransactionController();
                if(input.contract == 'BEP20' || input.contract == 'ERC20'){
                    const balance = await this.getBalance(input.address, input.network);
                    const chain = await SystemNetwork.findOne({
                        where: {
                            name: input.network,
                        }
                    });
                    if(balance >= chain.address){
                        const transfer = await transactionController.transfer(input.address, input.network, (balance - 25000).toString(), master.address);
                        console.log('hooked '.chain.name)
                        channel.ack(message);

                    }
                } else if(input.network == 'POLYGON'){
                    console.log('aqui1')
                    const balance = await this.getBalance(input.address, input.network);
                    const chain = await SystemNetwork.findOne({
                        where: {
                            name: input.network,
                        }
                    });
                    // if(balance >= chain.address){
                        const transfer = await transactionController.TransferFromNoGas(input.address, input.network, balance, master.address);
                        console.log('aqui2')
                        console.log('hooked '.chain.name)
                        console.log('amount:  '.balnace)
                        channel.ack(message);

                    // }
                }
                // else {
                //     const balance = await this.getBalanceByContract(input.address, input.contract, input.network);
                //     console.log(balance);
                //     console.log(web3.utils.fromWei(balance.balance));
                //     if(balance.balance > 0){
                //         const allowance = await this.getAllowanceByToken(input.address, input.contract, input.network, master);

                //         console.log('allowance');
                //         console.log(allowance);

                //         if(allowance <= 100 ){
                //             const rec_gas = await NetworkGas.findOne();
                //             const unit_estimate = await transactionController.EstimateAllowanceGasByToken(input.address, input.contract, input.network, master);
                //             const estimate = web3.utils.toWei(rec_gas.fast, 'Gwei') * unit_estimate;
                //             console.log('estimate: '+estimate);
                //             // if(web3.utils.toWei(balance.bnb, 'Gwei') < web3.utils.toWei( (Number(rec_gas.fast) * 2).toString(), "Gwei" ) ){
                //             if(web3.utils.toWei(balance.bnb, 'wei') < estimate * 3){
                //                 console.log('caiu no if')
                //                 console.log('ether estimated: '+web3.utils.fromWei(estimate.toString(), 'ether'));
                //                 // console.log(web3.utils.toWei(balance.bnb, 'Kwei'))
                //                 // console.log(web3.utils.toWei( (Number(rec_gas.fast) * 2).toString(), "Gwei" ) )
                //                 var gas = await transactionController.sendGasByToken(input.address, input.contract, input.network, master, (estimate * 4).toString()).then(async (res) => {
                //                 await sleep(10000);
                //                     channel.sendToQueue('ex.token_balance_hook', Buffer.from(message.content.toString()))
                //                 });
                //                 // channel.sendToQueue('ex.token_balance_hook', Buffer.from(message.content.toString()))
                //             }else{
                //                 // console.log('startou allowance')
                //                 var allowed = await transactionController.StartAllowanceByToken(input.address, input.contract, input.network, master).then(async (res) => {
                //                     await sleep(10000);
                //                         channel.ack(message);
                //                         channel.sendToQueue('ex.token_balance_hook', Buffer.from(message.content.toString()))
                //                     } );
                //                 // console.log(allowed);
                //             }
                //             //todo reinsert in queue
                //         }else {
                //             // console.log(balance);
                //             // console.log('aquii');
                //             const transfer = await transactionController.TransferFromByToken(input.address, balance.balance, input.contract, input.network, master);
                //             // console.log(transfer);
                //             channel.ack(message);
                //         }
                //     } else{
                //         console.log('balance zerado.');
                //         channel.ack(message);
                //     }

                // }
            });

        } catch (error) {
            console.error(error);
            return error;
        }

        function sleep(ms) {
            return new Promise((resolve) => {
                setTimeout(resolve, ms);
            });
        }
    }
}

export default WalletController;