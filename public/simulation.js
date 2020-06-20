let time = Date.now();

const mapSize = 750
const pixelSize = 250
let savedMap = null;
let scenes = [];
const numHouses = 100;
const humansPerHouseHold = 1;
const frameTime = 10;

const world = {
    canvas: document.createElement('canvas'),
    start: function () {
        this.canvas.width = mapSize;
        this.canvas.height = mapSize;
        this.tileWidth = mapSize / pixelSize;
        this.context = this.canvas.getContext('2d');
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        createMap();
        presetHumans();
        createSimul();
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    tileWidth: null,
    tiles: [], //properties and location
    humans: [],
    origins: {
        houses: [],
        groceries: [],
        restaurants: [],
        hospitals: [],
        parks: []
    },
    walkableTiles: []
}

function createMap() {
    let rawFile = new XMLHttpRequest();
    rawFile.open("GET", './map.txt', false);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                let mapRaw = rawFile.responseText;
                createWorld(world, mapRaw);
            }
        }
    }
    rawFile.send(null);
}

function createWorld(wd, data) {
    let rowData = data.split('\n');
    for (let i = 0; i < rowData.length; i++) {
        rowData[i] = rowData[i].split('\t')
    }
    console.log(Date.now() - time);
    let { canvas, tileWidth, tiles, humans, context } = wd;
    for (let i = 0; i < canvas.width / tileWidth; i++) {
        let tempTileRow = [];
        let walkableRow = [];
        for (j = 0; j < canvas.height / tileWidth; j++) {
            let tileType;
            let color;
            let walkable = false;
            switch (parseInt(rowData[j][i].substring(0, 1))) {
                case 0: color = "#d1f797"; break;
                case 1: color = "black"; tileType = "road"; walkable = true; break;
                case 2: color = "#0044ff"; tileType = "houses"; break;
                case 3: color = "#ff006a"; tileType = "hospitals"; break;
                case 4: color = "#15bd3c"; tileType = "parks"; walkable = true; break;
                case 5: color = "#ff6a00"; tileType = "restaurants"; break;
                case 6: color = "#9700fc"; tileType = "groceries"; break;
            }

            rowData[j][i].indexOf('o') !== -1 ? (walkable = true, wd.origins[tileType].push({ x: i, y: j })) : null;
            tempTileRow.push({
                component: new component(tileWidth, tileWidth, color, i * tileWidth, j * tileWidth, true),
                isRoad: false,
                human: null,
            });
            walkableRow.push(walkable === false ? 0 : 1);
        }
        wd.tiles.push(tempTileRow);
        wd.walkableTiles.push(walkableRow);
    }

    savedMap = context.getImageData(0, 0, mapSize, mapSize);

    //create world layout

    //filling human objects
    for (let i = 0; i < numHouses; i++) {
        for (let j = 0; j < humansPerHouseHold; j++) {
            humans.push({
                curCoords: {
                    x: wd.origins.houses[i].x,
                    y: wd.origins.houses[i].y,
                },
                curTask: "none",
                originCoords: {
                    x: wd.origins.houses[i].x,
                    y: wd.origins.houses[i].y,
                },
                coronaState: {
                    has: false,
                    carrying: false,
                    asymptomatic: null,
                },
                age: null,
                mask: null,
                curPath: [],
                dayTasks: []
            })
        }
    }
}


function presetHumans() {
    let { humans } = world;

}


function component(width, height, color, x, y, instantUpdate) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.color = color;
    ctx = world.context;
    this.update = () => {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    instantUpdate ? this.update() : null;
}


world.start();

let param = {
    tRate: 0.7,
    tRateMask: 0.2,
    asympRate: 0.8,
    tRateLoss: 3,
    airflow: 0.5,
    pGroc: 1 / 7,
    pRes: 2 / 7,
    pPark: 2 / 7,
    curfM: 7,
    curfN: 22
}



function pathFind(grid, humanObj, target) {
    let graph = new Graph(grid);
    let start = graph.grid[humanObj.curCoords.x][humanObj.curCoords.y];
    let end = graph.grid[target.x][target.y];
    let result = astar.search(graph, start, end);
    humanObj.curPath = result;
}

function findShortest(origin, finalCoords) {
    let len = Math.ceil(pixelSize * Math.sqrt(2));
    let shortest;
    for (let i = 0; i < finalCoords.length; i++) {
        let temp = finalCoords[i];
        let tempLen = quadFormula(origin.x, origin.y, tempLen.x, tempLen.y);
        tempLen < len ? shortest = temp : null;
    }
    return shortest;
}

function quadFormula(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

function randTest(perc) {
    return Math.random() < perc
}

function moveHuman(human, per) {
    let { curTask } = human;
    if (curTask === "none") {
        assignTask(human, per);
    } else if (curTask === "wander") {

    } else {

    }
}

function assignTask(human, per) {
    let len = human.dayTasks.length;
    let perc = len * per;
    if (len === 0) {
        return;
    }
    randTest(perc) ? human.curTask = "wander" : human.curTask = human.dayTasks[0];
}

function setTasks(humans) {
    let { pGroc, pRes, pPark } = param;
    humans.forEach(h => {
        let temp = [];
        randTest(pGroc) ? temp.push("groceries") : null;
        randTest(pRes) ? temp.push("restaurants") : null;
        randTest(pPark) ? temp.push("parks") : null;

    })
}

function createSimul() {
    //human movement
    let { tRate, tRateMask, asympRate, tRateLoss, airflow, pGroc, pRes, pPark, curfM, curfN } = param;
    let infCount = 0;
    let totTime = 0;
    let dayTime = 0;
    let maxTime = (curfN - curfM) * 3600 / frameTime;
    while (infCount < numHouses * humansPerHouseHold) {
        world.humans.forEach(h => moveHuman(h, dayTime / maxTime));

        dayTime++;
        dayTime === maxTime ? (dayTime = 0, setTasks(world.humans)) : null;
    }
    /**
     * check what the human needs to do today
     * if the human doesn't have a task he/she is currently doing (i.e going to the hospital), then set a path for them
     * this is found by comparing all origins of desired destination(i.e restaurant) to the person's current location and setting the optimal path
     * if hour is 10pm or more, human should be returning to origin
     */


    //corona checking
    /**
     * compare distance to other humans
     * trasmit by probability of transmission
     * get imported factors(later but currently set as variables) 
     */
}

//let worldInterval = setInterval(updateWorld, intervalTime);




const intervalTime = 1000;

let updateWorld = () => {
    world.clear();
    world.context.putImageData(savedMap, 0, 0)










    //updating function

}