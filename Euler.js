/* eslint-disable no-undef */
const N = 100;
const CELL_SIZE = 4;
const TIME_MULTIPLIER = 1;

let gridWidth = N;
let gridHeight = N;
let width = CELL_SIZE * gridWidth;
let height = CELL_SIZE * gridHeight;
let diff = 10;

var fieldGrid;

function rgbToHex(R, G, B) {
  return "#" + toHex(R) + toHex(G) + toHex(B);
}

function toHex(n) {
  n = parseInt(n, 10);
  if (isNaN(n)) return "00";
  n = Math.max(0, Math.min(n, 255));
  return (
    "0123456789ABCDEF".charAt((n - (n % 16)) / 16) +
    "0123456789ABCDEF".charAt(n % 16)
  );
}

function start(ctx) {
  function animationLoop() {
    let time = new Date();
    time -= start;
    time /= TIME_MULTIPLIER;
    start = new Date();
    //diffuse(fieldGrid.v, time, 2);
    //diffuse(fieldGrid.u, time, 1);
    //advect(fieldGrid.v, fieldGrid.u, fieldGrid.v, time, 2);
    //advect(fieldGrid.u, fieldGrid.u, fieldGrid.v, time, 1);

    diffuse(fieldGrid.t, time,0);
    advect(fieldGrid.t, fieldGrid.u, fieldGrid.v, time, 0);
    drawField(ctx, CELL_SIZE);
    //alert();
    requestAnimationFrame(animationLoop);
  }
  var start = new Date();
  requestAnimationFrame(animationLoop);
}

function drawField(ctx, multiplier) {
  ctx.clearRect(0, 0, width, height);
  for (let i = 0; i < gridHeight; i++) {
    for (let j = 0; j < gridWidth; j++) {
      let x = fieldGrid.t[i * gridWidth + j];
      x = x / 200;
      ctx.fillStyle = rgbToHex(x * 255, (1 - x) * 255, (1 - x) * 255);
      ctx.fillRect(j * multiplier, i * multiplier, multiplier, multiplier);
    }
  }
}

function coor(x, y) {
  return gridHeight * y + x;
}

function diffuse(x, dt,type) {
  let a = dt * diff;
  x0 = x.concat([]);
  for (let k = 0; k < 20; k++) {
    for (let i = 1; i < gridHeight - 1; i++) {
      for (let j = 1; j < gridWidth - 1; j++) {
        x[coor(j, i)] =
          (x0[coor(j, i)] +
            a *
              (x0[coor(j + 1, i)] +
                x0[coor(j - 1, i)] +
                x0[coor(j, i - 1)] +
                x0[coor(j, i + 1)])) /
          (1 + 4 * a);
      }
    }
    setBnd(x,type);
  }
}

function advect(d, u, v, dt, type) {
  let t, b, l, r;
  let x, y;
  var d0 = d.concat([]);
  for (i = 1; i < gridWidth - 1; i++) {
    for (j = 1; j < gridHeight - 1; j++) {
      x = i - dt * v[coor(i, j)];
      y = j - dt * u[coor(i, j)];
      if (x < 0.5) x = 0.5;
      if (x > gridWidth + 0.5) x = gridWidth + 0.5;
      if (y < 0.5) y = 0.5;
      if (y > gridHeight + 0.5) y = gridHeight + 0.5;
      l = x % 1;
      r = 1 - l;
      t = y % 1;
      b = 1 - t;
      let dbl = d0[coor(Math.floor(x), Math.floor(y))];
      let dtl = d0[coor(Math.floor(x), Math.floor(y + 1))];
      let dbr = d0[coor(Math.floor(x + 1), Math.floor(y))];
      let dtr = d0[coor(Math.floor(x + 1), Math.floor(y + 1))];
      d[coor(i, j)] = t * (l * dtl + r * dtr) + b * (l * dbl + r * dbr);
    }
  }
  setBnd(d, type);
}

function addTsource() {}

function setBnd(x, type) {
  if (type == 0) { //Граничные условия для температуры
    for (let i = 0; i < gridWidth; i++) {
      x[i] = x[gridWidth + i];
    }
    for (let i = 0; i < gridWidth; i++) {
      x[gridWidth * (gridHeight - 1) + i] =
        x[gridWidth * (gridHeight - 1) + i - 1];
    }
    for (let i = 1; i < gridHeight; i++) {
      x[i * gridWidth] = x[i * gridWidth + 1];
    }
    for (let i = 1; i < gridHeight; i++) {
      x[i * gridWidth + gridWidth - 1] = x[i * gridWidth + gridWidth - 2];
    }
  }
  if (type == 1){//Граничные условия для y компоненты скорости
    for (let i = 0; i < gridWidth; i++) {
      x[i] = Math.abs(x[gridWidth + i]);
    }
    for (let i = 0; i < gridWidth; i++) {
      x[gridWidth * (gridHeight - 1) + i] =
        +Math.abs(x[gridWidth * (gridHeight - 1) + i - 1]);
    }
    for (let i = 1; i < gridHeight; i++) {
      x[i * gridWidth] = x[i * gridWidth + 1];
    }
    for (let i = 1; i < gridHeight; i++) {
      x[i * gridWidth + gridWidth - 1] = x[i * gridWidth + gridWidth - 2];
    }
  }
  if (type == 2){//Граничные условия для x компоненты скорости
    for (let i = 0; i < gridWidth; i++) {
      x[i] = x[gridWidth + i];
    }
    for (let i = 0; i < gridWidth; i++) {
      x[gridWidth * (gridHeight - 1) + i] =
      x[gridWidth * (gridHeight - 1) + i - 1];
    }
    for (let i = 1; i < gridHeight; i++) {
      x[i * gridWidth] = Math.abs(x[gridWidth * (gridHeight - 1) + i - 1]);
    }
    for (let i = 1; i < gridHeight; i++) {
      x[i * gridWidth + gridWidth - 1] = -Math.abs(x[i * gridWidth + gridWidth - 2]);
    }
  }
}

function gridInitialize(fieldGrid) {
  for (let i = 0; i < gridHeight; i++) {
    for (let j = 0; j < gridWidth; j++) {
      if (i > 40 && i < 60) fieldGrid.t.push(200);
      else fieldGrid.t.push(0);
      fieldGrid.prevT.push(0);
      // fieldGrid.prevV.push(0);
      // fieldGrid.prevU.push(0);
      fieldGrid.v.push(0);
      if ((j > 40 && j < 60)&&(i > 45 && i < 55))  fieldGrid.u.push(0.01);
      else  
      fieldGrid.u.push(0);
    }
  }
}

function init() {
  fieldGrid = {
    t: [],
    prevT: [],
    tSource: [],
    v: [],
    // prevV: [],
    u: []
    // prevU: [],
    //display: []
  };
  gridInitialize(fieldGrid);
  canvasEl = document.getElementById("el");
  ctx = canvasEl.getContext("2d");
  width = ctx.canvas.width;
  height = ctx.canvas.height;
  start(ctx);
}
