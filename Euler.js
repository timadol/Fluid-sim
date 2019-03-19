/* eslint-disable no-undef */
const N = 100;
const CELL_SIZE = 4;
const TIME_MULTIPLIER = 1;

let gridWidth = N;
let gridHeight = N;
let width = CELL_SIZE * gridWidth;
let height = CELL_SIZE * gridHeight;
let diff = 1;

var fieldGrid;

function hToRgb(h) {
  let seg = Math.floor(h / 60);
  let coor = (h / 60) % 1;
  switch (seg) {
    case 0:
      return [255, coor * 255, 0];
    case 1:
      return [(1 - coor) * 255, 255, 0];
    case 2:
      return [0, 255, coor * 255];
    case 3:
      return [0, (1 - coor) * 255, 255];
    case 4:
      return [coor * 255, 0, 255];
    case 5:
      return [coor * 255, 0, (1 - coor) * 255];

    default:
      return;
  }
}

function rgbToHex(arr) {
  return "#" + toHex(arr[0]) + toHex(arr[1]) + toHex(arr[2]);
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

    diffuse(fieldGrid.t, time, 0);
    //advect(fieldGrid.t,fieldGrid.v,fieldGrid.u,time,0);
    drawField(ctx, CELL_SIZE);
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
      ctx.fillStyle = rgbToHex(hToRgb((1 - x) * 240));
      ctx.fillRect(j * multiplier, i * multiplier, multiplier, multiplier);
    }
  }
}

function coor(x, y) {
  return gridHeight * y + x;
}

function diffuse(d, dt, type) {
  let a = dt * diff;

  for (let k = 0; k < 20; k++) {
    let d0 = d.concat([]);
    for (let i = 1; i < gridHeight - 1; i++) {
      for (let j = 1; j < gridWidth - 1; j++) {
        d[coor(j, i)] =
          (d0[coor(j, i)] +
            a *
              (d[coor(j + 1, i)] +
                d[coor(j - 1, i)] +
                d[coor(j, i - 1)] +
                d[coor(j, i + 1)])) /
          (1 + 4 * a);
      }
    }
    setBnd(d, type);
  }
}

function advect(d, v, u, dt, type) {
  let d0 = d.concat([]);
  for (let i = 1; i < gridHeight - 1; i++) {
    for (let j = 1; j < gridWidth - 1; j++) {
      let y = i - dt * u[coor(j, i)];
      let x = j - dt * v[coor(j, i)];
      if (x<0.5) x = 0.5;
      if (x>gridWidth-0.5) x = gridWidth-0.5;
      if (y<0.5) y = 0.5;
      if (y>gridHeight - 0.5) x = gridHeight -0.5;
      let kTL = (y % 1) * (x % 1);
      let kTR = (y % 1) * (1 - (x % 1));
      let kBL = (1 - (y % 1)) * (x % 1);
      let kBR = (1 - (y % 1)) * (1 - (x % 1));
      let tL = d0[coor(Math.floor(x)-1, Math.floor(y))-1];
      let tR = d0[coor(Math.floor(x), Math.floor(y))-1];
      let bL = d0[coor(Math.floor(x)-1, Math.floor(y))];
      let bR = d0[coor(Math.floor(x), Math.floor(y))];
      d[coor(j, i)] = kTL * tL + kTR * tR * kBL * bL * kBR * bR;
    }
  }
  setBnd(d,type);
}

function setBnd(x, type) {
  if (type == 0) {
    //Граничные условия для температуры
    for (let i = 0; i < gridWidth; i++) {
      if (i > 40 && i < 60) x[i] = x[gridWidth + i];
      else x[i] = 200;
    }
    for (let i = 0; i < gridWidth; i++) {
      //x[gridWidth * (gridHeight - 1) + i] = x[gridWidth * (gridHeight - 1) + i - 1];
      x[gridWidth * (gridHeight - 1) + i] = 0;
    }
    for (let i = 1; i < gridHeight; i++) {
      x[i * gridWidth] = x[i * gridWidth + 1];
    }
    for (let i = 1; i < gridHeight; i++) {
      x[i * gridWidth + gridWidth - 1] = x[i * gridWidth + gridWidth - 2];
    }
  }
  if (type == 1) {
    //Граничные условия для y компоненты скорости
    for (let i = 0; i < gridWidth; i++) {
      x[i] = Math.abs(x[gridWidth + i]);
    }
    for (let i = 0; i < gridWidth; i++) {
      x[gridWidth * (gridHeight - 1) + i] = +Math.abs(
        x[gridWidth * (gridHeight - 1) + i - 1]
      );
    }
    for (let i = 1; i < gridHeight; i++) {
      x[i * gridWidth] = x[i * gridWidth + 1];
    }
    for (let i = 1; i < gridHeight; i++) {
      x[i * gridWidth + gridWidth - 1] = x[i * gridWidth + gridWidth - 2];
    }
  }
  if (type == 2) {
    //Граничные условия для x компоненты скорости
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
      x[i * gridWidth + gridWidth - 1] = -Math.abs(
        x[i * gridWidth + gridWidth - 2]
      );
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
      //if (j > 40 && j < 60 && (i > 45 && i < 55)) fieldGrid.u.push(0.01);
      //else 
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
