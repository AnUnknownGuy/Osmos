// Vector class, with various useful methods
const c = document.getElementById("canvas");
const ctx = c.getContext("2d");
ctx.lineWidth = 4;

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

let camera = new Vector(0,0);
let center = new Vector(500,500);
let playerSize = 1;
let scale = 1;
let objects = [];

class Grille{
    constructor(size, espacement = 25){
        this.size = size;
        this. espacement = espacement;
    }
    draw(){

        ctx.lineWidth = 2;

        ctx.strokeStyle = "#111111";
        ctx.strokeRect(camera.x, camera.y, this.size.x *scale, this.size.y*scale );

        for(let i =0; i < this.size.x;  i += this.espacement){
            ctx.beginPath();
            ctx.moveTo(camera.x+i*scale, camera.y);
            ctx.lineTo(camera.x+i*scale, camera.y+this.size.y*scale);
            ctx.stroke();
        }

        for(let i =0; i < this.size.y;  i += this.espacement){
            ctx.beginPath();
            ctx.moveTo(camera.x+0, camera.y+i*scale);
            ctx.lineTo(camera.x+this.size.x*scale, camera.y+i*scale);
            ctx.stroke();
        }
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

    update(grille){
        this.pos = this.pos.add(this.speed);
        this.angle += this.angleSpeed;

        if(this.pos.x + this.size > grille.size.x){
            this.pos = new Vector(this.pos.x -(this.pos.x + this.size - grille.size.x), this.pos.y);
            this.speed.x *=-1;
            //console.log("droite");
        }

        if(this.pos.x - this.size < 0){
            this.pos = new Vector(this.pos.x-(this.pos.x -this.size), this.pos.y);
            this.speed.x *=-1;
            //console.log("gauche");
        }

        if(this.pos.y + this.size > grille.size.y){
            this.pos = new Vector(this.pos.x, this.pos.y -(this.pos.y + this.size - grille.size.y));
            this.speed.y *=-1;
            //console.log("haut");
        }

        if(this.pos.y - this.size < 0){
            this.pos = new Vector(this.pos.x, this.pos.y-(this.pos.y -this.size));
            this.speed.y *=-1;
            //console.log("bas");
        }
    }

    draw(){
        this.shape.draw(this.pos, this.size, this.angle);
    }

    overlap(entity){

        if(entity.size < 0 || this.size < 0)
            return false;

        let dist = Math.sqrt((this.pos.x-entity.pos.x)*(this.pos.x-entity.pos.x)+(this.pos.y-entity.pos.y)*(this.pos.y-entity.pos.y));
        return this.size+entity.size > dist;
    }

    addArea(area, speed){

        let newArea = this.size * this.size * Math.PI + area;
        let ratio = area/(this.size * this.size * Math.PI);

        let newSpeed = new Vector();

        newSpeed.x = (this.size * this.size * Math.PI * this.speed.x + speed.x * area)/ newArea;
        newSpeed.y = (this.size * this.size * Math.PI * this.speed.y + speed.y * area) / newArea ;

        this.speed = newSpeed;

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

        let lit = entity.size-distOverlap;
        let area = entity.size*entity.size*Math.PI - lit*lit*Math.PI;

        this.addArea(area, entity.speed);
        entity.decreaseSize(distOverlap);

    }
}

class RoundEntity extends AbstractEntity{
    constructor(pos, size, speed = new Vector(0,0)){
        super(pos, size, new Circle(), speed);
    }
}

class Player extends RoundEntity{
    constructor(pos = new Vector(300, 500)){
        super(pos, 40);
    }

    update(grille){

        if(Mouse.down()){
            this.shoot();
        }
        super.update(grille);
    }

    shoot(){

        let angle = Math.atan2(-(center.y -Mouse.y), (center.x -Mouse.x));

        this.speed.add(Math.cos(angle)*(1/scale),-Math.sin(angle)*(1/scale));

        let area = this.size * this.size * Math.PI;

        let size = Math.sqrt((area*0.02)/Math.PI);

        let pos = new Vector(this.pos.x + -Math.cos(angle) * (this.size + size), this.pos.y + Math.sin(angle) * (this.size + size));

        this.size = Math.sqrt((area*0.98)/Math.PI);

        objects.push(new RoundEntity(pos, size, new Vector(-Math.cos(angle) + this.speed.x, Math.sin(angle) + this.speed.y)));


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
        super(function(pos, size, v, angle){
            let r,b;

            let dif = size-playerSize;
            if (dif<0)
                dif=-dif;

            if(size === playerSize) {
                v = 50;
            }


            if(size >= playerSize){
                r = 50 + 150* (1-(1/(1+dif)));
                b = 150 * (1/(1+dif)) ;
            }else{
                r = 150 * (1/(1+dif)) ;
                b = 50 + 150* (1-(1/(1+dif)));
            }
            //console.log(r,b);


            ctx.lineWidth = 4;
            ctx.strokeStyle = "rgb(" + r + "," + v + "," + b + ")";
            ctx.beginPath();
            ctx.arc((pos.x*scale + camera.x), (pos.y*scale + camera.y), size*scale, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.strokeStyle = "rgb(0,0,0)";
        });
    }
}

class Game{
    constructor() {
        this.grille = new Grille(new Vector(1000,600));
    }



    start(){
        objects.push(new Player());
        objects.push(new RoundEntity(new Vector(600, 400),20));
        objects.push(new RoundEntity(new Vector(100, 400),40));
        objects.push(new RoundEntity(new Vector(50, 500),20));
        objects.push(new RoundEntity(new Vector(200, 800),58));
        objects.push(new RoundEntity(new Vector(600, 800),53));
    }

    update(){
        Mouse.update();
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, c.width, c.height);
        this.grille.draw();

        for (let obj of objects) {

            obj.update(this.grille);

            if(obj instanceof Player){

                if((obj.size) > 15)
                    scale = scale*0.965 + (50 / (obj.size))*0.035;
                let xaxis = (camera.x*0.5 + (center.x -obj.pos.x*scale)*0.5);
                let yaxis = (camera.y*0.5 + (center.y - obj.pos.y*scale)*0.5);
                camera = new Vector(xaxis, yaxis);
                playerSize = obj.size;

            }

            for (let obj2 of objects) {
                if(obj.size >= obj2.size && obj !== obj2){
                    if(obj.overlap(obj2)){
                        obj.absorb(obj2);
                    }
                }
            }
        }

        objects = objects.filter(function (obj) {
            return obj.alive;
        });

        /*
        objects.forEach(function (obj) {
            obj.update();

            objects.forEach(function (obj2) {
                if(obj.size > obj2.size){
                    if(obj.overlap(obj2)){
                        obj.absorb(obj2);
                    }
                }

            });

        });*/

        objects.forEach(function (obj) {
            obj.draw();
        })
    }
}



window.onload = function () {
    let game = new Game();
    game.start();
    setInterval(() => game.update(), 1000/60);
};

