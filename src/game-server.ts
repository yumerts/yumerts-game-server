import { GameServerPort } from "./constants/ports";
import * as ws from "ws";

export class GameServer{
    private server: ws.WebSocketServer;
    constructor(){
        this.server = new ws.WebSocketServer({ port: GameServerPort }, () => {
            console.log(`Matchmaking server started on port ${GameServerPort}`);
        });
        this.server.on("connection", function (wsConnection, _incomingMessage) {
            wsConnection.send("Connected to server");
        });
    }
}