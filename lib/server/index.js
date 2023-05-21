import http from 'http';
import express from 'express';
import cors from 'cors';
import Colyseus from 'colyseus';
import { monitor } from '@colyseus/monitor';
import MainGame from './rooms/mainGame.js';
const port = Number(process.env.PORT || 2567);
const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);
const gameServer = new Colyseus.Server({ server });
// Register room handlers
gameServer.define('main-game', MainGame);
// Register monitors AFTER room handlers
app.use('/colyseus', monitor());
gameServer.listen(port);
console.log(`Listening on wss://localhost:${port}`);
console.log(`Monitor on https://localhost:${port}/colyseus`);
