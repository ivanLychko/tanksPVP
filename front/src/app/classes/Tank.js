import config from '../config.json';
import { intersectionCircle, randomInt } from "../functions";

export default class Tank {

    #id;
    #isMain;
    #control;
    #liveId;
    radius;
    vector;
    #br = config.tank['size-bullet'];
    #canvas = null;
    #events = [];
    #HP = config.tank.HP;
    #amountBullet = config.tank["amount-bullet"];

    #audio = {
        'end': new Audio('sounds/end.mp3'),
        'fire': new Audio('sounds/fire.mp3'),
        'miss': new Audio('sounds/miss.mp3'),
        'point': new Audio('sounds/point.mp3'),
        'move': new Audio('sounds/move.mp3'),
    };

    #intervalHP;
    #intervalBullet;

    bullets = [];

    #actions = {
        'createTank': () => { },
        'addBullet': (bullet) => { },
        'newPlayer': (pos, line) => { },
        'line': (line) => { },
        'pos': (pos) => { },
        'die': (id, status) => { },
    };

    constructor(isMain = false, id = null, pos = { x: 0, y: 0 }, line = { x: 0, y: 0 }, radius = config.tank.size, control = "wasd") {

        this.radius = radius;
        this.line = line;
        this.pos = pos;
        this.#isMain = isMain;
        this.#control = control;

        this.vector = [
            [[0, -1], config.tank.controls[this.#control].up],
            [[0, 1], config.tank.controls[this.#control].down],
            [[-1, 0], config.tank.controls[this.#control].left],
            [[1, 0], config.tank.controls[this.#control].right]
        ].map(([dir, code]) => ({
            direction: dir,
            code: code,
            speed: 0,
            active: -1
        }));

        if (isMain) this.action('createTank');
        else if (id) this.#id = id;
        else throw new Error('invalid argv in Tank');
    }

    get id() {
        return this.#id;
    }

    set id(val) {
        if (!this.#id)
            this.#id = val;
    }

    get isMain() {
        return this.#isMain;
    }

    get amountBullet() {
        return this.#amountBullet;
    }

    get HP() {
        return this.#HP;
    }

    set canvas(val) {
        if (!this.#canvas)
            this.#canvas = val;
    }

    get canvas() {
        return this.#canvas;
    }
    
    #playAudio(name) {
        if (!window.volume) return;

        if(name !== 'move') this.#audio[name].currentTime = 0;
        this.#audio[name].play();
    }

    setDmg(b) {
        if (!b.noneDmg) {
            this.#HP -= 1;
            this.#playAudio('point');
        }
        if (this.#HP <= 0) setTimeout(() => this.#die(), 300);
    }

    action(name, ...params) {
        if (this.#actions[name])
            this.#actions[name](...params);
    }

    actionSet(name, fn) {
        this.#actions[name] = fn;
    }

    addBullet(bullet) {
        if (this.#amountBullet <= 0) return;
        this.#amountBullet -= 1;

        this.bullets.push(bullet);
        this.#playAudio('fire');

        this.action('addBullet', bullet);
    }

    init() {
        this.#eventsInit();
        this.#initPos();

        if (this.#isMain) {
            this.action('newPlayer', this.pos, this.line);

            this.#intervalBullet = setInterval(() => {
                if (this.#HP < config.tank.HP)
                    this.#HP += 1;
            }, config.tank.timeRegenHP);

            this.#intervalHP = setInterval(() => {
                if (this.#amountBullet < config.tank["amount-bullet"])
                    this.#amountBullet += 1;
            }, config.tank.timeRegenBuller);
        }

        this.#liveId = setInterval(this.#live.bind(this), config.tank.speed);
    }

    uninit() {
        this.#eventsRemove();

        this.#canvas = null;

        clearInterval(this.#intervalHP);
        clearInterval(this.#intervalBullet);
        clearInterval(this.#liveId);
    }

    print() {
        if (!this.canvas) return;

        this.canvas.ctx.strokeStyle = "#000";
        if (this.#isMain) this.canvas.ctx.strokeStyle = "#0F0FF0";

        this.canvas.ctx.beginPath();
        this.canvas.ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI);
        this.canvas.ctx.stroke();

        let a = Math.atan2(this.line.y - this.pos.y, (this.line.x - this.pos.x)),
            x = Math.cos(a) * this.radius,
            y = Math.sin(a) * this.radius;

        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(this.pos.x + x, this.pos.y + y);
        this.canvas.ctx.lineTo(this.pos.x + x * 2, this.pos.y + y * 2);
        this.canvas.ctx.stroke();

        this.canvas.ctx.strokeStyle = "#000";
        this.#printBullets();
    }

    #eventKey(active, e) {
        this.vector.forEach(v => v.code === e.code && (v.active = active));
    }

    #eventMove(e) {
        this.line.x = e.offsetX;
        this.line.y = e.offsetY;

        this.action('line', this.line);
    }

    #die() {
        if (this.#canvas) {
            const status = this.isMain ? 'LOSE' : 'WIN';
            this.action('die', this.id, status);
            this.#playAudio('end');
            this.#canvas.endGame(status);
        }
    }

    #eventClick(e) {
        let a = Math.atan2((e.offsetY - this.pos.y), (e.offsetX - this.pos.x)),
            x = Math.cos(a),
            y = Math.sin(a);

        this.addBullet({
            to: [x, y],
            pos: [
                this.pos.x + x * this.radius * 2,
                this.pos.y + y * this.radius * 2
            ],
            explode: 0
        });
    }

    #initPos() {
        const tanksPos = this.canvas.elements.filter(el => el.id != this.id).map(el => ({ ...el.pos, r: el.radius }));
        do {
            this.pos.x = randomInt(this.radius, this.canvas.ctx.canvas.width - this.radius);
            this.pos.y = randomInt(this.radius, this.canvas.ctx.canvas.height - this.radius);
        } while (tanksPos.some(tank => intersectionCircle(tank, { ...this.pos, r: this.radius })))
    }

    #live() {
        if (!this.canvas) return;

        if (this.#isMain) {
            const oldPos = { ...this.pos };

            this.vector.forEach(v => {
                v.speed = Math.min(2, Math.max(v.speed + 0.05 * v.active, 0))

                this.pos.x = Math.min(this.canvas.ctx.canvas.width - this.radius, Math.max(this.pos.x + v.direction[0] * v.speed, 0 + this.radius));
                this.pos.y = Math.min(this.canvas.ctx.canvas.height - this.radius, Math.max(this.pos.y + v.direction[1] * v.speed, 0 + this.radius));

                const tanksPos = this.canvas.elements.filter(el => el.id != this.id).map(el => ({ ...el.pos, r: el.radius }));

                if (tanksPos.some(tank => intersectionCircle(tank, { ...this.pos, r: this.radius }))) {
                    this.pos = { ...oldPos };
                }

            });

            if (oldPos.x != this.pos.x || this.pos.y != oldPos.y) {
                this.action('pos', this.pos);
            }
        }

        this.bullets.filter(b => b.explode === 0).forEach(b => {
            b.pos[0] += b.to[0] * 3;
            b.pos[1] += b.to[1] * 3;
        });

        this.bullets.forEach((b1, i) => {

            if (b1.explode)
                b1.explode += 0.5;

            if (config.tank.isBulletBrakOnTank) {
                const tanks = this.canvas.elements.filter(el => el.id != this.id);
                const tank = tanks.find(tank => intersectionCircle({ ...tank.pos, r: tank.radius }, { x: b1.pos[0], y: b1.pos[1], r: this.#br }));
                if (tank) {
                    tank.setDmg(b1);
                    b1.explode = b1.explode || 0.1;
                    b1.noneDmg = true;
                    return;
                }
            }

            if (config.tank.isBulletBrakOnBuller) {
                for (var j = i + 1; j < this.bullets.length; j++) {
                    let b2 = this.bullets[j];
                    let dx = b2.pos[0] - b1.pos[0];
                    let dy = b2.pos[1] - b1.pos[1];
                    let r1 = this.#br + b1.explode;
                    let r2 = this.#br + b2.explode;
                    if (dx * dx + dy * dy < r1 * r1 + r2 * r2) {
                        b1.explode = b1.explode || 0.1;
                        b2.explode = b2.explode || 0.1;
                        return;
                    }
                }
            }

            if (config.tank.isBulletBrakOnBorder) {
                if (b1.pos[0] < this.#br || b1.pos[0] > canvas.width - this.#br ||
                    b1.pos[1] < this.#br || b1.pos[1] > canvas.height - this.#br) {
                    if (b1.explode === 0) {
                        this.#playAudio('miss');
                    }
                    b1.explode = b1.explode || 0.1;
                }
            }
        })

        this.bullets = this.bullets.filter(b => b.explode < 20)
    }

    #printBullets() {
        if (!this.canvas) return;
        this.bullets.forEach(b => {
            if (b.explode) {
                const grad = this.#canvas.ctx.createRadialGradient(b.pos[0], b.pos[1], (this.#br + b.explode) / 2, b.pos[0], b.pos[1], this.#br + b.explode);

                grad.addColorStop(0.1, "#FF0000");
                grad.addColorStop(0.2, "#00FF00");
                grad.addColorStop(0.3, "#00FF00");
                grad.addColorStop(1, "#0000FF");
                grad.addColorStop(1, "#FF0000");

                this.canvas.ctx.fillStyle = grad;

            }
            this.canvas.ctx.beginPath();
            this.canvas.ctx.arc(b.pos[0], b.pos[1], this.#br + b.explode, 0, 2 * Math.PI);
            if (b.explode) {
                this.canvas.ctx.fill()
            } else {

                this.canvas.ctx.stroke()
            }
        })
    }

    #eventsInit() {
        if (!this.#isMain) return;

        this.#events = [
            {
                fn: this.#eventKey.bind(this, 1),
                type: "keydown"
            },
            {
                fn: this.#eventKey.bind(this, -1),
                type: "keyup"
            },
            {
                fn: this.#eventMove.bind(this),
                type: "mousemove"
            },
            {
                fn: this.#eventClick.bind(this),
                type: "click"
            }
        ];

        this.#events.forEach(ev => document.addEventListener(ev.type, ev.fn));
    }

    #eventsRemove() {
        if (!this.#isMain) return;

        this.#events.forEach(ev => document.removeEventListener(ev.type, ev.fn));
    }
}
