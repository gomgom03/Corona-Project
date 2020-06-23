
let time = Date.now();

const mapSize = 750
const pixelSize = 250
let savedMap = null;
let scenes = [];
const numHouses = 100;
const humansPerHouseHold = 3;
const frameTime = 10;
const numElem = document.getElementById("num");
const loadStateSubElem = document.querySelector("#loadStateSub");

let imprfdc = rfdc();

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
    walkableTiles: [],
    graph: null
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
            let walkable = true;
            let num = parseInt(rowData[j][i].substring(0, 1))
            switch (num) {
                case 0: color = "#d1f797"; walkable = false; break;
                case 1: color = "black"; tileType = "road"; break;
                case 2: color = "#0044ff"; tileType = "houses"; break;
                case 3: color = "#ff006a"; tileType = "hospitals"; break;
                case 4: color = "#15bd3c"; tileType = "parks"; break;
                case 5: color = "#ff6a00"; tileType = "restaurants"; break;
                case 6: color = "#9700fc"; tileType = "groceries"; break;
            }

            rowData[j][i].indexOf('o') !== -1 ? (wd.origins[tileType].push({ x: i, y: j })) : null;
            tempTileRow.push({
                num: num,
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
                atHome: true,
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
    //put human on map
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

let totTime, maxTime;
let param = {
    tRate: 0.7,
    tRateMask: 0.2,
    asympRate: 0.8,
    tRateLoss: 3,
    airflow: 0.5,
    pGroc: 4 / 7,
    pRes: 5 / 7,
    pPark: 6 / 7,
    curfM: 7,
    curfN: 21
}
let pfCalled = fsCalled = qfCalled = rtCalled = mhCalled = atCalled = spCalled = stCalled = rsCalled = 0;

world.start();





function pathFind(grid, humanObj, target) {
    pfCalled++;
    //let { graph } = world;
    let graph = new Graph(world.walkableTiles);
    let start = graph.grid[humanObj.curCoords.x][humanObj.curCoords.y];
    let end = graph.grid[target.x][target.y];
    let result = astar.search(graph, start, end);
    let usefulInfo = []
    for (let i = 0; i < result.length; i++) {
        usefulInfo.push({ x: result[i].x, y: result[i].y })
    }
    //usefulInfo.length === 0 ? console.log(JSON.parse(JSON.stringify(grid)), JSON.parse(JSON.stringify(humanObj)), JSON.parse(JSON.stringify(target))) : null
    usefulInfo.length !== 0 ? humanObj.curPath = usefulInfo : humanObj.curTask === "goHomeF" ? humanObj.curTask = "wanderF" : humanObj.curTask = "none";
}

function findShortest(origin, finalCoords) {
    fsCalled++;
    let len = Math.ceil(pixelSize * Math.sqrt(2));
    let shortest;
    for (let i = 0; i < finalCoords.length; i++) {
        let temp = finalCoords[i];
        let tempLen = quadFormula(origin.x, origin.y, temp.x, temp.y);
        tempLen < len ? (shortest = temp, len = tempLen) : null;
    }
    return shortest;
}

function quadFormula(x1, y1, x2, y2) {
    qfCalled++;
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function randTest(perc) {
    rtCalled++;
    return Math.random() < perc;
}

function moveHuman(human, per) {
    mhCalled++;
    world.tiles[human.curCoords.x][human.curCoords.y].human = null;
    let { curTask } = human;
    if (curTask === "none") {
        assignTask(human, per);
    } else if (curTask === "wander" || curTask === "wanderF") {
        //WANDERING
        let cur = world.tiles[human.curCoords.x][human.curCoords.y].num;
        let transfArr = [[1, 0], [0, 1], [-1, 0], [0, -1]];
        transfArr = randSort(transfArr);
        let i;
        let deltX = 0;
        let deltY = 0;
        for (i = 0; i < transfArr.length; i++) {
            let tempX = transfArr[i][0]
            let tempY = transfArr[i][1]
            if (cur === world.tiles[human.curCoords.x + tempX][human.curCoords.y + tempY].num) {
                deltX = tempX;
                deltY = tempY;
                break;
            }
        }
        human.curCoords.x += deltX;
        human.curCoords.y += deltY;
        //human === world.humans[0] ? console.log(deltX, deltY, human) : null
        if (curTask !== "wanderF") {
            randTest(0.005) ? randTest(0.5) ? (human.curTask = "goHome", setPath(human, human.curTask)) : assignTask(human, per) : null;
        }

    } else {
        //if (curTask === "goHome") { console.log(human, human.curPath[0]); }
        human.curCoords = human.curPath[0];
        human.curPath.shift();
        human.curPath.length === 0 ? curTask === "goHomeF" ? human.curTask = "wanderF" : human.curTask = "none" : null;
    }
    //console.log(human.curCoords);

    world.tiles[human.curCoords.x][human.curCoords.y].human = human;
    human.atHome ? world.tiles[human.curCoords.x][human.curCoords.y].num !== 2 ? human.atHome = false : null : world.tiles[human.curCoords.x][human.curCoords.y].num === 2 ? human.atHome = true : null;
}

function assignTask(human, per) {
    atCalled++;
    let len = human.dayTasks.length;
    let perc = len * per;
    if (len === 0) {
        human.curTask = "wander";
    }
    randTest(perc) ? (human.curTask = human.dayTasks[0], human.dayTasks.shift(), setPath(human, human.curTask)) : human.curTask = "wander";
}

function setPath(human, task) {
    spCalled++;
    let { walkableTiles } = world;
    if (task === "goHome" || task === "goHomeF") {
        human.atHome ? human.curTask = "none" : pathFind(walkableTiles, human, human.originCoords);
        //console.log(JSON.parse(JSON.stringify(human)), JSON.parse(JSON.stringify(human.originCoords)))

    } else {
        pathFind(walkableTiles, human, findShortest(human.curCoords, world.origins[task]));
    }

}

function setTasks(humans) {
    stCalled++;
    let { pGroc, pRes, pPark } = param;
    humans.forEach(h => {
        let temp = [];
        randTest(pGroc) ? temp.push("groceries") : null;
        randTest(pRes) ? temp.push("restaurants") : null;
        randTest(pPark) ? temp.push("parks") : null;
        temp = randSort(temp);
        h.dayTasks = temp;
        h.curTask = "none";
    })
    console.log("Set Task Complete")
}

//Fisher Yates
function randSort(arr) {
    rsCalled++;
    let ind = arr.length
    let temp, rInd;
    while (0 !== ind) {
        rInd = Math.floor(Math.random() * ind);
        ind -= 1;
        temp = arr[ind];
        arr[ind] = arr[rInd];
        arr[rInd] = temp;
    }
    return arr;
}

function infect(human) {

}

function createSimul() {
    //human movement
    let { tRate, tRateMask, asympRate, tRateLoss, airflow, pGroc, pRes, pPark, curfM, curfN } = param;
    let infCount = 0;
    totTime = 0;
    let dayTime = 0;
    let ceilTime = (curfN - curfM) * 3600 / frameTime
    maxTime = (curfN - curfM + Math.ceil(pixelSize * 2 * frameTime / 3600)) * 3600 / frameTime;

    //while (infCount < numHouses * humansPerHouseHold) {

    async function queueScene() {
        makeScene(dayTime, ceilTime, maxTime).then(s => {
            scenes.push(s); setTimeout(() => {
                dayTime++;
                dayTime === maxTime ? (dayTime = 0) : null;
                queueScene();
            }, 1);
        })
    }



    let makeScene = async (dayTime, ceilTime, maxTime) => {
        dayTime === 0 ? setTasks(world.humans) : null;
        //if hour is 10pm or more, human should be returning to origin
        //console.log(JSON.parse(JSON.stringify(world.humans)))
        let scene = [];
        dayTime === ceilTime ? world.humans.forEach(h => { moveHuman(h, dayTime / maxTime); h.curTask = "goHomeF"; setPath(h, "goHomeF"); scene.push(Object.assign({}, h.curCoords)) }) : world.humans.forEach(h => { moveHuman(h, dayTime / maxTime); scene.push(Object.assign({}, h.curCoords)); });

        loadStateSubElem.textContent = scenes.length;
        //world.humans.forEach(h => { scene.push(JSON.parse(JSON.stringify(h.curCoords))) });
        //world.humans.forEach(h => { scene.push(Object.assign({}, h.curCoords)) });

        return scene;
    }
    queueScene();




    /*
    for (let i = 0; i < 10000; i++) {
        //console.log(dayTime, maxTime)
        dayTime === 0 ? setTasks(world.humans) : null;
        //if hour is 10pm or more, human should be returning to origin
        //console.log(JSON.parse(JSON.stringify(world.humans)))
        let scene = [];
        dayTime === ceilTime ? world.humans.forEach(h => { moveHuman(h, dayTime / maxTime); h.curTask = "goHomeF"; setPath(h, "goHomeF"); scene.push(Object.assign({}, h.curCoords)) }) : world.humans.forEach(h => { moveHuman(h, dayTime / maxTime); scene.push(Object.assign({}, h.curCoords)); });
 
 
        //world.humans.forEach(h => { scene.push(JSON.parse(JSON.stringify(h.curCoords))) });
        //world.humans.forEach(h => { scene.push(Object.assign({}, h.curCoords)) });
 
        scenes.push(scene);
 
        dayTime++;
        dayTime === maxTime ? (dayTime = 0) : null;
    }
    */

    /**
     * check what the human needs to do today
     *  DONE if the human doesn't have a task he/she is currently doing (i.e going to the hospital), then set a path for them
     * this is found by comparing all origins of desired destination(i.e restaurant) to the person's current location and setting the optimal path
     * 
     */


    //corona checking
    /**
     * compare distance to other humans
     * trasmit by probability of transmission
     * get imported factors(later but currently set as variables) 
     */
}

//let worldInterval = setInterval(updateWorld, intervalTime);





const intervalTime = 100;
let curSceneNum = 0;

let updateWorld = () => {
    if (scenes.length < curSceneNum + 1) {
        viewInterval !== null ? (clearInterval(viewInterval), viewInterval = null) : null;
        return;
    }
    world.clear();
    world.context.putImageData(savedMap, 0, 0);
    scenes[curSceneNum].forEach(c => {
        new component(world.tileWidth, world.tileWidth, "white", c.x * world.tileWidth, c.y * world.tileWidth, true)
    })
    numElem.textContent = curSceneNum;

    curSceneNum++;







    //updating function

}

let viewInterval = null;
const playSimulElem = document.querySelector("#playSimul");
const pauseSimulElem = document.querySelector("#pauseSimul");

playSimulElem.addEventListener("click", () => {
    viewInterval === null ? viewInterval = setInterval(updateWorld, intervalTime) : null;
})

pauseSimulElem.addEventListener("click", () => {
    viewInterval !== null ? clearInterval(viewInterval) : null
    viewInterval = null;
})
