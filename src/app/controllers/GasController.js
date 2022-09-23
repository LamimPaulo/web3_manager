import Web3 from "web3";
import Wallet from "../models/Wallet.js";
import fetch from 'node-fetch';
import SystemWallet from "../models/SystemWallet.js";
import NetworkGas from "../models/NetworkGas.js";
import { response } from "express";
// import Https from "Https"`

class GasController {

    async syncGas(){
        const network = 'eth'; // could be any supported network
        // const key = 'YOUR_API_KEY'; // fill your api key here
        // const res = await fetch(`https://api.owlracle.info/v3/${ network }/gas`);
        const res = await fetch("https://api.bscscan.com/api?module=gastracker&action=gasoracle&apikey=8Z5ZEBBPEIFWWJA54XM24IQNSXZFC8ZDUS", {
            method: 'get',
            headers: {'Content-Type': 'application/json'}
            });
        const data = await res.json();
        const update = await NetworkGas.findOne();
        update.safe = data.result.SafeGasPrice
        update.propose = data.result.ProposeGasPrice
        update.fast = data.result.FastGasPrice
        update.save();
    }

}

export default GasController;