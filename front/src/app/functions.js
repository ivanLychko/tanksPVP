import refs from "./refs";

export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

export function intersectionCircle(el1, el2) {
    let rs = el1.r + el2.r;
    let x = Math.abs(el1.x - el2.x);
    let y = Math.abs(el1.y - el2.y);

    return (rs > x && rs > y);
}

export function disabledStartButtons() {
    refs.startOnline.disabled = true;
    refs.startBot.disabled = true;
}

export function enableStartButtons() {
    refs.startOnline.disabled = false;
    refs.startBot.disabled = false;
}

export function getClassMethods(className) {
    const exeption = [
        'constructor',
        "__defineGetter__",
        "__defineSetter__",
        "hasOwnProperty",
        "__lookupGetter__",
        "__lookupSetter__",
        "isPrototypeOf",
        "propertyIsEnumerable",
        "toString",
        "valueOf",
        "toLocaleString"
    ];
    
    if (!className instanceof Object) {
        throw new Error("Not a class");
    }
    let ret = new Set();

    function methods(obj) {
        if (obj) {
            let ps = Object.getOwnPropertyNames(obj);

            ps.forEach(p => {
                if (exeption.indexOf(p) > -1) return;
                
                if (obj[p] instanceof Function) {
                    ret.add(p);
                }
            });

            methods(Object.getPrototypeOf(obj));
        }
    }

    methods(className.prototype);

    return Array.from(ret);
}

export function showModal(title, html) {
    refs.modal.querySelector('#modal-header-title').innerHTML = title;
    refs.modal.querySelector('#modal-body').innerHTML = html;
    refs.modal.classList.add('active');
}

