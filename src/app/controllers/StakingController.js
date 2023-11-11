import Web3 from "web3";
import Wallet from "../models/Wallet.js";
import SystemWallet from "../models/SystemWallet.js";
import Token from "../models/Token.js";
import Staking from "../models/Staking.js";
import SystemNetwork from "../models/SystemNetwork.js";
import NetworkGas from "../models/NetworkGas.js";
import { response } from "express";

// import Https from "Https"`

class StakingController {

    // async TestController(name) {

    //     const pk = await SystemWallet.findOne(
    //         {
    //             where: {
    //                 name: 'coinage'
    //             }
    //         }
    //     );

    //     console.log(pk)

    //     const contract = await Token.findByPk(5);
    //     const chain = await SystemNetwork.findByPk(3);

    //     var web3 = new Web3(chain.provider);

    //     const myContract = new web3.eth.Contract(JSON.parse(contract.contract_abi), contract.contract_address);

    //     const contractData = await myContract.methods.grantRole('0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6', '0xD11c920992a1Fab90Ac41ed2B5D618dD9c1a80Ec').encodeABI();
        
    //     const rawTransaction = {
    //         from: pk.address,
    //         to: contract.contract_address,
    //         gas: web3.utils.toHex(77806),
    //         gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'Gwei')),
    //         data: contractData,
    //     }

    //     const signed = await web3.eth.accounts.signTransaction(rawTransaction, pk.priv)
    //     const responseData = await web3.eth.sendSignedTransaction(signed.rawTransaction)


    //     return (responseData);
    // }

    //grantRole stake token => contract
    // async TestController(name) {

    //     const pk = await SystemWallet.findOne(
    //         {
    //             where: {
    //                 name: 'coinage'
    //             }
    //         }
    //     );

    //     console.log(pk)

    //     const contract = await Token.findByPk(4);
    //     const chain = await SystemNetwork.findByPk(3);

    //     var web3 = new Web3(chain.provider);

    //     const myContract = new web3.eth.Contract(JSON.parse(contract.contract_abi), contract.contract_address);

    //     const contractData = await myContract.methods.grantRole('0x8502233096d909befbda0999bb8ea2f3a6be3c138b9fbf003752a4c8bce86f6c', '0xBcB585BC64A0Efee0C2e813ec51D003D3A059D7f').encodeABI();
        
    //     const rawTransaction = {
    //         from: pk.address,
    //         to: contract.contract_address,
    //         gas: web3.utils.toHex(77806),
    //         gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'Gwei')),
    //         data: contractData,
    //     }

    //     const signed = await web3.eth.accounts.signTransaction(rawTransaction, pk.priv)
    //     const responseData = await web3.eth.sendSignedTransaction(signed.rawTransaction)


    //     return (responseData);
    // }

    // grantRole
    // async TestController(name) {

    //     const pk = await SystemWallet.findOne(
    //         {
    //             where: {
    //                 name: 'coinage'
    //             }
    //         }
    //     );

    //     console.log(pk)

    //     const contract = await Token.findByPk(4);
    //     const chain = await SystemNetwork.findByPk(3);

    //     var web3 = new Web3(chain.provider);

    //     const myContract = new web3.eth.Contract(JSON.parse(contract.contract_abi), contract.contract_address);

    //     const contractData = await myContract.methods.grantRole('0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6', '0xBcB585BC64A0Efee0C2e813ec51D003D3A059D7f').encodeABI();
        
    //     const rawTransaction = {
    //         from: pk.address,
    //         to: contract.contract_address,
    //         gas: web3.utils.toHex(77806),
    //         gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'Gwei')),
    //         data: contractData,
    //     }

    //     const signed = await web3.eth.accounts.signTransaction(rawTransaction, pk.priv)
    //     const responseData = await web3.eth.sendSignedTransaction(signed.rawTransaction)

    
    //     // return web3.utils.fromWei(contractData, 'ether');
    //     // 0x6B0Cf269c9BB2B2fbfb6314221ABa65B3250f4a2


    //     return (responseData);
    // }
    
    //MINTER ROLE
    // async TestController(name) {

    //     const pk = await SystemWallet.findOne(
    //         {
    //             where: {
    //                 name: 'coinage'
    //             }
    //         }
    //     );

    //     const contract = await Token.findByPk(5);
    //     const chain = await SystemNetwork.findByPk(3);

    //     var web3 = new Web3(chain.provider);

    //     const myContract = new web3.eth.Contract(JSON.parse(contract.contract_abi), contract.contract_address);
    //     const contractData = await myContract.methods.MINTER_ROLE().call();
        
    //     return contractData; //salvar a response
    // }

    async getContract(address){
        const contract = await Staking.findOne({
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

    //read - 

    async contractBalanceOf(contract_address, address){
        const contract = await this.getContract(contract_address)
        const chain = await SystemNetwork.findByPk(contract.network_id);

        var web3 = new Web3(chain.provider);

        const myContract = new web3.eth.Contract(JSON.parse(contract.contract_abi), contract.contract_address);

        const contractData = await myContract.methods.balanceOf(address).call();

        return web3.utils.fromWei(contractData, 'ether');
    }

    async contractCheckAccumulatedReward(contract_address, address){
        const contract = await this.getContract(contract_address)
        const chain = await SystemNetwork.findByPk(contract.network_id);

        var web3 = new Web3(chain.provider);

        const myContract = new web3.eth.Contract(JSON.parse(contract.contract_abi), contract.contract_address);

        const contractData = await myContract.methods.checkAccumulatedReward(address).call();

        // return contractData;
        return web3.utils.fromWei(contractData, 'ether');
    }

    async contractCheckReward(contract_address, address){
        const contract = await this.getContract(contract_address)
        const chain = await SystemNetwork.findByPk(contract.network_id);

        var web3 = new Web3(chain.provider);

        const myContract = new web3.eth.Contract(JSON.parse(contract.contract_abi), contract.contract_address);

        const contractData = await myContract.methods.checkReward(address).call();

        // return contractData;
        
        return web3.utils.fromWei(contractData, 'ether');
    }

    async contractMinValueStake(contract_address){
        const contract = await this.getContract(contract_address)
        const chain = await SystemNetwork.findByPk(contract.network_id);

        var web3 = new Web3(chain.provider);

        const myContract = new web3.eth.Contract(JSON.parse(contract.contract_abi), contract.contract_address);

        const contractData = await myContract.methods.minValueStake().call();

        // return contractData;
        return web3.utils.fromWei(contractData, 'ether');
    }

    async contractPercentageOfAPM(contract_address){
        const contract = await this.getContract(contract_address)
        const chain = await SystemNetwork.findByPk(contract.network_id);

        var web3 = new Web3(chain.provider);

        const myContract = new web3.eth.Contract(JSON.parse(contract.contract_abi), contract.contract_address);

        const contractData = await myContract.methods.percentageOfAPM().call();

        return contractData;
    }
    
    async contractPercentageOfBonus(contract_address){
        const contract = await this.getContract(contract_address)
        const chain = await SystemNetwork.findByPk(contract.network_id);

        var web3 = new Web3(chain.provider);

        const myContract = new web3.eth.Contract(JSON.parse(contract.contract_abi), contract.contract_address);

        const contractData = await myContract.methods.percentageOfBonus().call();

        return contractData;
    }

    async contractPercentageOfPenalty(contract_address){
        const contract = await this.getContract(contract_address)
        const chain = await SystemNetwork.findByPk(contract.network_id);

        var web3 = new Web3(chain.provider);

        const myContract = new web3.eth.Contract(JSON.parse(contract.contract_abi), contract.contract_address);

        const contractData = await myContract.methods.percentageOfPenalty().call();

        return contractData;
    }

    async contractRewardSupply(contract_address){
        const contract = await this.getContract(contract_address)
        const chain = await SystemNetwork.findByPk(contract.network_id);

        var web3 = new Web3(chain.provider);

        const myContract = new web3.eth.Contract(JSON.parse(contract.contract_abi), contract.contract_address);

        const contractData = await myContract.methods.rewardSupply().call();

        return web3.utils.fromWei(contractData, 'ether');
    }

    async contractTotalSupply(contract_address){
        const contract = await this.getContract(contract_address)
        const chain = await SystemNetwork.findByPk(contract.network_id);

        var web3 = new Web3(chain.provider);

        const myContract = new web3.eth.Contract(JSON.parse(contract.contract_abi), contract.contract_address);

        const contractData = await myContract.methods.totalSupply().call();

        return web3.utils.fromWei(contractData, 'ether');
    }


    //write

    async contractAccumulateReward(contract_address, master) {

        const contract = await this.getContract(contract_address)
  
        const chain = await SystemNetwork.findByPk(contract.network_id);
        var web3 = new Web3(chain.provider);
        web3.defaultAccount = master.address

        const myContract = new web3.eth.Contract(JSON.parse(contract.contract_abi), contract.contract_address);

        const contractData = await myContract.methods.accumulateReward().encodeABI();
        const estimatedGas = await myContract.methods.accumulateReward().estimateGas(
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
            to: contract.contract_address,
            gas: web3.utils.toHex(estimatedGas),
            // gasPrice: web3.utils.toHex(web3.utils.toWei('140', 'Gwei')),
            gasPrice: web3.eth.gas_price,
            data: contractData,
        }

        const signed = await web3.eth.accounts.signTransaction(rawTransaction, master.priv)
        const responseData = await web3.eth.sendSignedTransaction(signed.rawTransaction)


        return (responseData);
    }

    async contractClaimAllReward(contract_address, master) {

        const contract = await this.getContract(contract_address);
  
        const chain = await SystemNetwork.findByPk(contract.network_id);
        var web3 = new Web3(chain.provider);
        web3.defaultAccount = master.address

        const myContract = new web3.eth.Contract(JSON.parse(contract.contract_abi), contract.contract_address);

        const contractData = await myContract.methods.claimAllReward().encodeABI();
        const estimatedGas = await myContract.methods.claimAllReward().estimateGas(
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
            to: contract.contract_address,
            gas: web3.utils.toHex(estimatedGas),
            // gasPrice: web3.utils.toHex(web3.utils.toWei('140', 'Gwei')),
            gasPrice: web3.eth.gas_price,
            data: contractData,
        }

        const signed = await web3.eth.accounts.signTransaction(rawTransaction, master.priv)
        const responseData = await web3.eth.sendSignedTransaction(signed.rawTransaction)


        return (responseData);
    }

    // async contractStakeAmount(contract_address){
    //     const contract = await this.getContract(contract_address)
    //     const chain = await SystemNetwork.findByPk(contract.network_id);

    //     var web3 = new Web3(chain.provider);

    //     const myContract = new web3.eth.Contract(JSON.parse(contract.contract_abi), contract.contract_address);

    //     const contractData = await myContract.methods.accumulateReward().call();

    //     return web3.utils.fromWei(contractData, 'ether');
    // }

    async contractStake(contract_address, user_address, amount, master) {

        const user_wallet = await Wallet.findOne({
            where: {
                address: user_address,
            }
        })

        const contract = await this.getContract(contract_address);
  
        const chain = await SystemNetwork.findByPk(contract.network_id);
        var web3 = new Web3(chain.provider);
        web3.defaultAccount = master.address

        const myContract = new web3.eth.Contract(JSON.parse(contract.contract_abi), contract.contract_address);

        const contractData = await myContract.methods.stake(user_wallet.address, web3.utils.toWei(amount)).encodeABI();
        const estimatedGas = await myContract.methods.stake(user_wallet.address, web3.utils.toWei(amount)).estimateGas(
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
            to: contract.contract_address,
            gas: web3.utils.toHex(estimatedGas),
            // gasPrice: web3.utils.toHex(web3.utils.toWei('140', 'Gwei')),
            gasPrice: web3.eth.gas_price,
            data: contractData,
        }

        const signed = await web3.eth.accounts.signTransaction(rawTransaction, master.priv)
        const responseData = await web3.eth.sendSignedTransaction(signed.rawTransaction)


        return (responseData);
    }

    async contractUnstake(contract_address, user_address, amount, master) {

        const user_wallet = await Wallet.findOne({
            where: {
                address: user_address,
            }
        })

        const contract = await this.getContract(contract_address)
  
        const chain = await SystemNetwork.findByPk(contract.network_id);
        var web3 = new Web3(chain.provider);
        web3.defaultAccount = master.address

        const myContract = new web3.eth.Contract(JSON.parse(contract.contract_abi), contract.contract_address);
        const estimatedGas = await myContract.methods.unstake(user_wallet.address, web3.utils.toWei(amount)).estimateGas(
            {
                from: master.address,
                gasPrice: web3.eth.gas_price

            }, function(error, estimatedGas) {
                console.log(error, estimatedGas);
            }
        );

        const contractData = await myContract.methods.unstake(user_wallet.address, web3.utils.toWei(amount)).encodeABI();
        
        const rawTransaction = {
            from: master.address,
            to: contract.contract_address,
            gas: web3.utils.toHex(estimatedGas),
            // gasPrice: web3.utils.toHex(web3.utils.toWei('140', 'Gwei')),
            gasPrice: web3.eth.gas_price,
            data: contractData,
        }

        const signed = await web3.eth.accounts.signTransaction(rawTransaction, master.priv)
        const responseData = await web3.eth.sendSignedTransaction(signed.rawTransaction)


        return (responseData);
    }

    async contractUpdateAllInfo(
        contract_address,
        minStake,
        rewardSupply,
        apm,
        bonus,
        penalty,
        master,
        ) {

        const contract = await this.getContract(contract_address);
  
        const chain = await SystemNetwork.findByPk(contract.network_id);
        var web3 = new Web3(chain.provider);
        web3.defaultAccount = master.address

        const myContract = new web3.eth.Contract(JSON.parse(contract.contract_abi), contract.contract_address);

        const contractIstance = await myContract.methods.updateAllInfo(
            web3.utils.toWei(minStake, 'ether'),
            web3.utils.toWei(rewardSupply, 'ether'),
            apm,
            bonus,
            penalty,
        );
        const contractData = await contractIstance.encodeABI();
    
        const estimatedGas = await contractIstance.estimateGas(
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
            to: contract.contract_address,
            gas: web3.utils.toHex(estimatedGas),
            // gasPrice: web3.utils.toHex(web3.utils.toWei('140', 'Gwei')),
            gasPrice: web3.eth.gas_price,
            data: contractData,
        }

        const signed = await web3.eth.accounts.signTransaction(rawTransaction, master.priv)
        const responseData = await web3.eth.sendSignedTransaction(signed.rawTransaction)


        return (responseData);
    }

    async contractUpdateMinValueStake(contract_address, minStake, master) {

        const contract = await this.getContract(contract_address);
  
        const chain = await SystemNetwork.findByPk(contract.network_id);
        var web3 = new Web3(chain.provider);
        web3.defaultAccount = master.address

        const myContract = new web3.eth.Contract(JSON.parse(contract.contract_abi), contract.contract_address);

        const contractIstance = await myContract.methods.updateMinValueStake(
            web3.utils.toWei(minStake, 'ether'),
        );
        const contractData = await contractIstance.encodeABI();
    
        const estimatedGas = await contractIstance.estimateGas(
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
            to: contract.contract_address,
            gas: web3.utils.toHex(estimatedGas),
            // gasPrice: web3.utils.toHex(web3.utils.toWei('140', 'Gwei')),
            gasPrice: web3.eth.gas_price,
            data: contractData,
        }

        const signed = await web3.eth.accounts.signTransaction(rawTransaction, master.priv)
        const responseData = await web3.eth.sendSignedTransaction(signed.rawTransaction)


        return (responseData);
    }

    async contractUpdateRewardSupply(contract_address, rewardSupply, master) {

        const contract = await this.getContract(contract_address);
  
        const chain = await SystemNetwork.findByPk(contract.network_id);
        var web3 = new Web3(chain.provider);
        web3.defaultAccount = master.address

        const myContract = new web3.eth.Contract(JSON.parse(contract.contract_abi), contract.contract_address);

        const contractIstance = await myContract.methods.updateRewardSupply(
            web3.utils.toWei(rewardSupply, 'ether'),
        );
        const contractData = await contractIstance.encodeABI();
    
        const estimatedGas = await contractIstance.estimateGas(
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
            to: contract.contract_address,
            gas: web3.utils.toHex(estimatedGas),
            // gasPrice: web3.utils.toHex(web3.utils.toWei('140', 'Gwei')),
            gasPrice: web3.eth.gas_price,
            data: contractData,
        }

        const signed = await web3.eth.accounts.signTransaction(rawTransaction, master.priv)
        const responseData = await web3.eth.sendSignedTransaction(signed.rawTransaction)


        return (responseData);
    }

    async contractUpdateAPM(contract_address, apm, master) {

        const contract = await this.getContract(contract_address);
  
        const chain = await SystemNetwork.findByPk(contract.network_id);
        var web3 = new Web3(chain.provider);
        web3.defaultAccount = master.address

        const myContract = new web3.eth.Contract(JSON.parse(contract.contract_abi), contract.contract_address);

        const contractIstance = await myContract.methods.updatePercentageOfAPM(
            apm,
        );
        const contractData = await contractIstance.encodeABI();
    
        const estimatedGas = await contractIstance.estimateGas(
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
            to: contract.contract_address,
            gas: web3.utils.toHex(estimatedGas),
            // gasPrice: web3.utils.toHex(web3.utils.toWei('140', 'Gwei')),
            gasPrice: web3.eth.gas_price,
            data: contractData,
        }

        const signed = await web3.eth.accounts.signTransaction(rawTransaction, master.priv)
        const responseData = await web3.eth.sendSignedTransaction(signed.rawTransaction)


        return (responseData);
    }

    async contractUpdatePenalty(contract_address, penalty, master) {

        const contract = await this.getContract(contract_address);
  
        const chain = await SystemNetwork.findByPk(contract.network_id);
        var web3 = new Web3(chain.provider);
        web3.defaultAccount = master.address

        const myContract = new web3.eth.Contract(JSON.parse(contract.contract_abi), contract.contract_address);

        const contractIstance = await myContract.methods.updatePercentageOfPenalty(
            penalty,
        );
        const contractData = await contractIstance.encodeABI();
    
        const estimatedGas = await contractIstance.estimateGas(
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
            to: contract.contract_address,
            gas: web3.utils.toHex(estimatedGas),
            // gasPrice: web3.utils.toHex(web3.utils.toWei('140', 'Gwei')),
            gasPrice: web3.eth.gas_price,
            data: contractData,
        }

        const signed = await web3.eth.accounts.signTransaction(rawTransaction, master.priv)
        const responseData = await web3.eth.sendSignedTransaction(signed.rawTransaction)


        return (responseData);
    }

    async contractUpdateBonus(contract_address, bonus, master) {

        const contract = await this.getContract(contract_address);
  
        const chain = await SystemNetwork.findByPk(contract.network_id);
        var web3 = new Web3(chain.provider);
        web3.defaultAccount = master.address

        const myContract = new web3.eth.Contract(JSON.parse(contract.contract_abi), contract.contract_address);

        const contractIstance = await myContract.methods.updatePercentageOfBonus(
            bonus,
        );
        const contractData = await contractIstance.encodeABI();
    
        const estimatedGas = await contractIstance.estimateGas(
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
            to: contract.contract_address,
            gas: web3.utils.toHex(estimatedGas),
            // gasPrice: web3.utils.toHex(web3.utils.toWei('140', 'Gwei')),
            gasPrice: web3.eth.gas_price,
            data: contractData,
        }

        const signed = await web3.eth.accounts.signTransaction(rawTransaction, master.priv)
        const responseData = await web3.eth.sendSignedTransaction(signed.rawTransaction)


        return (responseData);
    }

    async listAllContracts() {
        try {
            const contracts = Staking.findAll({attributes: ['name', 'contract_address']});

            return contracts;
        } catch (error) {
            console.log('error')
            console.log(error.message)
            let message = JSON.parse(err.message.substring(56).trim().replace("'", "")).value.data.data;
            console.log(message[Object.keys(message)[0]].reason);
            return error
        }
    }

    async listenRewardEvents(contract_address) {
        try {
            const contract = await this.getContract(contract_address);
  
            const chain = await SystemNetwork.findByPk(contract.network_id);
            var web3 = new Web3(chain.provider);

            const myContract = new web3.eth.Contract(JSON.parse(contract.reward_abi), contract.reward_address);

            myContract.events.Transfer()
                .on("connected", function(subscriptionId){ console.log(subscriptionId);})
                .on('data', function(event){ console.log(event);})


        } catch (error) {
            console.log('error')
            console.log(error.message)
            let message = JSON.parse(err.message.substring(56).trim().replace("'", "")).value.data.data;
            console.log(message[Object.keys(message)[0]].reason);
            return error
        }
    }
}

export default StakingController;