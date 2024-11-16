import { GameServer } from "./game-server";
import { HttpServerPort } from "./constants/ports";
import express from "express"; 
import { Application, Request, Response, NextFunction } from 'express';
import { MatchState } from "./matchmaking-logic/match";

let gameServer = new GameServer();

//create a http server with express
const app = express();
const port = HttpServerPort;

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

//poll this api to get the matches
app.get('api/v1/matches', (req: Request, res: Response) => {
    //get all the matches in gameServer.match regardless of its state and send it to client
    //foreach match use getMatchInfo function
    let matchInfo = gameServer.match.map(match => match.getMatchInfo());
    res.send(matchInfo);
})

setInterval(() => {
    gameServer.match.forEach(function(match) {
        match.simulate();
        match.sendBoardState();
    });
}, 250);