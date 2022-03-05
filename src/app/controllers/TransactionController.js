import Web3 from "web3";
import Wallet from "../models/Wallet.js";
import SystemWallet from "../models/SystemWallet.js";
// import Https from "Https"`

class TransactionController {

    async signTx(sender, receiver, amount, coin = 'USDT') {
        try {
            if(coin == 'USDT'){
                const contractAbi = JSON.parse(process.env.USDT_ABI_ENCODED);
                const contractAddress = process.env.USDT_ADDRESS;
            } else if(coin == 'BTCC'){
                const contractAbi = JSON.parse(process.env.BTCC_CONTRACT_ABI);
                const contractAddress = process.env.BTCC_CONTRACT_ADDRESS;
            }
            const pk = await Wallet.findAll({
                where: {
                    address: sender,
                }
            });

            var web3 = new Web3(process.env.PROVIDER_URL);
            web3.defaultAccount = pk[0].address
            console.log(web3.defaultAccount)

            const myContract = new web3.eth.Contract(contractAbi, contractAddress);

            var privKey = pk[0].priv
            var privKey = privKey.substr(2)
            // const privateKey = Buffer.from(privKey, 'hex');

            const contractData = await myContract.methods.transfer(receiver, web3.utils.toHex(
                web3.utils.toWei(amount))).encodeABI();

            const rawTransaction = {
                from: sender,
                to: contractAddress,
                gas: web3.utils.toHex(3000000),
                gasPrice: 18e9,
                data: contractData,
            }

            const signed = await web3.eth.accounts.signTransaction(rawTransaction, pk[0].priv)
            const responseData = await web3.eth.sendSignedTransaction(signed.rawTransaction)

            console.log(responseData)
            return responseData
        } catch (error) {
            console.log('error')
            console.log(error.message )
            let message = JSON.parse(err.message.substring(56).trim().replace("'", "")).value.data.data;
            console.log(message[Object.keys(message)[0]].reason);
            return error
        }
    }

    async TransferFrom(client_address, amount, coin = 'USDT') {
        // const contractAbi = JSON.parse(process.env.USDT_ABI_ENCODED);
        // const contractAddress = process.env.USDT_ADDRESS;

        if(coin == 'USDT'){
            const contractAbi = JSON.parse(process.env.USDT_ABI_ENCODED);
            const contractAddress = process.env.USDT_ADDRESS;
        } else if(coin == 'BTCC'){
            const contractAbi = JSON.parse(process.env.BTCC_CONTRACT_ABI);
            const contractAddress = process.env.BTCC_CONTRACT_ADDRESS;
        }

        const pk = await SystemWallet.findOne({
            where: {
                name: 'master',
            }
        });

        var web3 = new Web3(process.env.PROVIDER_URL);
        web3.defaultAccount = pk.address

        const myContract = new web3.eth.Contract(contractAbi, contractAddress);

        const contractData = await myContract.methods.transferFrom(client_address, pk.address,
                web3.utils.toHex(web3.utils.toWei(amount, 'ether')),
            ).encodeABI();

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

    async TransferTo(target_address, amount, coin = 'USDT') {
        const contractAbi = JSON.parse(process.env.USDT_ABI_ENCODED);
        const contractAddress = process.env.USDT_ADDRESS;
        const pk = await SystemWallet.findOne({
            where: {
                name: 'master',
            }
        });

        var web3 = new Web3(process.env.PROVIDER_URL);
        web3.defaultAccount = pk.address

        const myContract = new web3.eth.Contract(contractAbi, contractAddress);

        const contractData = await myContract.methods.transfer(
                target_address,
                web3.utils.toHex(web3.utils.toWei(amount, 'ether')),
            ).encodeABI();

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
        return {ok: true, data: responseData}
    }

    async StartApprove(client_address, coin = 'USDT') {
        const contractAbi = JSON.parse(process.env.USDT_ABI_ENCODED);
        const contractAddress = process.env.USDT_ADDRESS;
        const pk = await Wallet.findAll({
            where: {
                address: client_address,
            }
        });
        
        const master = await SystemWallet.findOne({
            where: {
                name: 'master',
            }
        });

        var web3 = new Web3(process.env.PROVIDER_URL);
        web3.defaultAccount = pk[0].address

        const myContract = new web3.eth.Contract(contractAbi, contractAddress);

        var privKey = pk[0].priv
        var privKey = privKey.substr(2)

        const contractData = await myContract.methods.approve(master.address, '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').encodeABI();

        const rawTransaction = {
            to: contractAddress,
            gas: web3.utils.toHex(50000),
            gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'Gwei')),
            data: contractData,
        }

        const signed = await web3.eth.accounts.signTransaction(rawTransaction, pk[0].priv)
        const responseData = await web3.eth.sendSignedTransaction(signed.rawTransaction)

        console.log(responseData)
        return responseData
    }

    async sendGas(target, amount, coin = 'USDT') {
            const pk = await SystemWallet.findOne(
                {   where: {
                        name: 'master'
                    }
                }
            );

            var web3 = new Web3(process.env.PROVIDER_URL);
            web3.defaultAccount = pk.address

            const rawTransaction = {
                to: target,
                gas: web3.utils.toHex(50000),
                gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'Gwei')),
                value: web3.utils.toHex(web3.utils.toWei(amount, 'ether')),
            }

            const signed = await web3.eth.accounts.signTransaction(rawTransaction, pk.priv)
            const responseData = await web3.eth.sendSignedTransaction(signed.rawTransaction)

            console.log(responseData)
            return responseData
    }

    async checkTransactions(coin = 'USDT') {
        const pk = await SystemWallet.findOne(
            {
                where: {
                    name: 'master'
                }
            }
        );
        //const https = new Https()
        const options = {
            hostname: "https://api-testnet.bscscan.com",
            port: 443,
            path: "/api?module=account&action=tokentx&address=.'+pk.address+'&startblock=0&endblock=2500000&sort=asc&apikey='+process.env.BSC_TOKEN"
        }


        var web3 = new Web3(process.env.PROVIDER_URL);
        web3.defaultAccount = pk.address

        return await web3.eth.subscribe()
    }
}

export default TransactionController;