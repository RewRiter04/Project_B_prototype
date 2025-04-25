let img;
let s  = 10;
let z;
let control_z = 0;
let timer = 0;
let fall_time = 5;
let resize_time = 20;
let bg_color = 0;
let handPose;
let video;
let hands = [];

let blocks = [];  

function preload() {
  img = loadImage("assets/hokusai.jpg");
  handPose = ml5.handPose();  
}

function setup() {
  createCanvas(600, 400, WEBGL);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  z = random(-10, 10);
  s = 20;
  img.loadPixels(); 
  handPose.detectStart(video, gotHands);

  for (let x = 0; x < img.width; x += s) {
    for (let y = 0; y < img.height; y += s) {
      let i = (x + y * img.width) * 4;
      let r = img.pixels[i];
      let g = img.pixels[i + 1];
      let b = img.pixels[i + 2];
      blocks.push(new PixelBlock(x, y, r, g, b, s));
    }
  }
}

function draw() {
  timer += 1 / 60;
  background(bg_color);

  if (timer < fall_time) control_z += (fall_time - timer);
  control_z -= (timer - fall_time);

  let kpList = [];
  for (let h of hands) {
    for (let kp of h.keypoints) {
      kpList.push({ x: kp.x, y: kp.y });
    }
  }

  for (let blk of blocks) {
    if (!blk.active) continue;
    if (timer < resize_time) {
      for (let kp of kpList) {
        if (
          abs(kp.x - blk.gx) <= 5 &&
          abs(kp.y - blk.gy) <= 5
        ) {
          blk.active = false;
          break;
        }
      }
    }

    blk.update();
    blk.display();
    }

    bg_color = map(timer, 0, 15, 0, 255);

    // hand
    if (timer < resize_time) {
        push();
            translate(-width/2, -height/2, -500);
            image(video, 0, 0, width, height);
            for (let h of hands) {
                for (let kp of h.keypoints) {
                    fill(0, 255, 0);
                    noStroke();
                    circle(kp.x, kp.y, 10);
                }
            }
        pop();
    }

    // resize
    if (timer > resize_time) {
        clear();
        resizeCanvas(windowWidth, windowHeight);
        background(255);
        if (timer > resize_time + 4) {
          strokeWeight(3);
          stroke(0);
          push();
            translate(-width/2, -height/2);
            line(0, 0, windowWidth, windowHeight);
            line(windowWidth, 0, 0, windowHeight);
          pop();
        }
    }
    // screen cracking
    //~~~~~~~~~~~/~~~~~~~~~~~/~~~~~~~~~~~/~~~~~~~~~~~/
    //
    //~~~~~~~~~~/~~~~~~~~~~~/~~~~~~~~~~~/~~~~~~~~~~~~
}


// PixelBlock 
class PixelBlock {
  constructor(x, y, r, g, b, size) {
    this.gx = x;          
    this.gy = y;
    this.x  = x - width/2;
    this.y  = y - height/2;
    this.b  = b;          
    this.size  = size;
    this.col   = color(r, g, b);
    this.alpha = 255;
    this.active = true;   
  }

  update() {
    this.z = map(this.b, 0, 255, control_z, 0);
    this.alpha = max(0, 255 - (255 / 400) * timer * timer);
  }

  display() {
    push();
      translate(this.x, this.y, this.z);
      fill(red(this.col), green(this.col), blue(this.col), this.alpha);
      noStroke();
      rect(0, 0, this.size, this.size);
    pop();
  }
}

function gotHands(results) {
  hands = results;
}
