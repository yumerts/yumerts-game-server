export const matchmaking_contract_event_abi = [
    "event matchCreated(uint256 indexed match_id, address indexed player1)",
    "event matchJoined(uint256 indexed match_id, address indexed player2)",
    "event matchStarted(uint256 indexed match_id, address indexed player1, address indexed player2)",
    "event matchEnded(uint256 indexed match_id, address indexed winner)"
]