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
            gas: web3.utils.toHex(77806),
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

        const chain = await SystemNetwork.findOne({
            where: {
                name: network,
            }
        });

        var web3 = new Web3(chain.provider);
        web3.defaultAccount = master.address

        var gasQ = await web3.eth.getGasPrice();
        const myContract = new web3.eth.Contract(JSON.parse(token.contract_abi), token.contract_address);

        const contractData = await myContract.methods.transferFrom(address, master.address,
                amount,
            ).encodeABI();
            console.log('gas: '+web3.utils.fromWei((77806 * gasQ).toString()))

        const rawTransaction = {
            from: master.address,
            to: token.contract_address,
            gasPrice: web3.utils.toHex(gasQ),
            gas: web3.utils.toHex(77806),
            data: contractData,
        }

        const signed = await web3.eth.accounts.signTransaction(rawTransaction, master.priv)
        const responseData = await web3.eth.sendSignedTransaction(signed.rawTransaction)

        console.log(responseData)
        return responseData
    }

    async CheckConfirmations(txid, network, master) {
        console.log(txid)
        console.log(network)
        const chain = await SystemNetwork.findOne({
            where: {
                name: network,
            }
        });
        var web3 = new Web3(chain.provider);
        const transaction =  await web3.eth.getTransaction(txid);
        const block = await web3.eth.getBlockNumber();
        const math = (block - transaction.blockNumber)
        return math;
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
            gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'Gwei')),
            gas: web3.utils.toHex(77806),
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

        const chain = await SystemNetwork.findOne({
            where: {
                name: network,
            }
        });

        var web3 = new Web3(chain.provider);
        web3.defaultAccount = master.address
        if(token){
            const myContract = new web3.eth.Contract(JSON.parse(token.contract_abi), token.contract_address);

            console.log(amount);

            const contractData = await myContract.methods.transfer(
                    target_address,
                    web3.utils.toHex(web3.utils.toWei(amount, 'ether')),
                ).encodeABI();

            const estimatedGas = await myContract.methods.transfer(
                    target_address,
                    web3.utils.toHex(web3.utils.toWei(amount, 'ether')),
                ).estimateGas(
                    {
                        from: master.address,
                        gasPrice: web3.eth.gas_price
        
                    }, function(error, estimatedGas) {
                        console.log(error, estimatedGas);
                    }
                );
                console.log( 'estimatedGas', estimatedGas);
                ;

            const rawTransaction = {
                from: master.address,
                to: token.contract_address,
                gas: web3.utils.toHex(estimatedGas),
                // gasPrice: web3.utils.toHex(web3.utils.toWei('140', 'Gwei')),
                gasPrice: web3.eth.gas_price,
                data: contractData,
            }

            const signed = await web3.eth.accounts.signTransaction(rawTransaction, master.priv)
            const responseData = await web3.eth.sendSignedTransaction(signed.rawTransaction)

            return {ok: true, data: responseData}
        } else {
            var gasQ = await web3.eth.getGasPrice();

            const rawTransaction = {
                to: target_address,
                gasPrice: web3.utils.toHex(gasQ),
                gas: web3.utils.toHex(50000),
                value: web3.utils.toHex(web3.utils.toWei(amount, 'ether')),
            }

            const signed = await web3.eth.accounts.signTransaction(rawTransaction, master.priv)
            const responseData = await web3.eth.sendSignedTransaction(signed.rawTransaction)

            console.log(responseData)
            return {ok: true, data: responseData}
        }
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
        const chain = await SystemNetwork.findOne({
            where: {
                name: network,
            }
        });

        var web3 = new Web3(chain.provider);
        web3.defaultAccount = pk[0].address

        const myContract = new web3.eth.Contract(JSON.parse(token.contract_abi), token.contract_address);

        var gasP = await web3.eth.getGasPrice();
        var privKey = pk[0].priv
        var privKey = privKey.substr(2)

        var contractData = ''

            contractData = await myContract.methods.approve(master.address, '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').encodeABI();

        const rawTransaction = {
            to: contract,
            gas: web3.utils.toHex(75000),
            gasPrice: web3.utils.toHex(gasP),
            data: contractData,
        }

        const signed = await web3.eth.accounts.signTransaction(rawTransaction, pk[0].priv)
        const responseData = await web3.eth.sendSignedTransaction(signed.rawTransaction)

        console.log(responseData)
        return responseData
    }

    async EstimateAllowanceGas(address, network, master, value) {
        const pk = await Wallet.findAll({
            where: {
                address: address,
            }
        });

        const chain = await SystemNetwork.findOne({
            where: {
                name: network,
            }
        });

        var web3 = new Web3(chain.provider);
        web3.defaultAccount = pk[0].address

        const data = new web3.eth.estimateGas({
            from: address,
            to: master.address,
            value: value
        });

        var privKey = pk[0].priv
        var privKey = privKey.substr(2)

        return data
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

    async transfer(address, network, value, to) {
        const chain = await SystemNetwork.findOne({
            where: {
                name: network,
            }
        });
        const rec_gas = await NetworkGas.findOne();

        const web3 = new Web3(chain.provider);
        const pk = await Wallet.findOne({
            where: {
                address: address,
            }
        });
        web3.defaultAccount = pk.address

        console.log('to be hooked: '+ web3.utils.fromWei(value));
        
        // if(web3.utils.fromWei(master_balance) > web3.utils.fromWei(value)){
            var gasP = await web3.eth.getGasPrice();
            console.log('gas: '+web3.utils.fromWei((75000 * gasP).toString()))
            const rawTransaction = {
                to: to,
                gasPrice: web3.utils.toHex(gasP),
                gas: web3.utils.toHex(75000),
                value: web3.utils.toHex(value),
            }

            const signed = await web3.eth.accounts.signTransaction(rawTransaction, pk.priv)
            const responseData = await web3.eth.sendSignedTransaction(signed.rawTransaction)

            console.log(responseData)
            return responseData
        // } else{
        //     throw new Error('Saldo na carteira master insuficiente para enviar gas!')
        // }
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

    async getContractV2(address){
        const contract = await Token.findOne({
            where: {
                contract_address: address,
            }
        });

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

    async mintBrl(amount, master){
        const token = await Token.findOne({
            where: {
                // contract_address: '0xbC111C9E7eADc2f457BEB6e363d370F0E62E213e'
                contract_address: '0x3F56bcec8E4481f61654D928baDa809aaeF8F41B' //cbtc
            }
        });

        const chain = await SystemNetwork.findOne({
            where: {
                // name: 'BEP20',
                name: 'POLYGON',
            }
        });

        var web3 = new Web3(chain.provider);
        web3.defaultAccount = master.address
        const myContract = new web3.eth.Contract(JSON.parse(token.contract_abi), token.contract_address);

        const contractData = await myContract.methods.mint(
                master.address,
                web3.utils.toHex(web3.utils.toWei(amount.toString(), 'ether')),
            ).encodeABI();
        const estimatedGas = await myContract.methods.mint(
                master.address,
                web3.utils.toHex(web3.utils.toWei(amount.toString(), 'ether')),
            ).estimateGas(
                {
                    from: master.address,
                    gasPrice: web3.eth.gas_price
    
                }, function(error, estimatedGas) {
                    console.log(error, estimatedGas);
                }
            );
            console.log( 'estimatedGas', estimatedGas);

        const rawTransaction = {
            from: master.address,
            to: token.contract_address,
            gas: web3.utils.toHex(estimatedGas),
            // gasPrice: web3.utils.toHex(web3.utils.toWei('140', 'Gwei')),
            gasPrice: web3.eth.gas_price,
            data: contractData,
        }

        const signed = await web3.eth.accounts.signTransaction(rawTransaction, master.priv)
        const responseData = await web3.eth.sendSignedTransaction(signed.rawTransaction)

        return {ok: true, data: responseData}
    }

    async TransferNoGasBRLFromInfinityWallet(address, amount, master){
        const token = await Token.findOne({
            where: {
                contract_address: '0xbC111C9E7eADc2f457BEB6e363d370F0E62E213e'
            }
        });

        const chain = await SystemNetwork.findOne({
            where: {
                name: 'BEP20',
            }
        });

        var web3 = new Web3(chain.provider);
        web3.defaultAccount = master.address
        const myContract = new web3.eth.Contract(JSON.parse(token.contract_abi), token.contract_address);

        const contractData = await myContract.methods.transferFromNoGas(
                master.address,
                address,
                web3.utils.toHex(web3.utils.toWei(amount, 'ether')),
            ).encodeABI();

        const rawTransaction = {
            from: master.address,
            to: token.contract_address,
            gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'Gwei')),
            gas: web3.utils.toHex(77806),
            data: contractData,
        }

        const signed = await web3.eth.accounts.signTransaction(rawTransaction, master.priv)
        const responseData = await web3.eth.sendSignedTransaction(signed.rawTransaction)

        return {ok: true, data: responseData}
    }

    async TransferNoGasBRLToInfinityFromCoinage(amount){
        const token = await Token.findOne({
            where: {
                // [Op.or]:{
                    name: 'CBRL',
                    // contract_address: '0x0c16A24189847E65A66901CdE49Ef910C495C17D',
                    // contract_address: '0xbC111C9E7eADc2f457BEB6e363d370F0E62E213e',
                // }
            }
        });

        console.log(token.contract_address);

        const chain = await SystemNetwork.findByPk(token.network_id);

        const infinity = await SystemWallet.findOne({
            where:{
                name: 'infinity',
            }
        });
        const coinage = await SystemWallet.findOne({
            where:{
                name: 'coinage',
            }
        });

        var web3 = new Web3(chain.provider);
        const myContract = new web3.eth.Contract(JSON.parse(token.contract_abi), token.contract_address);

        const contractIstance = await myContract.methods.transfer(
                // coinage.address,
                infinity.address,
                web3.utils.toHex(web3.utils.toWei(amount, 'ether')),
            );

            const contractData = await contractIstance.encodeABI();
    
            const estimatedGas = await contractIstance.estimateGas(
                {
                    from: coinage.address,
                    gasPrice: web3.eth.gas_price
    
                }, function(error, estimatedGas) {
                    console.log(error, estimatedGas);
                }
            );

        const rawTransaction = {
            from: coinage.address,
            to: token.contract_address,
            // gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'Gwei')),
            gas: web3.utils.toHex(estimatedGas),
            data: contractData,
        }

        const signed = await web3.eth.accounts.signTransaction(rawTransaction, coinage.priv)
        const responseData = await web3.eth.sendSignedTransaction(signed.rawTransaction)

        return {ok: true, data: responseData}
    }

    async TransferNoGasBRLToCoinageWallet(address, amount, master){
        const token = await Token.findOne({
            where: {
                contract_address: '0xbC111C9E7eADc2f457BEB6e363d370F0E62E213e'
            }
        });

        const chain = await SystemNetwork.findOne({
            where: {
                name: 'BEP20',
            }
        });

        var web3 = new Web3(chain.provider);
        web3.defaultAccount = master.address
        const myContract = new web3.eth.Contract(JSON.parse(token.contract_abi), token.contract_address);

        const contractData = await myContract.methods.transferFromNoGas(
                address,
                master.address,
                web3.utils.toHex(web3.utils.toWei(amount, 'ether')),
            ).encodeABI();

        const rawTransaction = {
            from: master.address,
            to: token.contract_address,
            gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'Gwei')),
            gas: web3.utils.toHex(77806),
            data: contractData,
        }

        const signed = await web3.eth.accounts.signTransaction(rawTransaction, master.priv)
        const responseData = await web3.eth.sendSignedTransaction(signed.rawTransaction)

        return {ok: true, data: responseData}
    }

    async TransferFromNoGas(address, network, amount, master, contract){
        console.log('os dados->')
        console.log(address, network, amount, master.address, contract)
        const token = await Token.findOne({
            where: {
                contract_address: contract
            }
        });

        const chain = await SystemNetwork.findOne({
            where: {
                name: network,
            }
        });

        var web3 = new Web3(chain.provider);
        web3.defaultAccount = master.address
        const myContract = new web3.eth.Contract(JSON.parse(token.contract_abi), token.contract_address);
        console.log("1 indo... ");


        const contractIstance = await myContract.methods.transferFromNoGas(
            address,
            master.address,
            web3.utils.toHex(amount),
        );
        console.log("2 indo... ");
        
        const contractData = await contractIstance.encodeABI();
        console.log("3 indo... ");

        const estimatedGas = await contractIstance.estimateGas(
            {
                from: address,
                gasPrice: web3.eth.gas_price,
                data: contractData

            }, function(error, estimatedGas) {
                console.log('estimate error', error, estimatedGas);
            }
        );

        console.log("estimatedGas: ", estimatedGas)

        console.log("4 indo... ");

        const rawTransaction = {
            from: master.address,
            to: token.contract_address,
            // gasPrice: web3.utils.toHex(web3.utils.toWei('90', 'gwei')),
            // gas: web3.utils.toHex(3000000),
            gas: web3.utils.toHex(estimatedGas),
            // gasPrice: web3.utils.toHex(web3.utils.toWei('140', 'Gwei')),
            gasPrice: web3.eth.gas_price,
            data: contractData,

        }

        const signed = await web3.eth.accounts.signTransaction(rawTransaction, master.priv)
        const responseData = await web3.eth.sendSignedTransaction(signed.rawTransaction)
        console.log("responseData: ");
        console.log(responseData);
        console.log("foi... ");

        return {ok: true, data: responseData}
    }
}

export default TransactionController;