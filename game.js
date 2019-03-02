// Vector class, with various useful methods
const c = document.getElementById("canvas");
const ctx = c.getContext("2d");
class Vector {
    constructor(x, y) {
        [x, y] = Vector.params(x, y);
        this.x = x;
        this.y = y;

        return this;
    }

    static params(x, y) {
        if (x == null) return [0, 0];
        if (x.x != null && x.y != null) return [x.x, x.y];
        else if (y == null) return [x, x];
        else return [x, y];
    }

    static params2(x1, y1, x2, y2) {
        if (x1 == null) return [0, 0];
        if (x1.x != null && x1.y != null) [x1, y1, x2, y2] = [x1.x, x1.y, y1, x2];
        if (x2.x != null && x2.y != null) [x2, y2] = [x2.x, x2.y];
        return [x1, y1, x2, y2];
    }

    add(x, y) {
        [x, y] = Vector.params(x, y);
        this.x += x;
        this.y += y;

        return this;
    }

    static add(x1, y1, x2, y2) {
        [x1, y1, x2, y2] = Vector.params2(x1, y1, x2, y2);
        return new Vector(x1 + x2, y1 + y2);
    }

    mult(x, y) {
        [x, y] = Vector.params(x, y);
        this.x *= x;
        this.y *= y;

        return this;
    }

    sub(x, y) {
        [x, y] = Vector.params(x, y);
        this.x -= x;
        this.y -= y;

        return this;
    }

    static sub(x1, y1, x2, y2) {
        [x1, y1, x2, y2] = Vector.params2(x1, y1, x2, y2);
        return new Vector(x1 - x2, y1 - y2);
    }

    static random() {
        return new Vector(Math.random(), Math.random());
    }
}

class AbstractEntity{
    constructor(pos, size, shape, speed = new Vector(0, 0), angle=0, angleSpeed=0){

        if (new.target === AbstractEntity) {
            throw new TypeError("Cannot construct AbstractEntity instances directly");
        }

        this.pos = pos;
        this.size = size;
        this.speed = speed;
        this.shape = shape;
        this.angle = angle;
        this.angleSpeed = angleSpeed;
        this.alive = true;
    }

    update(){
        this.pos = this.pos.add(this.speed);
        this.angle += this.angleSpeed;
    }

    draw(){
        this.shape.draw(this.pos, this.size, this.angle);
    }

    overlap(entity){

        if(entity.size < 0 || this.size < 0)
            return false;

        //console.log("ici");
        let dist = Math.sqrt((this.pos.x-entity.pos.x)*(this.pos.x-entity.pos.x)+(this.pos.y-entity.pos.y)*(this.pos.y-entity.pos.y));
        //console.log(dist);
        return this.size+entity.size > dist;
    }

    addArea(area){
        let newArea = this.size * this.size * Math.PI + area;
        this.size = Math.sqrt(newArea/Math.PI);
    }

    decreaseSize(dist){
        this.size -= dist;

        if(this.size <= 0){
            this.alive = false;
        }
    }

    absorb(entity){
        let dist = Math.sqrt((this.pos.x-entity.pos.x)*(this.pos.x-entity.pos.x)+(this.pos.y-entity.pos.y)*(this.pos.y-entity.pos.y));
        let distOverlap = -dist + this.size + entity.size;

        let lit =entity.size-distOverlap;
        let area = entity.size*entity.size*Math.PI - lit*lit*Math.PI;

        this.addArea(area);
        entity.decreaseSize(distOverlap);

    }
}

class RoundEntity extends AbstractEntity{
    constructor(pos, size, speed = new Vector(0, 0)){
        super(pos, size, new Circle(), speed);
    }
}

class Player extends RoundEntity{
    constructor(pos = new Vector(300, 500)){
        super(pos, 50);
    }

    update(){
        let angle = Math.atan2(-(this.pos.y-Mouse.y), (this.pos.x-Mouse.x));
        //console.log(angle);
        if(Mouse.down()){

            this.speed.add(Math.cos(angle)*0.5,-Math.sin(angle)*0.5);
        }
        super.update();
    }
}

class AbstractShape{
    constructor(draw){
        if (new.target === AbstractEntity) {
            throw new TypeError("Cannot construct AbstractEntity instances directly");
        }
        this.drawIt = draw;
    }

    draw(pos, size, angle){
        this.drawIt(pos, size, angle);
    }
}

class Circle extends AbstractShape{
    constructor(){
        super(function(pos, size, color, angle){
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, size, 0, 2 * Math.PI);
            ctx.stroke();
        });
    }
}

class Game{
    constructor() {
        this.objects = [];
    }

    start(){
        this.objects.push(new Player());
        this.objects.push(new RoundEntity(new Vector(600, 400),20, new Vector(0,0)));
    }
    update(){
        Mouse.update();
        ctx.clearRect(0, 0, c.width, c.height);

        for (let obj of this.objects) {
            obj.update();

            for (let obj2 of this.objects) {
                if(obj.size > obj2.size){
                    if(obj.overlap(obj2)){
                        obj.absorb(obj2);
                    }
                }
            }
        }

        this.objects = this.objects.filter(function (obj) {
            return obj.alive;
        });

        /*
        this.objects.forEach(function (obj) {
            obj.update();

            this.objects.forEach(function (obj2) {
                if(obj.size > obj2.size){
                    if(obj.overlap(obj2)){
                        obj.absorb(obj2);
                    }
                }

            });

        });*/

        this.objects.forEach(function (obj) {
            obj.draw();
        })
    }
}



window.onload = function () {
    let game = new Game();
    game.start();
    setInterval(() => game.update(), 1000/60);
};

