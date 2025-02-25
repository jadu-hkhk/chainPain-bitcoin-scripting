import fs from "fs";
import Config from "./config.js";

import { createOrLoadWallet, getNewAddress, sendToAddress, generateBlock, getUnspentForAddress, createRawTransaction, decodeRawTransaction, signRawTransactionWithWallet, sendRawTransaction } from "./helpers.js";

const runSegwitTransaction = async () => {
    try {
        console.log("Part 2: Segwit Address Transactions (P2SH)");
        console.log("===========================================");

        await createOrLoadWallet("test-wallet");

        const addressA = await getNewAddress("p2sh-segwit");
        const addressB = await getNewAddress("p2sh-segwit");
        const addressC = await getNewAddress("p2sh-segwit");

        console.log(`SegWit Address A: ${addressA}`);
        console.log(`SegWit Address B: ${addressB}`);
        console.log(`SegWit Address C: ${addressC}`);

        // fund address A with 1 BTC
        const fundingAmount = 1.0; //in BTC
        const fundingTxid = await sendToAddress(addressA, fundingAmount);
        console.log(`Funded address A with ${fundingAmount} BTC. Txid: ${fundingTxid}`);

        // generate block to confirm transaction
        await generateBlock();

        // create raw transaction from address A to address B
        const amountAtoB = 0.5;
        const rawTxAtoB = await createRawTransaction(addressA, { [addressB]: amountAtoB });
        console.log("Raw transaction A to B created");

        // decode raw transaction
        const decodedTxAtoB = await decodeRawTransaction(rawTxAtoB);
        console.log("Locking script (ScriptPubKey) for address B:")

        for (const output of decodedTxAtoB.vout) {
            if (output.scriptPubKey.address && output.scriptPubKey.address === addressB) {
                console.log(JSON.stringify(output.scriptPubKey, null, 2));
                break;
            }
        }

        // sign the transaction
        const signedTxAtoB = await signRawTransactionWithWallet(rawTxAtoB);
        console.log("Transaction signed successfully");

        // broadcast transaction
        const txidAtoB = await sendRawTransaction(signedTxAtoB.hex);
        console.log(`Transaction A to B broadcasted successfully.\nTxid: ${txidAtoB}`);

        // generate block to confirm transaction
        await generateBlock();

        /* CREATE RAW TRANSACTION FROM ADDRESS B TO ADDRESS C */
        const amountBtoC = 0.25;
        const rawTxBtoC = await createRawTransaction(addressB, { [addressC]: amountBtoC });
        console.log("Raw transaction B to C created");

        // decode raw transaction
        const decodedTxBtoC = await decodeRawTransaction(rawTxBtoC);
        console.log("Transaction B to C decoded");

        // sign the transaction
        const signedTxBtoC = await signRawTransactionWithWallet(rawTxBtoC);
        console.log("Transaction B to C signed successfully");

        // By signing, the ScriptSig(unlocking script) is added to the transaction
        const signedDecodedTxBtoC = await decodeRawTransaction(signedTxBtoC.hex);
        if (signedDecodedTxBtoC.vin && signedDecodedTxBtoC.vin.length > 0) {
            console.log("Unlocking script (ScriptSig) for input spending from B:");
            console.log(JSON.stringify(signedDecodedTxBtoC.vin[0].scriptSig, null, 2));
            console.log(" signature and public key are in witness data");
        }

        //broadcast transaction
        const txidBtoC = await sendRawTransaction(signedTxBtoC.hex);
        console.log(`Transaction B to C broadcasted successfully.\nTxid: ${txidBtoC}`);


        // generate block to confirm transaction
        await generateBlock();

        // Save transaction info
        const segwitTxInfo = {
            addressA,
            addressB,
            addressC,
            fundingTxid,
            txAtoB: {
                txid: txidAtoB,
                rawHex: signedTxAtoB.hex,
                decoded: decodedTxAtoB
            },
            txBtoC: {
                txid: txidBtoC,
                rawHex: signedTxBtoC.hex,
                decoded: signedDecodedTxBtoC
            }
        };

        fs.writeFileSync(Config.dataPath + "segwit-transactions.json", JSON.stringify(segwitTxInfo, null, 2));
        console.log("Transaction details saved to segwit-transactions.json");

        return segwitTxInfo;
    } catch (error) {
        console.error("Error in segwit transaction process:", error);
        throw error;
    }
};

runSegwitTransaction()
    .then(() => {
        console.log("Segwit transaction completed successfully");
    })
    .catch((error) => {
        console.error("Error in runSegwitTransaction:", error);
    });