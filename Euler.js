/* esllet-disable no-undef */
const N = 100;
const CELL_SIZE = 4;
const TIME_MULTIPLIER = 1000;

let gridWidth = N;
let gridHeight = N;
let width = CELL_SIZE * gridWidth;
let height = CELL_SIZE * gridHeight;
let diff = 100;

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
    advect(fieldGrid.t,fieldGrid.v,fieldGrid.u,time,0);
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
      let display = fieldGrid.t[i * gridWidth + j];
      display = display / 200;
      ctx.fillStyle = rgbToHex(hToRgb((1 - display) * 240));
      ctx.fillRect(j * multiplier, i * multiplier, multiplier, multiplier);
    }
  }
}

function coor(x, y) {
  return gridWidth * y + x;
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

function advect(d, velocX, velocY, dt, b)
{
    let i0, i1, j0, j1;
    
    var d0 = d.concat([]);

    let dtx = dt;
    let dty = dt;
    
    let s0, s1, t0, t1;
    let tmp1, tmp2, x, y;
    
        for(let j = 1; j < N - 1; j++) { 
            for( let i = 1; i < N - 1; i++) {
                tmp1 = dtx * velocX[coor(i, j)];
                tmp2 = dty * velocY[coor(i, j)];
                x = i - tmp1; 
                y = j - tmp2;

                
                if(x < 0.5) x = 0.5; 
                if(x > N + 0.5) x = N + 0.5; 
                i0 = Math.floor(x); 
                i1 = i0 + 1;
                if(y < 0.5) y = 0.5; 
                if(y > N + 0.5) y = N + 0.5; 
                j0 = Math.floor(y);
                j1 = j0 + 1; 
                
                s1 = x - i0; 
                s0 = 1 - s1; 
                t1 = y - j0; 
                t0 = 1 - t1;
                
                let i0i = i0;
                let i1i = i1;
                let j0i = j0;
                let j1i = j1;

                
                d[coor(i, j)] = 
                
                    s0 * ( t0 * d0[coor(i0i, j0i)]
                        + t1 * d0[coor(i0i, j1i)])
                   +s1 * ( t0 * d0[coor(i1i, j0i)]
                        +( t1 * d0[coor(i1i, j1i)]));
            }
        }
    setBnd(d,b);
}

function setBnd(x, type) {
  if (type == 0) {
    //Граничные условия для температуры
    for (let i = 0; i < gridWidth; i++) {
      if (i > 20 && i < 80) 
      x[i] = 0;
      else 
      x[i] = 200;
    }
    for (let i = 0; i < gridWidth; i++) {
      x[gridWidth * (gridHeight - 1) + i] = x[gridWidth * (gridHeight - 1) + i - 1];
      //x[gridWidth * (gridHeight - 1) + i] = 0;
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
      if ((j > 40 && j < 60) && (i > 45 && i < 55)) fieldGrid.t.push(200);
      else fieldGrid.t.push(0);
      fieldGrid.prevT.push(0);
      fieldGrid.v.push(20);
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
    u: []

  };
  gridInitialize(fieldGrid);
  canvasEl = document.getElementById("el");
  ctx = canvasEl.getContext("2d");
  width = ctx.canvas.width;
  height = ctx.canvas.height;
  start(ctx);
}
