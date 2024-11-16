import { GameServer } from "./game-server";
import { HttpServerPort } from "./constants/ports";
import express from "express"; 
import { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { MatchState } from "./matchmaking-logic/match";

let gameServer = new GameServer();

//create a http server with express
const app = express();
const port = HttpServerPort;

// Enable CORS for all origins
app.use(cors());

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

//poll this api to get the matches
app.post('/api/v1/matches', (_req: Request, res: Response) => {
    //get all the matches in gameServer.match regardless of its state and send it to client
    //foreach match use getMatchInfo function
    let matchInfo = gameServer.match.map(match => match.getMatchInfo());
    res.send(JSON.stringify(matchInfo, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
    ));
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});


setInterval(() => {
    gameServer.match.forEach(function(match) {
        match.simulate();
        match.sendBoardState();
        if (match.board.getWinner()) {
            match.endMatch();
        }
    });
}, 250);