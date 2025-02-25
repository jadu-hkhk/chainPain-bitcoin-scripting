import fs from "fs";
import Config from "./config.js";

import { createOrLoadWallet, getNewAddress, sendToAddress, generateBlock, getUnspentForAddress, createRawTransaction, decodeRawTransaction, signRawTransactionWithWallet, sendRawTransaction } from "./helpers.js";

const runLegacyTransaction = async () => {
    try {
        console.log("Part 1: Legacy Address Transactions (P2PKH)");
        console.log("===========================================");

        await createOrLoadWallet("test-wallet");

        const addressA = await getNewAddress("legacy");
        const addressB = await getNewAddress("legacy");
        const addressC = await getNewAddress("legacy");

        console.log("Addresses created:")
        console.log("A:", addressA);
        console.log("B:", addressB);
        console.log("C:", addressC);

        const fundingAmount = 1.0; //in BTC
        const fundingTxid = await sendToAddress(addressA, fundingAmount);
        console.log(`Funded address A with ${fundingAmount} BTC. Txid: ${fundingTxid}`);

        //generate block to confirm transaction
        await generateBlock();

        const amountAtoB = 0.5;
        const rawTxAtoB = await createRawTransaction(addressA, { [addressB]: amountAtoB });
        console.log(`Raw transaction A to B: ${rawTxAtoB}`);

        //decode raw transaction to get locking script
        const decodeTxAtoB = await decodeRawTransaction(rawTxAtoB);
        console.log("Locking script (ScriptPubKey) for address B:")

        // the scriptPubKey is in vout array, find the one for address B
        for (const output of decodeTxAtoB.vout) {
            if (output.scriptPubKey.address && output.scriptPubKey.address === addressB) {
                console.log(JSON.stringify(output.scriptPubKey, null, 2));
                break;
            }
        }

        //sign the transaction
        const signedTxAtoB = await signRawTransactionWithWallet(rawTxAtoB);
        console.log("Transaction signed successfully");

        // Broadcast the transaction
        const txidAtoB = await sendRawTransaction(signedTxAtoB.hex);
        console.log(`Transaction from A to B broadcasted successfully. Txid: ${txidAtoB}`);

        // generate block to confirm transaction
        await generateBlock();

        /* CREATE A RAW TRANSACTION FROM B TO C */
        const amountBtoC = 0.2;
        const rawTxBtoC = await createRawTransaction(addressB, { [addressC]: amountBtoC });
        console.log(`Raw transaction B to C: ${rawTxBtoC}`);

        //decode raw transaction to get locking script
        const decodeTxBtoC = await decodeRawTransaction(rawTxBtoC);
        console.log("Transaction B to C decoded");

        //sign the transaction
        const signedTxBtoC = await signRawTransactionWithWallet(rawTxBtoC);
        console.log("Transaction B to C signed successfully");

        const signedDecodedTxBtoC = await decodeRawTransaction(signedTxBtoC.hex);

        //find input that spends the utxo for address B
        if (signedDecodedTxBtoC.vin && signedDecodedTxBtoC.vin.length > 0) {
            console.log("Unlocking script (ScriptSig) for input spending from B:");
            console.log(JSON.stringify(signedDecodedTxBtoC.vin[0].scriptSig, null, 2));
        }

        // Broadcast the transaction
        const txidBtoC = await sendRawTransaction(signedTxBtoC.hex);
        console.log(`Transaction from B to C broadcasted successfully. Txid: ${txidBtoC}`);

        // generate block to confirm transaction
        await generateBlock();

        // Save transaction details to file
        const legacyTxInfo = {
            addressA,
            addressB,
            addressC,
            fundingTxid,
            txidAtoB: {
                txid: txidAtoB,
                rawHex: signedTxAtoB.hex,
                decoded: decodeTxAtoB
            },
            txidBtoC: {
                txid: txidBtoC,
                rawHex: signedTxBtoC.hex,
                decoded: signedDecodedTxBtoC
            }
        };

        fs.writeFileSync(Config.dataPath + "legacy-transactions.json", JSON.stringify(legacyTxInfo, null, 2));
        console.log("Transaction details saved to legacy-transactions.json");

        return legacyTxInfo;
    } catch (error) {
        console.error("Error in legacy transaction process:", error);
        throw error;
    }
};

runLegacyTransaction()
    .then(() => {
        console.log("Legacy transaction completed successfully");
    })
    .catch((error) => {
        console.error("Error in runLegacyTransaction:", error);
    })

