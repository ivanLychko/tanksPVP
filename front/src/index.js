import "./main.scss";
import Tank from "./app/classes/Tank";
import Canvas from "./app/classes/Canvas";

const refs = {
    start: document.querySelector('#start'),
    settings: document.querySelector('#settings'),
}

let canvas;

let reinit = false;

function init() {
    canvas = new Canvas('#canvas');
    canvas.addElement(new Tank(true));
    // if (reinit) {
    //     socket.emit('reinit');
    // }

    reinit = true;
}

refs.start.addEventListener("click", e => {
    socketInit();
    init();
    e.target.disabled = true;
});

function socketInit() {
    //if (window.socket) return;
    window.socket = io('ws://localhost:8080');

    socket.on("init", data => {
        Object.entries(data).forEach(([id, { pos, line }]) => {
            canvas.addElement(new Tank(false, id, pos, line));
        });
    });

    socket.on("newPlayer", ({ id }) => {
        canvas.addElement(new Tank(false, id));
    });

    socket.on("line", ({ id, data }) => {
        const element = canvas.getElementById(id);
        if (element) element.line = data;
    });

    socket.on("pos", ({ id, pos }) => {
        const element = canvas.getElementById(id);
        if (element) element.pos = pos;
    });
    socket.on("buttonEnable", () => {
        refs.start.disabled = false;
    });
    socket.on("end", ({ id }) => {
        canvas.endGame(canvas.getMainElement().id === id ? 'LOSE' : 'WIN');
        e.target.disabled = false;
        socket.disconnect();
    });

    socket.on("addBullet", ({ id, data }) => {
        const element = canvas.elements.find(el => el.id === id);
        if (element) element.bullets.push(data);
    });
}
