# Bitcoin Scripting Assignment

This project demonstrates Legacy (P2PKH) and SegWit (P2SH-P2WPKH) Bitcoin transactions in a regtest environment. We analyze the transaction scripts and compare their structures and sizes.

## Requirements

- Bitcoin Core (with regtest mode)
- Node.js
- NPM

## Installation & Setup

1. Clone this repository
2. Run `npm install`
3. Update `src/config.js` file with your Bitcoin RPC credentials
4. Ensure Bitcoin Core is running in regtest mode

## Usage

Run Legacy transaction flow:

```
npm run legacy

```

Run SegWit transaction flow:

```
npm run segwit

```

## Project Structure

- `src/helpers.js`: Bitcoin RPC utilities
- `src/legacyTransactions.js`: Legacy transaction implementation
- `src/segwitTransactions.js`: SegWit transaction implementation
- `Txn_Outputs/`: Transaction data storage
- `Report.pdf`: Analysis Report

The detailed report with our analysis is included as a PDF in this repository.

## Team Members

- Himanshu (230002029)
- Ashish Donth (230008011)
- Aditya Kumar Prasad (230005003)
