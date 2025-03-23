const Config = {
    rpc: {
        port: 18443,  // Bitcoin regtest RPC port
        user: "your_rpc_username",  // Set in bitcoin.conf
        pass: "your_rpc_password"   // Set in bitcoin.conf
    },
    dataPath: "./"  // Directory where transaction data is stored
};

export default Config;