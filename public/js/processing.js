


let level_hud;
let streak_hud;
let xpBonus_hud;
let nextLvlXp_hud;
let xp_hud;

function setup() {

    let canvas = createCanvas(300, 300);
    canvas.parent('container');
    textAlign(CENTER, CENTER);


    canvas.class("hud");
    clear();
    smooth();
    noLoop();

}
function renderHUD() {



    background(255);
    clear();


    fill(255);
    strokeWeight(0);
    ellipse(width / 2, 55, 100, 100);

    fill(255, 255, 0, 10);
    strokeWeight(3)
    ellipse(width / 2, 55, 100, 100);

    strokeWeight(2);
    stroke(0, 3)
    fill(255, 255, 0, 175);
    ellipse(width / 2, 55, xp_hud / nextLvlXp_hud * 100 - 2);
    let xOffset = 10;
    let yOffset = 0;

    stroke(0, 0, 0);
    fill(255);
    strokeWeight(3)

    fill(52, 168, 235);
    beginShape();
    vertex(width / 2 - 60 - xOffset, 45 + yOffset);
    vertex(width / 2 - 60 - xOffset, 60 + yOffset);
    vertex(width / 2 - 45 - xOffset, 70 + yOffset);
    vertex(width / 2 - 30 - xOffset, 60 + yOffset);
    vertex(width / 2 - 30 - xOffset, 45 + yOffset);
    vertex(width / 2 - 45 - xOffset, 35 + yOffset)
    endShape(CLOSE);

    beginShape();
    vertex(width / 2 + 60 + xOffset, 45 + yOffset);
    vertex(width / 2 + 60 + xOffset, 60 + yOffset);
    vertex(width / 2 + 45 + xOffset, 70 + yOffset);
    vertex(width / 2 + 30 + xOffset, 60 + yOffset);
    vertex(width / 2 + 30 + xOffset, 45 + yOffset);
    vertex(width / 2 + 45 + xOffset, 35 + yOffset)
    endShape(CLOSE);


    //ellipse(width/2, 55 + 50, 50, 50);
    fill(15, 214, 125);
    beginShape();
    vertex(width / 2 - 20, 85);
    vertex(width / 2 + 20, 85);
    vertex(width / 2 + 20, 115);
    vertex(width / 2, 130);
    vertex(width / 2 - 20, 115);
    endShape(CLOSE);

    fill(255);
    rectMode(CENTER);
    rect(width / 2, 85, 45, 13);
    rect(width / 2, 9, 25, 13);
    rect(width / 2 - 55, 38, 35, 13);
    rect(width / 2 + 55, 38, 35, 13);


    if (!(streak_hud == undefined) && !(xpBonus_hud === undefined)) {
        strokeWeight(0.6);
        fill(0);
        textSize(12);
        text(streak_hud, width / 2 - 55, 54);
        textSize(12);
        if (streak_hud >= 10) {
            textSize(11)
        }
        if (streak_hud >= 100) {
            textSize(9);
        }
        text(xpBonus_hud, width / 2 + 55, 54);
    }
    fill(0);
    strokeWeight(0.6);
    textSize(10);
    text("XP", width / 2, 10);
    text("Level", width / 2, 86);
    text("Streak", width / 2 - 55, 38);
    text("Bonus", width / 2 + 55, 38);

    if (nextLvlXp_hud && (xp_hud || xp_hud === 0)) {
        fill(0);
        textSize(15);
        text(`${xp_hud}/${nextLvlXp_hud}`, width / 2, 55);
    }

    textSize(20);
    strokeWeight(1);
    if (!(level_hud === undefined)) {
        text(level_hud, width / 2 - 1, 108);
    }
}

function draw() {
    scale(1.3);
    translate(-width / 4 + 5, 0);
    renderHUD();
}


// button.addEventListener('click', (e) => {
//     xp += 10;
//     render();
// })