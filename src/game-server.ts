import { GameServerPort } from "./constants/ports";
import * as ws from "ws";
import { Match, MatchState, ReadyState } from "./matchmaking-logic/match";
import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { PushAPI } from '@pushprotocol/restapi';

import { matchmaking_contract_abi, matchmaking_contract_event_abi } from "./constants/matchmaking-contract-abi";
import { prediction_contract_event_abi } from "./constants/prediction-contract-abi";
import e from "express";
import { ENV } from "@pushprotocol/restapi/src/lib/constants";
import { getTEEPrivKey } from "./utils/deriveKey";

dotenv.config();

const isValidSignature = (message: string, signature: string, address: string): boolean => {
    const messageHash = ethers.hashMessage(message);
    const recoveredAddress = ethers.verifyMessage(message, signature);
    console.log("recovered address: ", recoveredAddress);
    console.log("actual address: ", address);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
};

enum NotificationCategory{
    General, //react-hot-toast
    Critical //modal-notifications
}

export class GameServer{

    private server: ws.WebSocketServer;
    public match!: Match[];
    public pushUser: PushAPI | undefined;

    private matchmaking_contract: ethers.Contract;
    private prediction_contract: ethers.Contract;

    constructor(){

        const pushUserSetup = async () => {
            const privateKey = getTEEPrivKey();
            if (!privateKey) {
                throw new Error("PUSH_PROTOCOL_CHANNEL_PRIV_KEY is not defined");
            }
            const signer = new ethers.Wallet(privateKey);
            this.pushUser = await PushAPI.initialize(signer, {
                env: ENV.STAGING
            })
        }

        const sendPushNotification = async (recipients: string[], title: string, description: string, category: NotificationCategory, cta: string) =>{
            if(!this.pushUser){
                return;
            }
            await this.pushUser.channel.send(recipients, {
                channel: "eip155:421614:"+process.env.PUSH_PROTOCOL_CHANNEL_ADDRESS,
                notification: { 
                    title: title,
                    body: description 
                },
                payload: {
                    title: title,
                    body: description,
                    category: category,
                    cta: cta
                }
            })
        }

        this.match = [];
        const provider = new ethers.JsonRpcProvider(process.env.PROVIDER_URL);
        provider.pollingInterval = 2000;
        
        const matchmakingContractAddress = process.env.MATCH_INFO_SMART_CONTRACT_ADDRESS;
        console.log("Matchmaking contract address: ", matchmakingContractAddress);
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

            //we do not notify the player because the contract has been successfully created, the moment it has been created,
            //the player 1 will be aware of it, and it will display on the matchmaking homepage
        });

        this.matchmaking_contract.on("matchJoined", (match_id: number, player2: string) => {
            let existingMatch: Match | undefined = this.match.find(m => m.match_id === match_id);
            console.log("A match has been joined: ", match_id, player2);
            if(existingMatch){
                existingMatch.playerJoined(player2);
            }
            
            console.log(player2);

            sendPushNotification(
                [existingMatch?.player1_public_address ?? "", player2], 
                "Join the match now!", "A player has joined the match", 
                NotificationCategory.Critical, 
                `join ${match_id}` 
            );
            //notify both players via push protocol
            //both player 1 and player 2 will be notified with a push protocol link to connect to the game server
            //if the player is in game, a pop up screen would appear to ask the user to confirm the joining process
            //if the player is outside of game (for example) another website, a sample notification with link that points to the game should appear
        });

        this.matchmaking_contract.on("matchStarted", (match_id: number, player1: string, player2: string) => {
            let existingMatch: Match | undefined = this.match.find(m => m.match_id === match_id);
            console.log("A match has been started: ", match_id, player1, player2);
            if(existingMatch){
                existingMatch.startMatch();
            }

            //the match starts when both users are connected to the server
            //both of them approve of starting the game
        });

        this.matchmaking_contract.on("matchEnded", (match_id: number, winner: string) => {
            let existingMatch: Match | undefined = this.match.find(m => m.match_id == match_id);
            console.log("A match has ended: ", match_id, winner);
            if(existingMatch){
                //existingMatch.endMatch();
            }
            sendPushNotification(
                [existingMatch?.player1_public_address ?? "", existingMatch?.player2_public_address ?? ""], 
                "The match has been ended with " + winner + "'s victory!", "The match has been ended with " + winner + "'s victory!",
                NotificationCategory.General, 
                "push"
            );
            //the match ends when the server has identified that the match has indeed been ended.
        });

        this.prediction_contract.on("placed_prediction", (match_id: number, predictor: string, party: number, stake: number) => {
            //somebody has placed prediction
            let existingMatch: Match | undefined = this.match.find(m => m.match_id === match_id);
            console.log("A prediction has been placed on: ", match_id, predictor, party, stake);
            if(existingMatch){
                existingMatch.addPrediction(match_id, predictor);
            }

            //using push notification to send a "prediction placed" notification
            sendPushNotification(
                [predictor], 
                "You have placed a prediction!", "You have spent " + stake/1000000 + " USDC on Match: " + match_id + " with " + party + " as your target!", 
                NotificationCategory.General, 
                "push"
            );
        });

        this.prediction_contract.on("prediction_results_available", (match_id: number, winner: number) => {
            let existingMatch: Match | undefined = this.match.find(m => m.match_id === match_id);
            console.log("A match has been successfully ended: ", match_id, winner);
            if(existingMatch){
                sendPushNotification(
                    existingMatch.getWinningPredictors(winner), 
                    "Prediction Won!",
                    "You have won the prediction for the match: " + match_id, 
                    NotificationCategory.General, 
                    "push"
                );

                sendPushNotification(
                    existingMatch.getLosingPredictors(winner), 
                    "Prediction Lost!",
                    "You have lost the prediction for the match: " + match_id, 
                    NotificationCategory.General, 
                    "push"
                );
                this.match = this.match.filter(m => m.match_id !== match_id);
            }
        });

        console.log("Listening to blockchain events");

        this.server.on("connection", (wsConnection, _incomingMessage) => {
            wsConnection.send("connected to server");
            wsConnection.on("message", async (message: string) => {
                //message can only come in this three format
                // {"type": "join_match", "match_id": number, signature: string} //signature is signed using the match_id as the message
                // {"type": "attendance", "match_id": number, "signature": string, "player": number} //signature is signed using the match_id + player as the message
                // {"type": "input": "data": {"match_id": number, "player": number, "input": {troopId: number, targetCoordinate: {x: number, y: number}}}, "signature": string} //signature is signed using the match_id + player + input as the message
                // end the process if the message is not parsable at all
                let parsedMessage: any;
                try{
                    parsedMessage = JSON.parse(message);
                } catch(e){
                    return;
                }
                if(parsedMessage.type === "join_match"){
                    //check if match exists or not
                    //if it exists get the player1 address from the match
                    //check if the signature is valid
                    //if it is valid, allow to connect
                    //else, disconnect the connection
                    
                    console.log(this.match[0].getMatchInfo());
                    let existingMatch: Match | undefined = this.match.find(m => m.match_id == Number(parsedMessage.match_id));
                    if(!existingMatch){
                        return;
                    }
                    console.log("joining match " + parsedMessage.match_id);

                    if(existingMatch.match_status == MatchState.FINDING){
                        return;
                    }

                    if(isValidSignature(parsedMessage.match_id.toString(), parsedMessage.signature, existingMatch.player1_public_address)){
                        //player 1
                        console.log("player 2 has connected")
                        existingMatch.player1_ws_connection = wsConnection as unknown as WebSocket;
                    }else if(isValidSignature(parsedMessage.match_id.toString(), parsedMessage.signature, existingMatch.player2_public_address ?? "") ){
                        //player 2
                        console.log("player 1 has connected")
                        existingMatch.player2_ws_connection = wsConnection as unknown as WebSocket;
                    }else{
                        console.log("A spectator has connected")
                        existingMatch.spectator_ws_connections.push(wsConnection as unknown as WebSocket);
                        //spectator
                    }

                    if(existingMatch.player1_ws_connection && existingMatch.player2_ws_connection){
                        existingMatch.match_ready_status = ReadyState.BUFFER;;
                        existingMatch.match_status = MatchState.READY;

                        const signer = new ethers.Wallet(getTEEPrivKey(), provider);
                        const signedContract = new ethers.Contract(matchmakingContractAddress, matchmaking_contract_abi, signer);
                        signedContract.openPredictionMarket(parsedMessage.match_id).then((tx: any) => {
                            console.log(tx);
                        })

                        //wait for 30 seconds asyncly without blocking the main thread
                        //before a contract function call is sent
                        setTimeout(async () => {
                            existingMatch.match_status = MatchState.STARTED;
                            existingMatch.startMatch();
                        }, 30000);
                    }

                    //this.matchmaking_contract.joinMatch(parsedMessage.match_id);
                }
                else if(parsedMessage.type === "input"){
                    //check if match exists or not
                    //if it exists get the player1 address from the match
                    //check if the signature is valid
                    //if it is valid, allow to connect
                    //else, disconnect the connection
                    console.log(parsedMessage);
                    let existingMatch: Match | undefined = this.match.find(m => m.match_id == Number(parsedMessage.match_id));
                    if(!existingMatch){
                        return;
                    }

                    //check if the match has started already or not
                    if(existingMatch.match_status != MatchState.STARTED){
                        return;
                    }

                    let input: any = parsedMessage.data;
                    let player = 0;
                    
                    /*
                    if(isValidSignature(JSON.stringify(input), parsedMessage.signature, existingMatch.player1_public_address)){
                        player = 1;
                        return;
                    }else if(isValidSignature(JSON.stringify(input), parsedMessage.signature, existingMatch.player2_public_address ?? "")){
                        player = 2;
                        return;
                    }
                    //making it simpler due to the time constraint    
                    */
                    let player_address = parsedMessage.playerAddress;
                    if(player_address == existingMatch.player1_public_address){
                        player = 1;
                    }else if(player_address == existingMatch.player2_public_address){
                        player = 2;
                    }


                    if (player != 0){
                    existingMatch.board.order(player, input.troopId, input.targetCoordinate);
                    }
                }
            });
        });

        pushUserSetup();
    }
}