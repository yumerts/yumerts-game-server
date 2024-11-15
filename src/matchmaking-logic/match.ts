import { Address } from "viem";
import { Board } from "../game-logic/board";

export enum MatchState{
    FINDING,    //finding another player to join the match
    READY,      //ready for people to predict on the match
    STARTED,    //match has started
    ENDED,      //match has ended
    CANCELLED   //match has been cancelled
}

export class Match{
    public match_id: number;

    public player1_ephemeral_public_key: string;
    public player2_ephemeral_public_key?: string;

    public match_status: MatchState;
    public board: Board = new Board("xxxxxcxcxcxcxcXxxxxxaxaxaxaxaXxxxxxiiiiiiiiiiXXXXXXXXXXXXXXXxxxxxIIIIIIIIIIXxxxxxAxAxAxAxAXxxxxxCxCxCxCxCX");

    constructor(match_id: number, player1_ephemeral_public_key: string){
        this.match_id = match_id;
        this.player1_ephemeral_public_key = player1_ephemeral_public_key;
        this.match_status = MatchState.FINDING;
    }

    public simulate(){
        if(this.match_status != MatchState.STARTED){
            return;
        }
        this.board.simulate();
    }

    //some other player join the match
    public playerJoined(player2_ephemeral_public_key: string){
        this.player2_ephemeral_public_key = player2_ephemeral_public_key;
        this.match_status = MatchState.READY;
    }

    public startMatch(){
        this.match_status = MatchState.STARTED;
    }

    public endMatch(){
        this.match_status = MatchState.ENDED;
    }
}