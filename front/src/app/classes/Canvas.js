import config from "../config.json";

export default class Canvas {
    #ctx;
    #panel = document.querySelector('#status');
    #elements = [];
    #animationId;

    constructor(selector, typeCtx = '2d') {
        let element = selector;
        if (typeof element == 'string')
            element = document.querySelector(selector);

        this.width = element.width;
        this.height = element.height;

        this.#ctx = element.getContext(typeCtx);

        this.#draw();
        this.#panel.classList.add('active');
    }

    get elements() {
        return this.#elements;
    }

    get ctx() {
        return this.#ctx;
    }

    addElement(el) {
        if (!el.print) return false;

        this.#elements.push(el);

        el.canvas = this;

        el.init();

        return true;
    }

    removeElement(el) {
        if (this.#elements.indexOf(el) < 0) return false;

        el.uninit();

        this.#elements.splice(this.#elements.indexOf(el), 1);

        return true;
    }

    getElementById(id) {
        return this.elements.find(el => el.id === id);
    }

    getMainElement() {
        return this.elements.find(el => el.isMain);
    }

    showTextInCenter(text, color) {
        this.#ctx.font = "bold 48px verdana,sans-serif";
        this.#ctx.textAlign = "left";
        this.#ctx.textBaseline = "bottom";

        const size = this.#ctx.measureText(text);
        if (text === 'WIN') this.#ctx.fillStyle = "#00FF00";
        else this.#ctx.fillStyle = "#FF0000";
        this.#ctx.strokeText(text, this.#ctx.canvas.width / 2 - 50, this.#ctx.canvas.height / 2);
        this.#ctx.fillText(text, this.#ctx.canvas.width / 2 - 50, this.#ctx.canvas.height / 2);
    }

    endGame(status) {
        this.#elements.forEach((el) => this.removeElement(el));

        this.#ctx.clearRect(0, 0, this.width, this.height);
        cancelAnimationFrame(this.#animationId);
        this.showTextInCenter(status);
        this.#panel.classList.remove('active');
    }

    #draw() {
        this.#ctx.clearRect(0, 0, this.width, this.height);
        const main = this.getMainElement();

        if (config.canvas.shadow && main && this.elements.length > 1) {
            this.#ctx.fillStyle = "#000";
            this.#ctx.fillRect(0, 0, this.width, this.height);

            const grad = this.#ctx.createRadialGradient(main.pos.x, main.pos.y, (main.radius * config.canvas["size-shadow"]) / 2, main.pos.x, main.pos.y, main.radius * config.canvas["size-shadow"]);

            grad.addColorStop(0, "#fff");
            grad.addColorStop(1, "#101000");
            grad.addColorStop(1, "#100000");

            this.#ctx.fillStyle = grad;
            this.#ctx.beginPath();
            this.#ctx.arc(main.pos.x, main.pos.y, main.radius * config.canvas["size-shadow"], 0, 2 * Math.PI, false);
            this.#ctx.fill();
            this.#ctx.fillStyle = "#000";
        }

        this.#elements.forEach(el => el.print());
        if (main)
            this.#panel.innerHTML = `<span><b>Bullets</b>: ${main.amountBullet}</span> <span><b>HP</b>: ${main.HP}</span>`;

        this.#animationId = requestAnimationFrame(this.#draw.bind(this));

        return this;
    }
}
