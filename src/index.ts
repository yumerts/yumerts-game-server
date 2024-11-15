import { GameServer } from "./game-server";
import { HttpServerPort } from "./constants/ports";
import * as express from "express"; 
import { Application, Request, Response, NextFunction } from 'express';

let gameServer = new GameServer();

//create a http server with express
const app = express();
const port = HttpServerPort;

let matches = [];

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get("/api/get-matches", (req: Request, res: Response, next: NextFunction) => {
    res.send(matches);
})

app.get("/api/create-match", (req: Request, res: Response, next: NextFunction) => {
    res.send("")
})

app.get("/api/join-match", (req: Request, res: Response, next: NextFunction) => {

})

app.get("/api/start-match", (req: Request, res: Response, next: NextFunction) => {

})

app.get("/api/end-match", (req: Request, res: Response, next: NextFunction) => {

})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});