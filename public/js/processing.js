
//this is where the user's Heads Up Display (HUD) is rendered in the sidebar

let level_hud;
let streak_hud;
let xpBonus_hud;
let nextLvlXp_hud;
let xp_hud;


//run once at start of session
function setup() {

    //creating the canvas where this sketch will be rendered
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

    //white opaque background where the xp  circle will be rendered
    fill(255);
    strokeWeight(0);
    ellipse(width / 2, 55, 100, 100);

    //transparent circle with slight yellow tinge. Makes background for xp
    fill(255, 255, 0, 10);
    strokeWeight(3)
    ellipse(width / 2, 55, 100, 100);

    //shows the current xp as a yellow circle. Size is the ratio between current xp and max xp. The circle will grow with xp gained
    strokeWeight(2);
    stroke(0, 3)
    fill(255, 255, 0, 175);
    ellipse(width / 2, 55, xp_hud / nextLvlXp_hud * 100 - 2);
    
    
    let xOffset = 10;
    let yOffset = 0;

    stroke(0, 0, 0);
    fill(255);
    strokeWeight(3)

    //the streak and bonus xp spaces
    //filled blue
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


    //Level space
    //filled green
    fill(15, 214, 125);
    beginShape();
    vertex(width / 2 - 20, 85);
    vertex(width / 2 + 20, 85);
    vertex(width / 2 + 20, 115);
    vertex(width / 2, 130);
    vertex(width / 2 - 20, 115);
    endShape(CLOSE);

    //boxes for all the titles
    fill(255);
    rectMode(CENTER);
    rect(width / 2, 85, 45, 13);
    rect(width / 2, 9, 25, 13);
    rect(width / 2 - 55, 38, 35, 13);
    rect(width / 2 + 55, 38, 35, 13);

    //only display the values if they have been loaded!
    if (!(streak_hud == undefined) && !(xpBonus_hud === undefined)) {
        strokeWeight(0.6);
        fill(0);
        textSize(12);
        text(streak_hud, width / 2 - 55, 54);
        textSize(12);

        //have to adjust %bonus xp text size or it may not fit in space
        if (streak_hud >= 10) {
            textSize(11)
        }
        if (streak_hud >= 100) {
            textSize(9);
        }
        text(xpBonus_hud, width / 2 + 55, 54);
    }

    //put all the titles for each space in their appropriate boxes
    fill(0);
    strokeWeight(0.6);
    textSize(10);
    text("XP", width / 2, 10);
    text("Level", width / 2, 86);
    text("Streak", width / 2 - 55, 38);
    text("Bonus", width / 2 + 55, 38);


    //display the current and max xp levels 
    if (nextLvlXp_hud && xp_hud) {
        fill(0);
        textSize(15);
        text(`${xp_hud}/${nextLvlXp_hud}`, width / 2, 55);
    }

    //display the levels
    textSize(20);
    strokeWeight(1);
    if (!(level_hud === undefined)) {
        text(level_hud, width / 2 - 1, 108);
    }
}

//run once at the start of the program. 
function draw() {
    scale(1.3); //adjusting the size 
    translate(-width / 4 + 5, 0); //move to the top left corner
    renderHUD();//actually draw the thing
}
