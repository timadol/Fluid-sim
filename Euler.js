/* eslint-disable no-undef */
const DURATION = 10000;
const N = 100;
const GRID_SIZE = 4;



let gridWidth = N;
let gridHeight = N;
let width = GRID_SIZE * gridWidth;
let height = GRID_SIZE * gridHeight;
let diff = 1;

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
    densStep(time);
    drawDens(ctx, GRID_SIZE);
    // test

    // ctx.fillSyle = "#000000";
    // ctx.fillRect(time/10,time/10,50,50);

    start = new Date();
    requestAnimationFrame(animationLoop);
  }
  var start = new Date();
  requestAnimationFrame(animationLoop);
}

function drawDens(ctx, multiplier) {
  ctx.clearRect(0, 0, width, height);
  for (let i = 0; i < gridHeight; i++) {
    for (let j = 0; j < gridWidth; j++) {
      let temp = fieldGrid.dens[i * gridWidth + j];
      ctx.fillStyle = rgbToHex(temp / 2 * 255, temp / 2 * 255, temp / 2 * 255);
      ctx.fillRect(i * multiplier, j * multiplier, multiplier, multiplier);
    }
  }

}

function gridInitialize(fieldGrid) {
  for (let i = 0; i < gridHeight; i++) {
    for (let j = 0; j < gridWidth; j++) {
      fieldGrid.v.push(0);
      fieldGrid.prevV.push(0);
      fieldGrid.u.push(0);
      fieldGrid.prevU.push((gridHeight / 2 - i)/gridHeight);
      fieldGrid.dens.push(1);
      fieldGrid.prevDens.push(0);
    }
  }
}

function diffuse(x, x0, dt) {
  let a = dt * diff * gridHeight * gridWidth;
  for (let k = 0; k < 20; k++) {
    for (let i = 1; i < gridHeight - 1; i++) {
      for (let j = 1; j < gridWidth - 1; j++) {
        x[i * gridWidth + j] =
          (x0[i * gridWidth + j] +
            a *
            (x[(i - 1) * gridWidth + j] +
              x[(i + 1) * gridWidth + j] +
              x[i * gridWidth + j + 1] +
              x[i * gridWidth + j - 1])) /
          (1 + 4 * a);
      }
    }
    setBnd(0, x);
  }
  
}

function advect(d, d0, v, u, dt, b) {
  let i0, i1, j0, j1;
  let x, y, s0, t0, s1, t1;
  let dt0 = dt * N;
  for (let i = 1; i < gridHeight - 1; i++) {
    for (let j = 1; j < gridWidth - 1; j++) {
      x = i - dt0 * u[i * gridWidth + j];
      y = i - dt0 * v[i * gridWidth + j];
      if (x < 0.5) x = 0.5;
      if (x > gridWidth + 0.5) x = gridWidth + 0.5;
      if (y < 0.5) x = 0.5;
      if (y > gridWidth + 0.5) x = gridHeight + 0.5;
      i0 = Math.floor(x);
      i1 = i0 + 1;
      j0 = Math.floor(y);
      j1 = j0 + 1;
      s1 = x - i0;
      s0 = 1 - s1;
      t1 = y - j0;
      t0 = 1 - t1;
      d[i * gridWidth + j] = s0 * (t0 * d0[i0 * gridWidth + j0] + t1 * d0[i0 * gridWidth + j1]) +
        s1 * (t0 * d0[i1 * gridWidth + j0] + t1 * d0[i1 * gridWidth + j1]);
    }
  }
  setBnd(b, d);
}

function setBnd(bndType, x) {
  for (let i = 1; i < gridWidth - 1; i++) {
    x[0 * gridWidth + i] = x[1 * gridWidth + i];
    x[(gridHeight - 1) * gridWidth + i] = x[(gridHeight - 2) * gridWidth + i];
  }
  for (let i = 1; i < gridHeight - 1; i++) {
    x[i * gridWidth + 0] = x[i * gridWidth + 1];
    x[i * gridWidth + gridWidth - 1] = x[i * gridWidth + gridWidth - 2];
  }
  x[0 * gridWidth + 0] = (x[1 * gridWidth + 0] + x[0 * gridWidth + 1])/2;
  x[0 * gridWidth + gridWidth - 1] = (x[1 * gridWidth + gridWidth - 1] + x[0 * gridWidth + gridWidth - 2])/2;
  x[(gridHeight - 1) * gridWidth + 0] = (x[(gridHeight - 2) * gridWidth + 0] + x[(gridHeight - 1) * gridWidth + 1])/2;
  x[(gridHeight - 1) * gridWidth + gridWidth - 1] = (x[(gridHeight - 2) * gridWidth + gridWidth - 1] + x[(gridHeight - 1) * gridWidth + gridWidth - 2])/2;
}

function addSource(x, x0, dt) {
  var temp = x;
  for (let i = 0; i < gridHeight * gridWidth; i++) {
    x[i] += x0[i] * dt;

  }
  x0 = temp;
}

function swap(x,y){
  let temp = x;
  x=y;
  y=temp;
}

function densStep(dt) {
  addSource(fieldGrid.dens, fieldGrid.prevDens, dt);
  diffuse(fieldGrid.dens, fieldGrid.prevDens, dt);
  advect( fieldGrid.dens,fieldGrid.prevDens, fieldGrid.v, fieldGrid.u, dt);
}

(function () {
  const requestAnimationFrame =
    window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
})();

function init() {
  fieldGrid = {
    v: [],
    prevV: [],
    u: [],
    prevU: [],
    dens: [],
    prevDens: []
  };
  gridInitialize(fieldGrid);
  canvasEl = document.getElementById("el");
  ctx = canvasEl.getContext("2d");
  width = ctx.canvas.width;
  height = ctx.canvas.height;
  start(ctx);
}