import { Board } from "../game-logic/board";

export enum MatchState{
    FINDING,    //finding another player to join the match
    READY,      //ready for people to predict on the match
    STARTED,    //match has started
    ENDED,      //match has ended
    CANCELLED   //match has been cancelled
}

//local server enum during the "ready stage"
export enum ReadyState{
    NOT_READY,
    WAITING,
    REQUEST_FOR_ATTENDANCE,
    BUFFER,
    READY
}

class SendingSchema{
    public type: string = "";
    public data: any;
}

export class Match{
    [x: string]: any;
    public match_id: number;

    public player1_public_address: string;
    public player2_public_address?: string;

    public player1_ws_connection?: WebSocket;
    public player2_ws_connection?: WebSocket;

    public match_status: MatchState;
    public match_ready_status: ReadyState;

    public board: Board = new Board("xxxxxcxcxcxcxcXxxxxxaxaxaxaxaXxxxxxiiiiiiiiiiXXXXXXXXXXXXXXXxxxxxIIIIIIIIIIXxxxxxAxAxAxAxAXxxxxxCxCxCxCxCX");

    public player1_predictor: string[];
    public player2_predictor: string[];

    public player1_signed: boolean = false;
    public player2_signed: boolean = false;

    constructor(match_id: number, player1_public_address: string){
        this.match_id = match_id;
        this.player1_public_address = player1_public_address;
        this.match_status = MatchState.FINDING;
        this.match_ready_status = ReadyState.NOT_READY;
        this.player1_predictor = [];
        this.player2_predictor = [];
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

    public requestForAttendance(){
        let dataSchema: SendingSchema = {
            type: "request_for_attendance",
            data: {
                match_id: this.match_id
            }
        }
        this.match_ready_status = ReadyState.REQUEST_FOR_ATTENDANCE;    
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

    public getMatchInfo(){
        return {
            match_id: this.match_id,
            player1_public_address: this.player1_public_address,
            player2_public_address: this.player2_public_address,
            match_status: this.match_status
        }
    }

    public addPrediction(player: number, predictor: string){
        if(player == 1){
            this.player1_predictor.push(predictor);
        }else{
            this.player2_predictor.push(predictor);
        }
    }

    public getWinningPredictors(winner_player: number){
        if(winner_player == 1){
            return this.player1_predictor;
        }else{
            return this.player2_predictor;
        }
    }

    public getLosingPredictors(winner_player: number){
        if(winner_player == 1){
            return this.player2_predictor;
        }else{
            return this.player1_predictor;
        }
    }
}