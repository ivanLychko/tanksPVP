import Tank from "./Tank";

export default class Bot {
    #canvas;

    constructor(canvas) {
        this.#canvas = canvas;

        const tank = new Tank(true);

        canvas.addElement(tank);
    }
}
