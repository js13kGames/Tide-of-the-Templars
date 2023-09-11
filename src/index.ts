import kontra from 'kontra';
import rockImageSrc from "../assets/rock.png";
import boatImageSrc from "../assets/boat.png";
import fishImageSrc from "../assets/fish.png";
import waterSvg from "../assets/water.svg";

    let remainingLife = 100
    let hoursPassed = 0
    let { canvas, context } = kontra.init();
    let sprites = [];
    let rocks = [];
    let fishArray = [];
    const bodyDocument = document.getElementsByTagName("body")[0]
    const daysElement = document.getElementById("days-passed")
    const gameoverElement = document.getElementById("gameover")
    const background = document.getElementById('background')
    background.style.backgroundImage = `url(${waterSvg})`

    function timePassed(reset=false) {
      hoursPassed = reset ? 0 : hoursPassed+1
      if(hoursPassed % 12 == 0) {
        bodyDocument.classList.toggle('night')
      }
      if(hoursPassed % 24 == 0) {
        daysElement.innerHTML = `Day ${Math.floor(hoursPassed/24)+1}`
      }
    }

    setInterval(timePassed, 2500);

    const loop = kontra.GameLoop({
      update() {
        sprites.map(sprite => {
          sprite.update();
        })},
        render() {
          sprites.map(sprite => sprite.render());
        }
      });

    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }



    const rockImage = new Image();
    rockImage.src = rockImageSrc;

    function createRock() {
      let rock = kontra.Sprite({
        x: canvas.width,
        y: Math.random() * canvas.height,
        width: 30,     // width and height of the sprite rectangle
        height: 30,
        radius: 6,  // we'll use this later for collision detection
        image: rockImage,
        update(){
          this.x -= 2;
          if (this.x < 0) {
            this.x = 600;
            this.y = Math.random() * 600;
            this.collided = false
          }
        }
      });
      rocks.push(rock);
      sprites.push(rock);
    }
    function initSprites(){
      for (let i = 0; i < 4; i++) {
        setTimeout(createRock, i * 1000);
      }
      for (let i = 0; i < 2; i++) {
        setTimeout(createFish, i * 5000);
      }
    }

    initSprites()

    function gameover() {
      loop.stop()
      document.getElementById("result").innerHTML = `You navigated ${hoursPassed} hours`
      gameoverElement.style.display = 'block'
    }

    let fishImage = new Image();
    fishImage.src = fishImageSrc;
    
    function createFish() {
      let fish = kontra.Sprite({
        x: canvas.width,
        y: Math.random() * canvas.height,
        width: 60,     // width and height of the sprite rectangle
        height: 15,
        radius: 6,  // we'll use this later for collision detection
        image: fishImage,
        update(){
          this.x -= 3;
          if (this.x < 0) {
            this.x = 600;
            this.y = Math.random() * 600;
            this.collided = false
            this.opacity = 1
          }
        }
      });
      fishArray.push(fish);
      sprites.push(fish);
    }
    
    async function crashAnimation() {
      for (let i = 0; i < 3; i++) {
        bodyDocument.style.transition = 'none'
        bodyDocument.style.filter = 'invert(0.4)'
        await sleep(150)
        bodyDocument.style.filter = ''
        await sleep(150)
        bodyDocument.style.transition = ''
      }
    }

    function changeLife(newLife) {
      remainingLife = newLife > 100 ? 100 : (newLife < 0 ? 0 : newLife)
      const lifebar = document.getElementById("lifebar")
      lifebar.style.width = `${remainingLife}%`
      if(remainingLife == 0) {gameover()}
    }

    let shipImage = new Image();
    shipImage.src = boatImageSrc;
    kontra.initKeys();
    function shipSprite() {
      let ship = kontra.Sprite({
        x: 100,
        y: canvas.height / 2,
        radius: 6,
        image: shipImage,
        update() {
          // move the ship up and down
          if (kontra.keyPressed('arrowup')) {
            this.ddy = -1; // move the ship up by setting its vertical acceleration to -2
          } else if (kontra.keyPressed('arrowdown')) {
            this.ddy = 1; // move the ship down by setting its vertical acceleration to 2
          } else {
            this.ddy = 0; // reset the vertical acceleration if neither up nor down key is pressed
          }
          
          // rotate the ship based on the acceleration
          this.rotation = (1/30)*this.dy
          
          // limit the ship's movement to the canvas
          if (this.y < 0) {
            this.y = 0;
            this.dy = 0;
          } else if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.dy = 0;
          }
          
          // check for collisions with rocks
          rocks.forEach(rock => {
            if (!rock.collided && kontra.collides(this, rock)) {
              console.log('Ship collided with a rock!');
              rock.collided = true
              changeLife(remainingLife - 30)
              crashAnimation()
            }
          });

          // check for collisions with rocks
          fishArray.forEach(fish => {
            if (!fish.collided && kontra.collides(this, fish)) {
              console.log('Ship collided with a fish!');
              fish.collided = true
              changeLife(remainingLife + 10)
              fish.opacity = 0
            }
          });
          
          this.advance();
        }
      });
      sprites.push(ship);
    };

    shipImage.onload = shipSprite

    function restart() {
      sprites = []
      changeLife(100)
      timePassed(true)
      initSprites()
      shipSprite()
      bodyDocument.classList.remove('night')
      loop.start()
      gameoverElement.style.display = ''
    }

    loop.start();