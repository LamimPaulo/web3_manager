import Web3 from "web3";
import Wallet from "../models/Wallet.js";
import SystemWallet from "../models/SystemWallet.js";

class TransactionController {

    async signTx(sender, receiver, amount) {
        try {
            const contractAbi = JSON.parse(process.env.USDT_ABI_ENCODED);
            const contractAddress = process.env.USDT_ADDRESS;
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

    async TransferFrom(client_address, amount) {
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

    async StartApprove(client_address) {
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

    async sendGas(target, amount) {
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
}

export default TransactionController;