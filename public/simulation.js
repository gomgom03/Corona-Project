
let time = Date.now();

const pixelSize = 250
let savedMap = null;
let scenes = [];
const numHouses = 100;
const frameTime = 10;
const numElem = document.getElementById("num");
const loadStateSubElem = document.querySelector("#loadStateSub");
const spinnerElem = document.getElementById("spinner")
let curInfected = 1;
let batchId = null;
let endConfigResolved = true;
let param = {
    tileWidth: 3,
    humansPerHouseHold: 2,
    tRate: 0.4,
    maskDegrade: 0.2,
    asympRate: 0.8,
    tRateLoss: 3,
    airflow: 0.5,
    pGroc: 4 / 7,
    pRes: 5 / 7,
    pPark: 6 / 7,
    curfM: 7,
    curfN: 21,
    mask: false,
    carryToInf: 0.005,
    washingHands: true,
    chartIncrement: 1
}

$('#popupModal').modal({ show: false })

function popupMessage(title, message) {
    $('#modalLabel').text(title)
    $('#popupBody').text(message)
    $('#popupModal').modal('show');
}

//Simulation start Listener Creation
const defaultSimulStartElem = document.getElementById("defaultSimulStart"),
    configSimulStartElem = document.getElementById("configSimulStart"),
    configPartsElems = Array.prototype.slice.call(document.getElementsByClassName("configParts")),
    configOptionButtonElem = document.getElementById("configOptionButton"),
    configOptionsElem = document.getElementById("configOptions");


defaultSimulStartElem.addEventListener("click", () => {
    param = {
        tileWidth: 3,
        humansPerHouseHold: 2,
        tRate: 0.4,
        maskDegrade: 0.2,
        asympRate: 0.8,
        tRateLoss: 3,
        airflow: 0.5,
        pGroc: 4 / 7,
        pRes: 5 / 7,
        pPark: 6 / 7,
        curfM: 7,
        curfN: 21,
        mask: false,
        carryToInf: 0.005,
        washingHands: true,
        chartIncrement: 1
    }
    endConfig();
})

configSimulStartElem.addEventListener("click", () => {
    param = {
        tileWidth: 3,
        humansPerHouseHold: 2,
        tRate: 0.4,
        maskDegrade: 0.2,
        asympRate: 0.8,
        tRateLoss: 3,
        airflow: 0.5,
        pGroc: 4 / 7,
        pRes: 5 / 7,
        pPark: 6 / 7,
        curfM: 7,
        curfN: 21,
        mask: false,
        carryToInf: 0.005,
        washingHands: true,
        chartIncrement: 5
    }
    let errMessage = "";
    let tempObj = {}
    configPartsElems.forEach(el => {
        let { value, id } = el;
        if (value !== "") {
            let val = parseInt(value);
            value === "e" || value === "E" ? val = Math.E : null;
            switch (id) {
                case "tileWidth": val >= 1 && Math.floor(val) === val ? tempObj[id] = val : errMessage += "<Tile Width> should be a positive integer. "; break;
                case "humansPerHouseHold": val >= 1 && Math.floor(val) === val ? tempObj[id] = val : errMessage += "<Humans Per Household> should be a positive integer. "; break;
                case "tRate": val <= 100 && val > 0 ? tempObj[id] = val / 100 : errMessage += "<Probability of Transmission> should be greater than 0 and at most 100. "; break;
                case "maskDegrade": val <= 100 && val >= 0 ? tempObj[id] = (100 - val) / 100 : errMessage += "<Mask Rating> should be at least 0 and at most 100. "; break;
                case "asympRate": val <= 100 && val >= 0 ? tempObj[id] = val / 100 : errMessage += "<Probability of Asymptomatic Transmission> should be at least 0 and at most 100. "; break;
                case "carryToInf": val <= 100 && val > 0 ? tempObj[id] = val / 100 : errMessage += "<Probabilty of Infection of those Carrying the Virus Every 10 Seconds> should be greater than 0 and at most 100. "; break;
                case "pGroc": val <= 100 && val >= 0 ? tempObj[id] = val / 100 : errMessage += "<Probability of Going to a Grocery Store on a Given Day> should be at least 0 and at most 100. "; break;
                case "pPark": val <= 100 && val >= 0 ? tempObj[id] = val / 100 : errMessage += "<Probability of Going to a Park on a Given Day> should be at least 0 and at most 100. "; break;
                case "pRes": val <= 100 && val >= 0 ? tempObj[id] = val / 100 : errMessage += "<Probability of Going to a Restaurant on a Given Day> should be at least 0 and at most 100. "; break;
                case "mask": val === 1 ? tempObj[id] = true : tempObj[id] = false; break;
                case "washingHands": val === 1 ? tempObj[id] = true : tempObj[id] = false; break;
                case "curfM": val <= 12 && val >= 1 && Math.floor(val) === val ? tempObj[id] = val : errMessage += "<Start of Day> should be an integer at least 1 and at most 12. "; break;
                case "curfN": val <= 22 && val >= 13 && Math.floor(val) === val ? tempObj[id] = val : errMessage += "<Curfew> should be an integer at least 13 and at most 22. "; break;
                default:
                    errMessage += "Internal Error";

            }
            tempObj[el.id] = val;
        }
    });
    if (errMessage === "") {
        for (let key in tempObj) {
            param[key] = tempObj[key]
        }

        endConfig();
    } else {
        popupMessage("Error", errMessage)

    }

})

function endConfig() {
    if (endConfigResolved) {
        endConfigResolved = false;
        continueQueue = false;
        spinnerElem.className = "d-flex justify-content-center";
        setTimeout(() => {
            batchId = Math.random().toString(32);
            resetAll();
            world.start();
            endConfigResolved = true;
            spinnerElem.className = "d-none";
            configOptionsElem.className === "collapse show" ? configOptionButtonElem.click() : null;
        }, 1000)
    }
}

function resetAll() {
    world.canvas != null ? document.getElementById("simulContainer").removeChild(world.canvas) : null;
    world.canvas = null;
    world.tiles = [];
    world.humans = [];
    world.origins = {
        houses: [],
        groceries: [],
        restaurants: [],
        hospitals: [],
        parks: []
    };
    world.walkableTiles = [];
    world.graph = null;
    curInfected = 1;
    time = Date.now();
    savedMap = null;
    scenes = [];
    continueQueue = true;
    intervalTime = 100;
    curSceneNum = 0;
    clearSceneIntervals();
    viewInterval = null;
    totTime = 0;
}


const world = {
    canvas: null,
    start: function () {
        this.canvas = document.createElement('canvas');
        let { tileWidth } = param
        this.canvas.width = pixelSize * tileWidth;
        this.canvas.height = pixelSize * tileWidth;
        this.context = this.canvas.getContext('2d');
        document.getElementById("simulContainer").appendChild(this.canvas);
        createMap();
        presetHumans();
        createSimul();
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
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
    let { canvas, tiles, humans, context } = wd;
    let { tileWidth, humansPerHouseHold } = param;
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
                case 2: color = "#734000"; tileType = "houses"; break;
                case 3: color = "#b0db09"; tileType = "hospitals"; break;
                case 4: color = "#15bd3c"; tileType = "parks"; break;
                case 5: color = "#a3271c"; tileType = "restaurants"; break;
                case 6: color = "#580075"; tileType = "groceries"; break;
            }

            rowData[j][i].indexOf('o') !== -1 ? (wd.origins[tileType].push({ x: i, y: j })) : null;
            tempTileRow.push({
                num: num,
                component: new component(tileWidth, tileWidth, color, i * tileWidth, j * tileWidth, true),
                isRoad: false,
                humans: [],
            });
            walkableRow.push(walkable === false ? 0 : 1);
        }
        wd.tiles.push(tempTileRow);
        wd.walkableTiles.push(walkableRow);
    }

    savedMap = context.getImageData(0, 0, pixelSize * tileWidth, pixelSize * tileWidth);

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
                    asymptomatic: false,
                },
                atHome: true,
                age: null,
                curPath: [],
                dayTasks: []
            })
        }
    }
}


function presetHumans() {
    let { humans } = world;
    let { humansPerHouseHold } = param;
    let infHumanIndex = Math.floor(numHouses * humansPerHouseHold * Math.random());
    humans[infHumanIndex].coronaState.has = true;
    humans[infHumanIndex].coronaState.asymptomatic = true;
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

let totTime, maxTime, returnTime;
returnTime = 2;

let continueQueue = true;


function pathFind(grid, humanObj, target) {
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
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function randTest(perc) {
    return Math.random() < perc;
}

function moveHuman(human, per) {
    world.tiles[human.curCoords.x][human.curCoords.y].humans = [];
    let { washingHands } = param;
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
            let tempX = transfArr[i][0];
            let tempY = transfArr[i][1];
            if (world.tiles[human.curCoords.x + tempX] != null && world.tiles != null && cur === world.tiles[human.curCoords.x + tempX][human.curCoords.y + tempY].num) {
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
        if (human.curPath.length === 0) {
            if (curTask === "goHomeF") {
                human.coronaState.carrying && washingHands ? (human.coronaState.carrying = false) : null;
                human.curTask = "wanderF"
            } else if (curTask === "hospitals") {
                world.humans.splice(world.humans.indexOf(human), 1);
            } else {
                curTask === "goHome" && human.coronaState.carrying && washingHands ? (human.coronaState.carrying = false) : null;
                human.curTask = "none"
            }

        }
    }

    world.tiles[human.curCoords.x][human.curCoords.y].humans.push(human);
    human.atHome ? world.tiles[human.curCoords.x][human.curCoords.y].num !== 2 ? human.atHome = false : null : world.tiles[human.curCoords.x][human.curCoords.y].num === 2 ? human.atHome = true : null;
}

function assignTask(human, per) {
    let len = human.dayTasks.length;
    let perc = len * per;
    if (len === 0) {
        human.curTask = "wander";
    }
    randTest(perc) ? (human.curTask = human.dayTasks[0], human.dayTasks.shift(), setPath(human, human.curTask)) : human.curTask = "wander";
}

function setPath(human, task) {
    let { walkableTiles } = world;
    if (task === "goHome" || task === "goHomeF") {
        human.atHome ? human.curTask = "none" : pathFind(walkableTiles, human, human.originCoords);
        //console.log(JSON.parse(JSON.stringify(human)), JSON.parse(JSON.stringify(human.originCoords)))

    } else {
        pathFind(walkableTiles, human, findShortest(human.curCoords, world.origins[task]));
    }

}

function setTasks(humans) {
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
    let { coronaState, curCoords } = human;
    let { tRate, maskDegrade, asympRate, mask, carryToInf } = param;
    if (coronaState.has) {
        return;
    } else if (coronaState.carrying === true) {
        randTest(carryToInf) ? (
            coronaState.carrying = false,
            coronaState.has = true,
            coronaState.asymptomatic = randTest(asympRate),
            coronaState.asymptomatic ? null : (
                human.curTask = "hospitals",
                setPath(human, human.curTask)
            ),
            curInfected++,
            addScatter()

        ) : null;
    } else {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                let tempCoordx = curCoords.x + i;
                let tempCoordy = curCoords.y + j;
                if (!(tempCoordx < 0 || tempCoordx >= pixelSize || tempCoordy < 0 || tempCoordy >= pixelSize || world.tiles[tempCoordx][tempCoordy].num !== world.tiles[curCoords.x][curCoords.y].num)) {
                    let tempRate;
                    mask ? tempRate = tRate * maskDegrade : tempRate = tRate;
                    //console.log(tempRate);
                    world.tiles[tempCoordx][tempCoordy].humans.forEach(h => {
                        if ((h.coronaState.has) && randTest(tempRate)) {
                            coronaState.carrying = true;
                        }
                    })

                }
            }
        }
    }

}

function createSimul() {
    //human movement
    let { tRate, maskDegrade, asympRate, tRateLoss, airflow, pGroc, pRes, pPark, curfM, curfN, humansPerHouseHold } = param;
    totTime = 0;
    let dayTime = 0;
    let ceilTime = (curfN - curfM) * 3600 / frameTime
    maxTime = (curfN - curfM + Math.ceil(pixelSize * returnTime * frameTime / 3600)) * 3600 / frameTime;

    //while (infCount < numHouses * humansPerHouseHold) {

    async function queueScene() {
        makeScene(dayTime, ceilTime, maxTime, batchId).then(s => {
            if (curInfected < numHouses * humansPerHouseHold && s.id === batchId) {
                scenes.push(s.scene);
                setTimeout(() => {
                    totTime++;
                    dayTime++;
                    dayTime === maxTime ? (dayTime = 0) : null;
                    continueQueue ? queueScene() : null;
                }, 1);
            }
        })
    }



    let makeScene = async (dayTime, ceilTime, maxTime, bid) => {
        dayTime === 0 ? setTasks(world.humans) : null;
        //if hour is 10pm or more, human should be returning to origin
        //console.log(JSON.parse(JSON.stringify(world.humans)))
        let scene = [];
        dayTime === ceilTime ? world.humans.forEach(h => {
            moveHuman(h, dayTime / maxTime);
            h.curTask = "goHomeF";
            setPath(h, "goHomeF");

            scene.push(createSceneHuman(h));
        }) : world.humans.forEach(h => {
            moveHuman(h, dayTime / maxTime);
            scene.push(createSceneHuman(h));
        });

        function createSceneHuman(h) {
            let tempHumanSc = {};
            Object.assign(tempHumanSc, h.curCoords);
            if (h.coronaState.has) {
                if (h.coronaState.asymptomatic) {
                    tempHumanSc.coronaState = "HA"
                } else {
                    tempHumanSc.coronaState = "HX"
                }
            } else if (h.coronaState.carrying) {
                tempHumanSc.coronaState = "C"
            } else {
                tempHumanSc.coronaState = "N"
            }
            return tempHumanSc;
        }

        loadStateSubElem.textContent = scenes.length;
        //world.humans.forEach(h => { scene.push(JSON.parse(JSON.stringify(h.curCoords))) });
        //world.humans.forEach(h => { scene.push(Object.assign({}, h.curCoords)) });
        world.humans.forEach(h => infect(h));
        return { scene: scene, id: bid };
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



let viewInterval = null;
const playSimulElem = document.querySelector("#playSimul");
const pauseSimulElem = document.querySelector("#pauseSimul");
const pauseQueueElem = document.querySelector("#pauseQueue");
const fasterSimulElem = document.querySelector("#fasterSimul");
const slowerSimulElem = document.querySelector("#slowerSimul");
const simulSpeedFPSElem = document.querySelector("#simulSpeedFPS");
const simulSpeedTimeElem = document.querySelector("#simulSpeedTime");

let intervalTime = 100;
let curSceneNum = 0;
let saveFPSTime;
let updateWorld = () => {
    let { tileWidth, curfM, curfN } = param;
    simulSpeedTimeElem.textContent = `1 Scene per ${intervalTime} ms`
    saveFPSTime != null ? simulSpeedFPSElem.textContent = `${Math.round(1000 / (Date.now() - saveFPSTime))} fps` : null
    saveFPSTime = Date.now();
    if (scenes.length < curSceneNum + 1) {
        viewInterval !== null ? (clearInterval(viewInterval), viewInterval = null) : null;
        return;
    }
    world.clear();
    world.context.putImageData(savedMap, 0, 0);
    scenes[curSceneNum].forEach(c => {
        let tempColor;
        switch (c.coronaState) {
            case "HA": tempColor = "#fb00ff"; break;
            case "HX": tempColor = "red"; break;
            case "C": tempColor = "#ffa100"; break;
            case "N": tempColor = "white"; break;
            default: tempColor = "white"
        }
        new component(tileWidth, tileWidth, tempColor, c.x * tileWidth, c.y * tileWidth, true)
    })
    let tempFullTime = curSceneNum * frameTime;
    tempFullTime = Math.floor(tempFullTime / 60);
    let tempMin = tempFullTime % 60;
    tempFullTime = Math.floor(tempFullTime / 60);
    let tempHr = tempFullTime % (curfN - curfM + returnTime) + curfM;
    tempFullTime = Math.floor(tempFullTime / (curfN - curfM + returnTime));
    let tempDay = tempFullTime;



    numElem.textContent = `Day ${tempDay}, ${tempHr < 10 ? "0" + tempHr : tempHr}:${tempMin < 10 ? "0" + tempMin : tempMin}`;

    curSceneNum++;

    //simulSpeedElem.textContent = "0 fps"


}





playSimulElem.addEventListener("click", () => {
    viewInterval === null ? startSceneIntervals() : null;
})

pauseSimulElem.addEventListener("click", () => {
    viewInterval !== null ? clearSceneIntervals() : null;
    viewInterval = null;
})

pauseQueueElem.addEventListener("click", () => {
    continueQueue = false;
})

fasterSimulElem.addEventListener("click", () => {
    intervalTime -= 10;
    intervalTime < 10 ? intervalTime = 10 : null;
    clearSceneIntervals();
    startSceneIntervals();
})

slowerSimulElem.addEventListener("click", () => {
    intervalTime += 10;
    clearSceneIntervals();
    startSceneIntervals();
})

function clearSceneIntervals() {
    viewInterval !== null ? clearInterval(viewInterval) : null;
}

function startSceneIntervals() {
    viewInterval = setInterval(updateWorld, intervalTime);
}




//GRAPH AND COPYABLE DATA

const chartCanvasElem = document.getElementById("chartCanvas"),
    chartCanvasCtx = chartCanvasElem.getContext("2d");

let scatterChart = new Chart(chartCanvasCtx, {
    type: 'scatter',
    data: {
        datasets: [{
            label: 'Scatter Dataset',
            borderColor: "#ff0800",
            backgroundColor: "#ffb2b0",
            data: [{
                x: 0,
                y: curInfected
            }]
        }]
    },
    options: {
        scales: {
            xAxes: [{
                type: 'linear',
                position: 'bottom',
                scaleLabel: {
                    display: true,
                    labelString: 'Time (Minutes)'
                }
            }],
            yAxes: [{
                type: 'linear',
                position: 'bottom',
                scaleLabel: {
                    display: true,
                    labelString: 'Infected Population (%)'
                }
            }]
        }
    }
});

function addScatter() {
    let { humansPerHouseHold, chartIncrement, curfM, curfN } = param;
    curInfected / humansPerHouseHold % chartIncrement === 0 ? (
        scatterChart.data.datasets[0].data.push({ y: curInfected / humansPerHouseHold, x: frameTime * totTime / 60 }),// + (24 - returnTime - curfN + curfM) * 60 }),
        scatterChart.update()
    ) : null
}

