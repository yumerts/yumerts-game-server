import { GameServerPort } from "./constants/ports";
import * as ws from "ws";
import { Match, MatchState } from "./matchmaking-logic/match";
import { ethers } from "ethers";

const isValidSignature = (message: string, signature: string, address: string): boolean => {
    const messageHash = ethers.id(message);
    const recoveredAddress = ethers.recoverAddress(messageHash, signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
};

export class GameServer{

    private server: ws.WebSocketServer;
    public match: Match[];

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
                        const player_ephemeral_public_key = content.player_ephemeral_public_key;
                        const player_match_id_signature = content.player_match_id_signature;
                        
                        //verifies with the smart contract to make sure the player has the right to join the match
                        //for now we will just check if the signature is valid or not

                        //check if the signature is valid with match_id as the message (signed with etherenum private key)

                        if (!isValidSignature(match_id, player_match_id_signature, player_ephemeral_public_key)) {
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
                            existingMatch.playerJoined(player_ephemeral_public_key);
                        }else{
                            let newMatch = new Match(match_id, player_ephemeral_public_key);
                            this.match.push(newMatch);
                        }
                    }else if(data.type == "input"){
                        const content = data.content;
                        const match_id = content.match_id;
                        const player_ephemeral_public_key = content.player_ephemeral_public_key;
                        const input: string = content.input;
                        const input_signature = content.input_signature;

                        //checks if the match even exists or not?
                        let existingMatch: Match = this.match.find(m => m.id === match_id);
                        if(!existingMatch){
                            wsConnection.send("Match does not exist");
                            return;
                        }

                        //check if the match is started
                        if(existingMatch.match_status != MatchState.STARTED){
                            wsConnection.send("Match has not started yet");
                            return;
                        }

                        //check if the signature is valid with input as the message (signed with etherenum private key)
                        if (!isValidSignature(input, input_signature, player_ephemeral_public_key)){
                            wsConnection.send("Invalid signature");
                            return;
                        }

                        //process the input
                        //for now we will just check if the input is valid or not
                        //if it is valid, we will update the board
                        //if it is not valid, we will ignore the input
                        let inputObject = JSON.parse(input);
                        if(inputObject.troopId && inputObject.targetCoordinate){
                            existingMatch.board.order(inputObject.troopId, inputObject.targetCoordinate);
                        }
                    }
                }catch(error){
                    wsConnection.send("Error parsing JSON");
                }
            });
        });
    }
}