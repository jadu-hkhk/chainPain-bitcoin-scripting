import Config from "./config.js";
import RpcAgent from "bcrpc";

const agent = new RpcAgent({
    port: Config.rpc.port,
    user: Config.rpc.user,
    pass: Config.rpc.pass
});

export const createOrLoadWallet = async (walletName) => {
    try {
        const walletInfo = await agent.loadWallet(walletName);
        return walletInfo.result;
    } catch (error) {
        if (error.code === -18) {
            const walletInfo = await agent.createWallet(walletName);
            return walletInfo.result;
        }
        throw error;
    }
};

export const getNewAddress = async (addressType) => {
    try {
        const address = await agent.getNewAddress('', addressType);
        return address;
    } catch (error) {
        console.error("Error in getNewAddress:", error);
        throw error;
    }
}

export const sendToAddress = async (address, amount) => {
    try {
        const txid = await agent.sendToAddress(address, amount);
        return txid;
    } catch (error) {
        console.error("Error in sendToAddress:", error);
        throw error;
    }
}

export const generateBlock = async () => {
    try {
        const address = await getNewAddress('legacy');
        const block = await agent.generateToAddress(1, address);
        return block;
    } catch (error) {
        console.error("Error in generateBlock:", error);
        throw error;
    }
}

export const getUnspentForAddress = async (address) => {
    try {
        const utxos = await agent.listUnspent(1, 9999999, [address]);
        return utxos;
    } catch (error) {
        console.error("Error in getUnspentForAddress:", error);
        throw error;
    }
}

export const createRawTransaction = async (addressA, txOutputs) => {
    //get utxos for address A to use as input for the transaction
    const utxosA = await getUnspentForAddress(addressA);
    if (utxosA.length === 0) {
        throw new Error(`No UTXOs found for address ${addressA}`);
    }

    /* fee calculation */
    const txFee = 0.0001;
    const txInputs = utxosA.map(utxo => ({
        txid: utxo.txid,
        vout: utxo.vout,
    }));

    const totalInputAmount = utxosA.reduce((sum, utxo) => sum + utxo.amount, 0);
    const totalOutputAmount = Object.values(txOutputs).reduce((sum, amount) => sum + amount, 0);
    const changeAmount = totalInputAmount - totalOutputAmount - txFee;

    // if change is greater than satoshi's threshold, add it to the output
    if (changeAmount > 0.00001) {
        txOutputs[addressA] = changeAmount;
    }

    try {
        const rawTx = await agent.createRawTransaction(txInputs, txOutputs, 0, false);
        return rawTx;
    } catch (error) {
        console.error("Error in createRawTransaction:", error);
        throw error;
    }
}

export const decodeRawTransaction = async (hexString) => {
    try {
        const decoded = await agent.decodeRawTransaction(hexString);
        return decoded;
    } catch (error) {
        console.error("Error in decodeRawTransaction:", error);
        throw error;
    }
}

export const signRawTransactionWithWallet = async (hexString) => {
    try {
        const signed = await agent.signRawTransactionWithWallet(hexString);
        return signed;
    } catch (error) {
        console.error("Error in signRawTransactionWithWallet:", error);
        throw error;
    }
}

export const sendRawTransaction = async (hexString) => {
    try {
        const txid = await agent.sendRawTransaction(hexString);
        return txid;
    } catch (error) {
        console.error("Error in sendRawTransaction:", error);
        throw error;
    }
}