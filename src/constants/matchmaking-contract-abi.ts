export const matchmaking_contract_event_abi = [
    "event matchCreated(uint256 indexed match_id, address indexed player1)",
    "event matchJoined(uint256 indexed match_id, address indexed player2)",
    "event matchStarted(uint256 indexed match_id, address indexed player1, address indexed player2)",
    "event matchEnded(uint256 indexed match_id, address indexed winner)"
]

export const matchmaking_contract_abi = [
    "function openPredictionMarket(uint256 match_id) external"
]
//export const matchmaking_contract_abi = [{"inputs":[],"name":"createMatch","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"match_id","type":"uint256"},{"internalType":"uint256","name":"winner","type":"uint256"}],"name":"endMatch","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getLatestMatchId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getMatchmakingServerWalletAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getPlayerInfoSmartContractAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getPredictionSmartContractAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"init","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"match_id","type":"uint256"}],"name":"joinMatch","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"match_id","type":"uint256"}],"name":"openPredictionMarket","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_address","type":"address"}],"name":"setMatchmakingServerWalletAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_address","type":"address"}],"name":"setPlayerInfoSmartContractAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_address","type":"address"}],"name":"setPredictionSmartContractAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"match_id","type":"uint256"}],"name":"startMatch","outputs":[],"stateMutability":"nonpayable","type":"function"}]