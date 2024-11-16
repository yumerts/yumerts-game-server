export class Coordinate {
    x: number;
    y: number;

    constructor(x: number, y: number){
        this.x = x;
        this.y = y;
    }

    distanceTo(coordinate: Coordinate){
        return Math.abs(this.x - coordinate.x) + Math.abs(this.y - coordinate.y);
    }
}