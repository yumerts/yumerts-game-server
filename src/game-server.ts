import { GameServerPort } from "./constants/ports";
import * as ws from "ws";
import { Match, MatchState } from "./matchmaking-logic/match";
import { ethers } from "ethers";
import dotenv from "dotenv";

import { matchmaking_contract_event_abi } from "./constants/matchmaking-contract-event-abi";
import { prediction_contract_event_abi } from "./constants/prediction-contract-event-abi";

dotenv.config();

const isValidSignature = (message: string, signature: string, address: string): boolean => {
    const messageHash = ethers.id(message);
    const recoveredAddress = ethers.recoverAddress(messageHash, signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
};

export class GameServer{

    private server: ws.WebSocketServer;
    public match: Match[];
    
    private matchmaking_contract: ethers.Contract;
    private prediction_contract: ethers.Contract;

    constructor(){

        const provider = new ethers.JsonRpcProvider("https://sepolia-rollup.arbitrum.io/rpc");
        
        const matchmakingContractAddress = process.env.MATCHMAKING_CONTRACT_ADDRESS;
        if (!matchmakingContractAddress) {
            throw new Error("MATCHMAKING_CONTRACT_ADDRESS is not defined");
        }
        this.matchmaking_contract = new ethers.Contract(matchmakingContractAddress, matchmaking_contract_event_abi, provider);

        const predictionContractAddress = process.env.PREDICTION_CONTRACT_ADDRESS;
        if (!predictionContractAddress) {
            throw new Error("PREDICTION_CONTRACT_ADDRESS is not defined");
        }
        this.prediction_contract = new ethers.Contract(predictionContractAddress, prediction_contract_event_abi, provider);

        this.server = new ws.WebSocketServer({ port: GameServerPort }, () => {
            console.log(`Matchmaking server started on port ${GameServerPort}`);
        });

        this.matchmaking_contract.on("matchCreated", (match_id: number, player1: string) => {
            let newMatch = new Match(match_id, player1);
            this.match.push(newMatch);
        });

        this.matchmaking_contract.on("matchJoined", (match_id: number, player2: string) => {
            let existingMatch: Match | undefined = this.match.find(m => m.match_id === match_id);
            if(existingMatch){
                existingMatch.playerJoined(player2);
            }
        });

        this.matchmaking_contract.on("matchStarted", (match_id: number, player1: string, player2: string) => {

        });

        this.matchmaking_contract.on("matchEnded", (match_id: number, winner: string) => {

        });

        this.server.on("connection", function (wsConnection, _incomingMessage) {
            wsConnection.send("connected to server");
            
        });
    }
}