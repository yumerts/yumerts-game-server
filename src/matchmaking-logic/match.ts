import { Address } from "viem";
import { Board } from "../game-logic/board";

export enum MatchState{
    FINDING,    //finding another player to join the match
    READY,      //ready for people to predict on the match
    STARTED,    //match has started
    ENDED,      //match has ended
    CANCELLED   //match has been cancelled
}

class SendingSchema{
    public type: string = "";
    public data: any;
}

export class Match{
    public match_id: number;

    public player1_public_address: string;
    public player2_public_address?: string;

    public player1_ws_connection?: WebSocket;
    public player2_ws_connection?: WebSocket;

    public match_status: MatchState;
    public board: Board = new Board("xxxxxcxcxcxcxcXxxxxxaxaxaxaxaXxxxxxiiiiiiiiiiXXXXXXXXXXXXXXXxxxxxIIIIIIIIIIXxxxxxAxAxAxAxAXxxxxxCxCxCxCxCX");

    constructor(match_id: number, player1_public_address: string){
        this.match_id = match_id;
        this.player1_public_address = player1_public_address;
        this.match_status = MatchState.FINDING;
    }

    public simulate(){
        if(this.match_status != MatchState.STARTED){
            return;
        }
        this.board.simulate();
    }

    public sendBoardState(){
        if(this.match_status != MatchState.STARTED){
            return;
        }

        let sendingSchema: SendingSchema = {
            type: "board_state",
            data: this.board.getBoardState()
        }
        if (this.player1_ws_connection) {
            this.player1_ws_connection.send(JSON.stringify(sendingSchema));
        }
        if (this.player2_ws_connection) {
            this.player2_ws_connection.send(JSON.stringify(sendingSchema));
        }
    }

    //some other player join the match
    public playerJoined(player2_public_address: string){
        this.player2_public_address = player2_public_address;

        let to_player1_schema: SendingSchema = {
            type: "match_joined",
            data: {
                match_id: this.match_id,
                opponent_public_address: player2_public_address
            }
        }

        let to_player2_schema: SendingSchema = {
            type: "match_joined",
            data: {
                match_id: this.match_id,
                opponent_public_address: this.player1_public_address
            }
        }

        if (this.player1_ws_connection) {
            this.player1_ws_connection.send(JSON.stringify(to_player1_schema));
        }

        if (this.player2_ws_connection) {
            this.player2_ws_connection.send(JSON.stringify(to_player2_schema));
        }

        this.match_status = MatchState.READY;
        
    }

    public startMatch(){
        let dataSchema : SendingSchema = {
            type: "match_started",
            data: {
                player1_public_address: this.player1_public_address,
                player2_public_address: this.player2_public_address
            }
        }

        this.match_status = MatchState.STARTED;
    }

    public endMatch(){    
        let dataSchema: SendingSchema = {
            type: "match_ended",
            data: {
                winner: this.board.getWinner()
            }
        }
        this.match_status = MatchState.ENDED;
    }
}