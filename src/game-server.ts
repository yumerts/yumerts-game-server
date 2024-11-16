import { GameServerPort } from "./constants/ports";
import * as ws from "ws";
import { Match, MatchState } from "./matchmaking-logic/match";
import { ethers } from "ethers";
import * as dotenv from "dotenv";

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
    public match!: Match[];
    
    private matchmaking_contract: ethers.Contract;
    private prediction_contract: ethers.Contract;

    constructor(){

        this.match = [];
        const provider = new ethers.JsonRpcProvider(process.env.PROVIDER_URL);
        
        const matchmakingContractAddress = process.env.MATCH_INFO_SMART_CONTRACT_ADDRESS;
        if (!matchmakingContractAddress) {
            throw new Error("MATCHMAKING_CONTRACT_ADDRESS is not defined");
        }
        this.matchmaking_contract = new ethers.Contract(matchmakingContractAddress, matchmaking_contract_event_abi, provider);

        const predictionContractAddress = process.env.PREDICTION_SMART_CONTRACT_ADDRESS;
        if (!predictionContractAddress) {
            throw new Error("PREDICTION_CONTRACT_ADDRESS is not defined");
        }
        this.prediction_contract = new ethers.Contract(predictionContractAddress, prediction_contract_event_abi, provider);

        this.server = new ws.WebSocketServer({ port: GameServerPort }, () => {
            console.log(`Matchmaking server started on port ${GameServerPort}`);
        });

        this.matchmaking_contract.on("matchCreated", (match_id: number, player1: string) => {
            console.log("A match has been created: ", match_id, player1);
            let newMatch = new Match(match_id, player1);
            this.match.push(newMatch);
        });

        this.matchmaking_contract.on("matchJoined", (match_id: number, player2: string) => {
            let existingMatch: Match | undefined = this.match.find(m => m.match_id === match_id);
            console.log("A match has been joined: ", match_id, player2);
            if(existingMatch){
                existingMatch.playerJoined(player2);
            }

            //notify both players via push protocol
            
        });

        this.matchmaking_contract.on("matchStarted", (match_id: number, player1: string, player2: string) => {
            let existingMatch: Match | undefined = this.match.find(m => m.match_id === match_id);
            console.log("A match has been started: ", match_id, player1, player2);
            if(existingMatch){
                existingMatch.startMatch();
            }
        });

        this.matchmaking_contract.on("matchEnded", (match_id: number, winner: string) => {
            let existingMatch: Match | undefined = this.match.find(m => m.match_id === match_id);
            console.log("A match has ended: ", match_id, winner);
            if(existingMatch){
                existingMatch.endMatch();
            }
            this.match = this.match.filter(m => m.match_id !== match_id);
        });

        this.server.on("connection", (wsConnection, _incomingMessage) => {
            wsConnection.send("connected to server");
            wsConnection.on("message", async (message: string) => {
                //message can only come in this three format
                // {"type": "create_match", "match_id": number, signature: string} //signature is signed using the match_id as the message
                // {"type": "join_match", "match_id": number, signature: string} //signature is signed using the match_id as the message
                // {"type": "input": "data": {"match_id": number, "player": number, "input": {troopId: number, targetCoordinate: {x: number, y: number}}}, "signature": string} //signature is signed using the match_id + player + input as the message
                // end the process if the message is not parsable at all
                let parsedMessage: any;
                try{
                    parsedMessage = JSON.parse(message);
                } catch(e){
                    return;
                }

                // check if it is of type "create_match"
                if(parsedMessage.type === "create_match"){
                    //check if match exists or not
                    //if it exists get the player1 address from the match
                    //check if the signature is valid
                    //if it is valid, allow to connect
                    //else, disconnect the connection
                    let existingMatch: Match | undefined = this.match.find(m => m.match_id === parsedMessage.match_id);
                    if(!existingMatch){
                        return;
                    }
                    if(!isValidSignature(parsedMessage.match_id.toString(), parsedMessage.signature, existingMatch.player1_public_address)){
                        return;
                    }
                    existingMatch.player1_ws_connection = wsConnection as unknown as WebSocket;

                    this.matchmaking_contract.createMatch(parsedMessage.match_id);
                }else if(parsedMessage.type === "join_match"){
                    //check if match exists or not
                    //if it exists get the player1 address from the match
                    //check if the signature is valid
                    //if it is valid, allow to connect
                    //else, disconnect the connection
                    let existingMatch: Match | undefined = this.match.find(m => m.match_id === parsedMessage.match_id);
                    if(!existingMatch){
                        return;
                    }
                    if(!isValidSignature(parsedMessage.match_id.toString(), parsedMessage.signature, existingMatch.player1_public_address)){
                        return;
                    }
                    existingMatch.player2_ws_connection = wsConnection as unknown as WebSocket;
                    existingMatch.match_status = MatchState.READY;

                    this.matchmaking_contract.joinMatch(parsedMessage.match_id);
                }else if(parsedMessage.type === "input"){
                    //check if match exists or not
                    //if it exists get the player1 address from the match
                    //check if the signature is valid
                    //if it is valid, allow to connect
                    //else, disconnect the connection
                    let existingMatch: Match | undefined = this.match.find(m => m.match_id === parsedMessage.match_id);
                    if(!existingMatch){
                        return;
                    }

                    //check if the match has started already or not
                    if(existingMatch.match_status != MatchState.STARTED){
                        return;
                    }

                    let player: string = parsedMessage.data.player;
                    let input: any = parsedMessage.data.input;
                    if(!isValidSignature(parsedMessage.match_id.toString() + player + JSON.stringify(input), parsedMessage.signature, player == "1" ? existingMatch.player1_public_address : existingMatch.player2_public_address ?? "")){
                        return;
                    }
                    existingMatch.board.order(parseInt(player), input.troopId, input.targetCoordinate);
                }
            });
        });
    }
}