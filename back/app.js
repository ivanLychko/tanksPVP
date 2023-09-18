require("dotenv").config();

const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_URL,
        methods: ["GET"],
        credentials: true
    },
    transports: ['polling', 'websocket']

});

app.use(cors);

const lobbys = [];

io.on('connection', (socket) => {
    let lobby = lobbys.find(el => el.open);

    if (!lobby) {
        lobby = {
            open: true,
            point: {},
            players: {}
        };
        lobbys.push(lobby);
    } else {
        lobby.open = false;
    }

    function sendLobby(event, data) {
        Object.keys(lobby.players)
            .filter(p => p != socket.id)
            .forEach(p => socket.to(p).emit(event, data));
    }

    socket.emit("init", lobby.players);

    socket.emit("createTank", { id: socket.id });

    socket.on("reinit", () => {
        const tmp = { ...lobby.players };

        delete tmp[socket.id];

        socket.emit("init", tmp);

        socket.emit("createTank", { id: socket.id });
    })

    socket.on("newPlayer", ({ pos, line }) => {
        lobby.players[socket.id] = { pos, line };
        lobby.point[socket.id] = 0;
        sendLobby("newPlayer", { id: socket.id });
    });

    socket.on("addBullet", (data) => {
        sendLobby("addBullet", { id: socket.id, data });
    });

    socket.on("line", (data) => {
        if (!lobby.players[socket.id]) lobby.players[socket.id] = {};
        lobby.players[socket.id].line = data;
        sendLobby("line", { id: socket.id, data });
    });

    socket.on("pos", ({ pos }) => {
        if (!lobby.players[socket.id]) lobby.players[socket.id] = {};
        lobby.players[socket.id].pos = pos;
        sendLobby("pos", { id: socket.id, pos });
    });

    socket.on("die", ({ id, status }) => {
        lobbys.splice(lobbys.findIndex(el => Object.keys(el.players).some(p => p === id)), 1);

        sendLobby("buttonEnable", {});
    });

    socket.on("disconnect", () => {
        sendLobby("end", { id: socket.id });

        lobbys.splice(lobbys.findIndex(el => Object.keys(el.players).some(p => p === socket.id)), 1);
    });
});

server.listen(process.env.PORT);
