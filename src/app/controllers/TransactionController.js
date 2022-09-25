import Web3 from "web3";
import Wallet from "../models/Wallet.js";
import SystemWallet from "../models/SystemWallet.js";
import Token from "../models/Token.js";
import SystemNetwork from "../models/SystemNetwork.js";
import NetworkGas from "../models/NetworkGas.js";


// import Https from "Https"`

class TransactionController {

    async signTx(sender, receiver, amount, abbr) {
        try {
            var contractAddress = await this.getContract(abbr)
            var contractAbi = await this.getABI(abbr)
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

    async TransferFrom(client_address, amount, abbr) {
        var contractAddress = await this.getContract(abbr)
        var contractAbi = await this.getABI(abbr)

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
            gas: web3.utils.toHex(1000000),
            gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'Gwei')),
            data: contractData,
        }

        const signed = await web3.eth.accounts.signTransaction(rawTransaction, pk.priv)
        const responseData = await web3.eth.sendSignedTransaction(signed.rawTransaction)

        console.log(responseData)
        return responseData
    }

    async TransferFromByToken(address, amount, contract, network, master) {
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

        var web3 = new Web3(chain.provider);
        web3.defaultAccount = master.address

        const myContract = new web3.eth.Contract(JSON.parse(token.contract_abi), token.contract_address);

        const contractData = await myContract.methods.transferFrom(address, master.address,
                amount,
            ).encodeABI();

        const rawTransaction = {
            from: master.address,
            to: token.contract_address,
            gas: web3.utils.toHex(web3.utils.toWei('50', 'Kwei')),
            gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'Gwei')),
            data: contractData,
        }

        const signed = await web3.eth.accounts.signTransaction(rawTransaction, master.priv)
        const responseData = await web3.eth.sendSignedTransaction(signed.rawTransaction)

        console.log(responseData)
        return responseData
    }

    async TransferTo(target_address, amount, abbr) {

        var contractAddress = await this.getContract(abbr)
        var contractAbi = await this.getABI(abbr)

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
            gas: web3.utils.toHex(1000000),
            gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'Gwei')),
            data: contractData,
        }

        const signed = await web3.eth.accounts.signTransaction(rawTransaction, pk.priv)
        const responseData = await web3.eth.sendSignedTransaction(signed.rawTransaction)

        console.log(responseData)
        return {ok: true, data: responseData}
    }


    async TransferToByToken(target_address, amount, contract, network, master) {
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

        var web3 = new Web3(chain.provider);
        web3.defaultAccount = master.address
        const myContract = new web3.eth.Contract(JSON.parse(token.contract_abi), token.contract_address);

        console.log(amount);

        const contractData = await myContract.methods.transfer(
                target_address,
                web3.utils.toHex(web3.utils.toWei(amount, 'ether')),
            ).encodeABI();

        const rawTransaction = {
            from: master.address,
            to: token.contract_address,
            // maxFeePerGas: 250000000000,
            // maxPriorityFeePerGas: 250000000000,
            // gas: 21000,
            gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'Gwei')),
            gas: web3.utils.toHex(1000000),
            data: contractData,
        }

        const signed = await web3.eth.accounts.signTransaction(rawTransaction, master.priv)
        const responseData = await web3.eth.sendSignedTransaction(signed.rawTransaction)

        return {ok: true, data: responseData}
    }

    async StartAllowanceByToken(address, contract, network, master) {
        const pk = await Wallet.findAll({
            where: {
                address: address,
            }
        });
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

        var web3 = new Web3(chain.provider);
        web3.defaultAccount = pk[0].address

        const myContract = new web3.eth.Contract(JSON.parse(token.contract_abi), token.contract_address);

        var privKey = pk[0].priv
        var privKey = privKey.substr(2)

        var contractData = ''

            contractData = await myContract.methods.approve(master.address, '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').encodeABI();

        const rawTransaction = {
            to: contract,
            gas: web3.utils.toHex(50000),
            gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'Gwei')),
            data: contractData,
        }

        const signed = await web3.eth.accounts.signTransaction(rawTransaction, pk[0].priv)
        const responseData = await web3.eth.sendSignedTransaction(signed.rawTransaction)

        console.log(responseData)
        return responseData
    }

    async EstimateAllowanceGasByToken(address, contract, network, master) {
        const pk = await Wallet.findAll({
            where: {
                address: address,
            }
        });
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

        var web3 = new Web3(chain.provider);
        web3.defaultAccount = pk[0].address

        const myContract = new web3.eth.Contract(JSON.parse(token.contract_abi), token.contract_address);

        var privKey = pk[0].priv
        var privKey = privKey.substr(2)

        var contractData = ''
            contractData = await myContract.methods.approve(master.address, '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').estimateGas({from:pk[0].address});
        // const rawTransaction = {
        //     to: contract,
        //     gas: web3.utils.toHex(50000),
        //     gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'Gwei')),
        //     data: contractData,
        // }

        // const signed = await web3.eth.accounts.signTransaction(rawTransaction, pk[0].priv)
        // const responseData = await web3.eth.sendSignedTransaction(signed.rawTransaction)

        // console.log(responseData)
        return contractData
    }

    async StartApprove(client_address, abbr) {
        var contractAddress = await this.getContract(abbr)
        var contractAbi = await this.getABI(abbr)

        const pk = await Wallet.findAll({
            where: {
                address: client_address,
            }
        });
        console.log('')

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

        var contractData = ''
        if(abbr == 'NFT'){
            contractData = await myContract.methods.setApprovalForAll(master.address, 'true').encodeABI();
        } else {
            contractData = await myContract.methods.approve(master.address, '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').encodeABI();
        }

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

    async sendGasByToken(address, contract, network, master, value) {
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
        const rec_gas = await NetworkGas.findOne();

        const web3 = new Web3(chain.provider);
        web3.defaultAccount = master.address

        const master_balance = await web3.eth.getBalance(master.address);
        console.log('master_balance: '+ web3.utils.fromWei(master_balance));
        console.log('gas to be sended: '+ web3.utils.fromWei(value));
        if(web3.utils.fromWei(master_balance) > web3.utils.fromWei(value)){
            const rawTransaction = {
                to: address,
                gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'Gwei')),
                gas: web3.utils.toHex(50000),
                value: web3.utils.toHex(value),
            }

            const signed = await web3.eth.accounts.signTransaction(rawTransaction, master.priv)
            const responseData = await web3.eth.sendSignedTransaction(signed.rawTransaction)

            console.log(responseData)
            return responseData
        } else{
            throw new Error('Saldo na carteira master insuficiente para enviar gas!')
        }
    }

    async checkTransactions(abbr) {
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
        var abi = ''
        switch (abbr) {
            case 'USDT':
                abi = process.env.USDT_ABI_ENCODED
                break;
            case 'NFT':
                abi = process.env.NFT_CONTRACT_ABI
                break;
            case 'BTCC':
                abi = process.env.BTCC_CONTRACT_ABI
                break;
            default:
                abi = process.env.USDT_ABI_ENCODED
                break;
            }

            return await JSON.parse(abi)
    }
}

export default TransactionController;