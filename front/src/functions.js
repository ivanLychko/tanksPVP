export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}
export function intersectionCircle(el1, el2) {
    let rs = el1.r + el2.r;
    let x = Math.abs(el1.x - el2.x);
    let y = Math.abs(el1.y - el2.y);

    return (rs > x && rs > y);
}