import { GameServer } from "./game-server";
import { HttpServerPort } from "./constants/ports";
import express from "express"; 
import { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { MatchState } from "./matchmaking-logic/match";
import {TappdClient} from '@phala/dstack-sdk'
import { getTEEPublicKey } from "./utils/deriveKey";
import 'dotenv/config'

export const dynamic = 'force-dynamic'

const endpoint = process.env.DSTACK_SIMULATOR_ENDPOINT || 'http://localhost:8090'

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

app.get('/api/tdxquote', async (req: Request, res: Response) => {
    const client = new TappdClient(endpoint)
    const randomNumString = Math.random().toString();
    // Generate Remote Attestation Quote based on a random string of data
    const getRemoteAttestation = await client.tdxQuote(randomNumString);
    // Return Remote Attestation result
    res.status(200).json({ getRemoteAttestation });
});

app.get('/api/tee_wallet_address', async (req: Request, res: Response) => {
    res.status(200).json({ TEE_Wallet_Address: getTEEPublicKey() });
});

app.listen(port, () => {
    console.log(`TEE App is running at http://localhost:${port}`);
});


setInterval(() => {
    gameServer.match.forEach(function(match) {
        match.simulate();
        match.sendBoardState();
        if (match.board.getWinner() != undefined && match.match_status == MatchState.STARTED) {
            match.endMatch();
        }
    });
}, 250);