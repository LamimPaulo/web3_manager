import Web3 from "web3";

class WalletController {

    createAddress(){
        return new Web3().eth.accounts.create();
    }

    getBalance(address) {
        return new Web3.fromWei(new Web3().eth.getBalance(address)); 
    }
}

export default WalletController;