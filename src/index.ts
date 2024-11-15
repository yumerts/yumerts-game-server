import { GameServer } from "./game-server";
import { HttpServerPort } from "./constants/ports";
import * as express from "express"; 
import { Application, Request, Response, NextFunction } from 'express';

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
    gameServer.match.forEach(match => match.simulate());
}, 250);