import { GameServerPort } from "./constants/ports";
import * as ws from "ws";
import { Match, MatchState } from "./matchmaking-logic/match";
import { ethers } from "ethers";

export class GameServer{

    private server: ws.WebSocketServer;
    private match: Match[];

    constructor(){
        this.server = new ws.WebSocketServer({ port: GameServerPort }, () => {
            console.log(`Matchmaking server started on port ${GameServerPort}`);
        });
        this.server.on("connection", function (wsConnection, _incomingMessage) {
            wsConnection.send("Connected to server");
            wsConnection.on("message", function (message) {
                // json message will typically come in this format
                // {"type": string, content: {}}
                //depending on the type, the content will be different
                try{
                    const data = JSON.parse(message.toString());
                    if(data.type == "join"){
                        const content = data.content;
                        const match_id = content.match_id;
                        const player_address = content.player_address;
                        const player_match_id_signature = content.player_match_id_signature;

                        //check if the signature is valid with match_id as the message (signed with etherenum private key)
                        const isValidSignature = (message: string, signature: string, address: string): boolean => {
                            const messageHash = ethers.id(message);
                            const recoveredAddress = ethers.recoverAddress(messageHash, signature);
                            return recoveredAddress.toLowerCase() === address.toLowerCase();
                        };

                        if (!isValidSignature(match_id, player_match_id_signature, player_address)) {
                            wsConnection.send("Invalid signature");
                            return;
                        }

                        //check if the match exists
                        let existingMatch: Match = this.match.find(m => m.id === match_id);
                        if(existingMatch){
                            if(existingMatch.match_status != MatchState.FINDING){
                                wsConnection.send("Match has already started");
                                return;
                            }
                            existingMatch.playerJoined(player_address);
                        }else{
                            let newMatch = new Match(match_id, player_address);
                            this.match.push(newMatch);
                        }
                    }else if(data.type == "input"){
                        const content = data.content;
                        const match_id = content.match_id;
                    }
                }catch(error){
                    wsConnection.send("Error parsing JSON");
                }
            });
        });
    }
}