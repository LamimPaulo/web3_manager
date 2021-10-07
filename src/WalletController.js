import Web3 from "web3";

class WalletController {

    createAddress(){
        return new Web3().eth.accounts.create();
    }
}

export default WalletController;