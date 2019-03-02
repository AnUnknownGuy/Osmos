// This file is for functions about canvas

// Canvas wrapper class
class Canvas {
    constructor(options = {}) {
        this.doFit = options.fit || false;

        this.elem = document.createElement("canvas");
        this.elem.id = "canvas";
        this.elem.style = "border:1px solid #000000;";

        if (options.noContext === true)
            this.elem.oncontextmenu = e => e.preventDefault();

        if (this.doFit) {
            document.body.style.overflow = "hidden";
            document.body.style.margin = "0";

            this.fit();
            window.addEventListener("resize", () => this.fit());

            this.width = this.elem.width;
            this.height = this.elem.height;
        } else {
            this.width = (options.width != null ? options.width : 500);
            this.height = (options.height != null ? options.height : 500);

            this.setSize(this.width, this.height);
        }

        document.body.appendChild(this.elem);

        this.ctx = this.elem.getContext("2d");
    }

    fit() {
        this.setSize(window.innerWidth, window.innerHeight);
    }

    setSize(width, height) {
        this.width = this.elem.width = width;
        this.height = this.elem.height = height;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
}

CanvasRenderingContext2D.prototype.rectCtr = function(x, y, sx, sy) {
    //if (Vector != null) [x, y, sx, sy] = Vector.params2(x, y, sx, sy);
    this.beginPath();
    this.rect(x - sx / 2, y - sy / 2, sx, sy);
};

CanvasRenderingContext2D.prototype.poly = function(p1, ...points) {
    this.beginPath();
    this.moveTo(p1.x, p1.y);
    for (let p of points)
        this.lineTo(p.x, p.y);
};

CanvasRenderingContext2D.prototype.line = function(x, y, sx, sy) {
    //if (Vector != null) [x, y, sx, sy] = Vector.params2(x, y, sx, sy);
    this.beginPath();
    this.moveTo(x, y);
    this.lineTo(x + sx, y + sy);
};

new Canvas({fit:true});