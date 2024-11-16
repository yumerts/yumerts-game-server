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

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

setInterval(() => {
    gameServer.match.forEach(function(match) {
        match.simulate();
        match.sendBoardState();
    });
}, 250);