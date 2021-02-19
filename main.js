const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particaleArray = [];
//change pos of letter
let offSetX = 0; //pixels
let offSetY = 0; //pixels
let contrast = 8 //set the clearity
let mouseDetectLen = 80;
let returnSpeed = 12; //return to basePos
let reflactSpeed = .1; //speed to go away from mouse
let maxConnectionDist = 15; // max dist at which it connect
let distApart = 10 //it is the distance b/w particles 

//handel mouse
const mouse = {
    x: null,
    y: null,
    radius: 100
}

window.addEventListener('mousemove', function(event) {
    // body...
    mouse.x = event.x;
    mouse.y = event.y;
    mouse.radius = 100;
});
//write text to show
ctx.fillStyle = 'white';
ctx.font = '30px Lato';
ctx.fillText('P', 0, 25);
//ctx.strokeStyle = 'rgba(255,255,255,' + opacity + ')';', 0, 25);

// scan the single pixel from given area of 100 x 100 square 
var textCoordinates = ctx.getImageData(0, 0, 100, 100);
//particles class
class Particle {
    constructor(x, y) {
        this.size = 2;
        this.density = (Math.random() * 20) + 5;        //create random no '0 to 30'
        
        function createVector(x, y) {
            const vec = {
                x: x,
                y: y
            };
            return vec;
        }

        this.subs = function(other) {
            return {
                x: this.pos.x - other.pos.x,
                y: this.pos.y - other.pos.y
            };
        }
        
        this.distance = function(other) {
            // body...
            let dx = other.pos.x - this.pos.x;
            let dy = other.pos.y - this.pos.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            return distance;
        }
        this.pos = createVector(x, y);
        this.basePos = createVector(this.pos.x, this.pos.y);
    }

    draw() {
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255,255,255'+ (this.density * 10) +')';
        ctx.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    update() {
        //clac the dist b/w mouse and each particles
        let dx = mouse.x - this.pos.x;
        let dy = mouse.y - this.pos.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        //this will create directional vector
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        //this will set max distance from which the particales start interaction with mouse
        let maxDist = mouse.radius;
        //this line of code will give us the value in fraction of how much distance of the particles from the mouse
        let force = (maxDist - distance) / maxDist * reflactSpeed;
        //now add this fraction to the dictional vector to make it realistic
        let directionX = 250 * (forceDirectionX * force) / this.density;
        let directionY = 250 * (forceDirectionY * force) / this.density;

        if (distance < mouseDetectLen) {
            this.pos.x -= directionX;
            this.pos.y -= directionY;
        } else {
            //this line of code will make particles to its original position
            if (this.pos.x !== this.basePos.x) {
                let dx = this.pos.x - this.basePos.x;
                this.pos.x -= dx / returnSpeed;
            }
            if (this.pos.y !== this.basePos.y) {
                let dy = this.pos.y - this.basePos.y;
                this.pos.y -= dy / returnSpeed;
            }
        }
    }
}

//this function call the function many time which we call in side this
function init(arg) {
    // body...
    particaleArray = [];

    for (let y = 0, y2 = textCoordinates.height; y < y2; y++) {
        for (let x = 0, x2 = textCoordinates.width; x < x2; x++) {
            if (textCoordinates.data[(y * 4 * textCoordinates.width) + (x * 4) + 3] > contrast) {
                let posX = x + offSetX;
                let posY = y + offSetY;
                //multiply it by 5 to make it zoom
                particaleArray.push(new Particle(posX * distApart, posY * distApart));
            }
        }
    }
    offSetX += 1;
}
init();

//console.log(particaleArray);
function animate() {
    // this function animate loop
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < particaleArray.length; i++) {
        particaleArray[i].draw();
        particaleArray[i].update();
    }
    connect();
    requestAnimationFrame(animate);
}

//call animation function to call start animation loop
animate();

function connect() {
    let opacity = 1;
    for (var a = 0; a < particaleArray.length; a++) {
        for (var b = a; b < particaleArray.length; b++) {
            //find distance b/w particles
            let dis = particaleArray[a].distance(particaleArray[b]);
            opacity = 1 - dis / maxConnectionDist;
            ctx.strokeStyle = 'rgba(255,255,255,' + opacity + ')';
            //30 wiil be the value for opacity dist
            if (dis < maxConnectionDist) {
                ctx.linewidth = 2;
                ctx.beginPath();
                ctx.moveTo(particaleArray[a].pos.x, particaleArray[a].pos.y);
                ctx.lineTo(particaleArray[b].pos.x, particaleArray[b].pos.y);
                ctx.closePath();
                ctx.stroke();
            }
        }
    }
}
