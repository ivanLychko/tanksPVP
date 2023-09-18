import { getClassMethods } from "../functions";
import { io } from "socket.io-client";
import Tank from "./Tank";

export default class Socket {

    constructor(canvas) {
        this.connection = io(process.env.SERVER_URL, {
            transports: ['polling', 'websocket'],
            credentials: true
        });
        this.connection.canvas = canvas;

        const tank = new Tank(true);

        tank.actionSet('createTank', () =>
            this.connection.on("createTank", ({ id }) => tank.id = id));

        tank.actionSet('addBullet', bullet =>
            this.connection.emit('addBullet', bullet));

        tank.actionSet('newPlayer', (pos, line) =>
            this.connection.emit("newPlayer", { pos, line }));

        tank.actionSet('die', (id, status) =>
            this.connection.emit('die', { id, status }));

        tank.actionSet('line', line => {
            this.connection.emit("line", line);
        });

        tank.actionSet('pos', pos =>
            this.connection.emit('pos', { pos }));

        getClassMethods(Socket).forEach((name) => {
            this.connection.on(name, this[name]);
        });

        canvas.addElement(tank);
    }

    init(data) {
        Object.entries(data).forEach(([id, { pos, line }]) => {
            this.canvas.addElement(new Tank(false, id, pos, line));
        });
    }

    newPlayer({ id }) {
        this.canvas.addElement(new Tank(false, id));
    }

    line({ id, data }) {
        const element = this.canvas.getElementById(id);
        if (element) element.line = data;
    }

    pos({ id, pos }) {
        const element = this.canvas.getElementById(id);
        if (element) element.pos = pos;
    }

    die({ id }) {
        this.canvas.endGame(this.canvas.getMainElement().id === id ? 'LOSE' : 'WIN');
    }

    end({ id }) {
        this.canvas.endGame(this.canvas.getMainElement().id === id ? 'LOSE' : 'WIN');
        this.disconnect();
    }

    addBullet({ id, data }) {
        const element = this.canvas.elements.find(el => el.id === id);
        if (element) element.bullets.push(data);
    }

}
