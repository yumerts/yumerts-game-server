import { GameServer } from "./game-server";
import { HttpServerPort } from "./constants/ports";
import * as express from "express"; 
import { Application, Request, Response, NextFunction } from 'express';
import { MatchState } from "./matchmaking-logic/match";

let gameServer = new GameServer();

//create a http server with express
const app = express();
const port = HttpServerPort;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

setInterval(() => {
    gameServer.match.forEach(function(match) {
        match.simulate();
        if(match.match_status == MatchState.STARTED){
            let board_state = match.board.getBoardState();
            match.player1_ws_connection.send(board_state);
            match.player2_ws_connection.send(board_state);
        }
    });
}, 250);