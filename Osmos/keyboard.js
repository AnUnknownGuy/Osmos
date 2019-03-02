// This file is for functions dealing with user input

// Static class used for key presses handling
let Keyboard = {
    init(autoUpdate) {
        this.keys = {};
        this.states = {};

        window.addEventListener("keydown", evt => this.keys[evt.key] = true);
        window.addEventListener("keyup", evt => this.keys[evt.key] = false);

        if (autoUpdate) setInterval(this.update, 1000/60);
    },

    update() {
        for (let key in this.keys) {
            if (this.keys.hasOwnProperty(key)) {
                if (this.states[key] == null)
                    this.states[key] = 1;
                else if (this.keys[key])
                    this.states[key] = (this.states[key] <= 0 ? 1 : 2);
                else
                    this.states[key] = (this.states[key] > 0 ? -1 : 0);
            }
        }
    },

    press(key) {
        return (this.states[key] > 0);
    },

    down(key) {
        return this.states[key] === 1;
    },

    up(key) {
        return this.states[key] === -1;
    }
};

// Static class used for mouse presses handling
let Mouse = {
    init(opt = {}) {
        this.state = 0;
        this.button = null;

        this.x = this.y = -1;
        this.off = {x: opt.x, y: opt.y};

        window.addEventListener("mousedown", evt => {
            this.getPos(evt);
            this.button = evt.button;
        });
        window.addEventListener("mouseup", evt => {
            this.getPos(evt);
            this.button = null;
        });
        window.addEventListener("mousemove", evt => this.getPos(evt));

        if (opt.autoUpdate) setInterval(this.update, 1000/60);
    },

    getPos(evt) {
        if (this.off.x == null) {
            this.x = evt.clientX;
            this.y = evt.clientY;
        } else {
            this.x = evt.clientX - this.off.x;
            this.y = evt.clientY - this.off.y;
        }
    },

    update() {
        if (this.button != null)
            this.state = (this.state <= 0 ? 1 : 2);
        else
            this.state = (this.state > 0 ? -1 : 0);
    },

    press() {
        return (this.state > 0);
    },

    down() {
        return (this.state === 1);
    },

    up() {
        return (this.state === -1);
    }
};

Mouse.init({x:0, y:0, });

