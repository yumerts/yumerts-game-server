import { MatchmakingServer } from "./match-making-server";
import { GameServer } from "./game-server";
import { HttpServerPort } from "./constants/ports";
import * as express from "express"; 
import { Application, Request, Response, NextFunction } from 'express';

let matchmakingServer = new MatchmakingServer();
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