let remainingLife = 100;
let { canvas, context } = kontra.init();
let sprites = [];
let rocks = [];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

kontra.initKeys();

let rockImage = new Image();
rockImage.src = "/img/rock.png";
function createRock() {
  let rock = kontra.Sprite({
    x: canvas.width,
    y: Math.random() * canvas.height,
    image: rockImage,
    radius: 6, // we'll use this later for collision detection
    update() {
      this.x -= 2;
      if (this.x < 0) {
        this.x = 600;
        this.y = Math.random() * 600;
        this.collided = false;
      }
    },
  });
  rocks.push(rock);
  sprites.push(rock);
}
for (let i = 0; i < 4; i++) {
  setTimeout(createRock, i * 1000);
}

async function crashAnimation() {
  const el = document.getElementsByTagName("body")[0];
  for (let i = 0; i < 3; i++) {
    el.style.filter = "invert(0.4)";
    await sleep(150);
    el.style.filter = "";
    await sleep(150);
  }
}

function changeLife(newLife) {
  remainingLife = newLife > 100 ? 100 : newLife < 0 ? 0 : newLife;
  const lifebar = document.getElementById("lifebar");
  lifebar.style.width = `${remainingLife}%`;
}

let shipImage = new Image();
shipImage.src = "boat.png";
let ship = kontra.Sprite({
  x: 100,
  y: canvas.height / 2,
  radius: 6,
  image: shipImage,
  update() {
    // move the ship up and down
    if (kontra.keyPressed("arrowup")) {
      this.ddy = -1; // move the ship up by setting its vertical acceleration to -2
    } else if (kontra.keyPressed("arrowdown")) {
      this.ddy = 1; // move the ship down by setting its vertical acceleration to 2
    } else {
      this.ddy = 0; // reset the vertical acceleration if neither up nor down key is pressed
    }

    // rotate the ship based on the acceleration
    this.rotation = (1 / 30) * this.dy;

    // limit the ship's movement to the canvas
    if (this.y < 0) {
      this.y = 0;
      this.dy = 0;
    } else if (this.y + this.height > canvas.height) {
      this.y = canvas.height - this.height;
      this.dy = 0;
    }

    // check for collisions with rocks
    rocks.forEach((rock) => {
      if (!rock.collided && kontra.collides(this, rock)) {
        console.log("Ship collided with a rock!");
        rock.collided = true;
        changeLife(remainingLife - 30);
        crashAnimation();
      }
    });

    this.advance();
  },
});
sprites.push(ship);

let loop = kontra.GameLoop({
  update() {
    sprites.map((sprite) => {
      sprite.update();
    });
  },
  render() {
    sprites.map((sprite) => sprite.render());
  },
});
loop.start(); // start the game
//# sourceURL=userscript.js
