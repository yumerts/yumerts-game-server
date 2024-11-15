export enum MatchState{
    FINDING,    //finding another player to join the match
    READY,      //ready for people to predict on the match
    STARTED,    //match has started
    ENDED,      //match has ended
    CANCELLED   //match has been cancelled
}

export class Match{
    public match_id: number;
    public player1_address: string;
    public player2_address?: string;
    public match_status: MatchState;

    constructor(match_id: number, player1_address: string){
        this.match_id = match_id;
        this.player1_address = player1_address;
        this.match_status = MatchState.FINDING;
    }

    //some other player join the match
    public playerJoined(player2_address: string){
        this.player2_address = player2_address;
        this.match_status = MatchState.READY;
    }

    public startMatch(){
        this.match_status = MatchState.STARTED;
    }

    public endMatch(){
        this.match_status = MatchState.ENDED;
    }
}