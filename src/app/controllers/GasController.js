import Web3 from "web3";
import Wallet from "../models/Wallet.js";
import fetch from 'node-fetch';
import SystemWallet from "../models/SystemWallet.js";
import NetworkGas from "../models/NetworkGas.js";
import { response } from "express";
import bcrypt from 'bcrypt';

// import Https from "Https"`

class GasController {

    async syncGas(){
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

    async generateHash(){
        try {
            //token
            //coinage => a554ef17-6071-4a2d-8ca2-9d0fa227a571
            //infinityhub => 24a52d38-b309-42c3-bd0d-5635f61cdc45

            const token = "24a52d38-b309-42c3-bd0d-5635f61cdc45"

            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(token, salt);
            console.log(salt)
            console.log(hash)
            return hash
        } catch (error) {
            console.error(error);
        }

    }

    async checkHash(){
        try {

                var check = bcrypt.compareSync('N@videv2', '$2b$10$2Iw2S60SHJov2EHUxm2ZvupJQvY1kwCNt.0vOr1OsIt2KjIGCPL92');
            // var hash = bcrypt.hashSync("N@videv1", salt);
            console.log(check)
            return check
        } catch (error) {
            console.error(error);
        }

    }

}

export default GasController;