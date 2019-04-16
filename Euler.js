/* esllet-disable no-undef */
const N = 102;
const CELL_SIZE = 4;
const TIME_MULTIPLIER = 0.3;

let gridWidth = N;
let gridHeight = N;
let width = CELL_SIZE * gridWidth;
let height = CELL_SIZE * gridHeight;
let diff = 0;
let visc = 0;

var fieldGrid;
var boundary = [];

function arrMaxAndMin(arr){
  if(arr.length == 0) return;
  let max = arr[0];
  let min = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if(arr[i]>max) max=arr[i];
    if(arr[i]<min) min=arr[i];    
  }
  return {max,min};
}

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

function blueRed(h){
  if (h < 0.5) return [0,0,(1-2*h)*255];
  else return [(2*h-1)*255,0,0];
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
    time = TIME_MULTIPLIER;
    start = new Date();

    diffuse(fieldGrid.v, time, visc, 1);
    diffuse(fieldGrid.u, time, visc, 2);

    project(fieldGrid.v,fieldGrid.u);
    
    advect(fieldGrid.v, fieldGrid.v, fieldGrid.u, time, 1);
    advect(fieldGrid.u, fieldGrid.v, fieldGrid.u, time, 2);

    project(fieldGrid.v,fieldGrid.u);

    diffuse(fieldGrid.t, time, diff, 0);
    advect(fieldGrid.t, fieldGrid.v, fieldGrid.u, time, 0);

    rotor(fieldGrid);
    ctx.clearRect(0, 0, width, height);
    drawField(ctx, CELL_SIZE);
    //drawVelocity(ctx, CELL_SIZE);
    requestAnimationFrame(animationLoop);
  }
  var start = new Date();
  requestAnimationFrame(animationLoop);
}

function drawField(ctx, multiplier) {
  let maxAndMin = arrMaxAndMin(fieldGrid.rotor);
  for (let i = 1; i < gridHeight-1; i++) {
    for (let j = 1; j < gridWidth-1; j++) {
      let display;
      display = (fieldGrid.rotor[coor(j,i)]-maxAndMin.min) / (maxAndMin.max-maxAndMin.min);
      ctx.fillStyle = rgbToHex(blueRed((1 - display)));
      ctx.fillRect(j * multiplier, i * multiplier, multiplier, multiplier);
    }
  }
  
}
function drawVelocity(ctx, multiplier){
  for (let i = 1; i < gridHeight-1; i++) {
    for (let j = 1; j < gridWidth-1; j++) {
      ctx.strokeStyle = "#ffffff";
      ctx.globalAlpha = 0.1;
      ctx.beginPath();
      ctx.moveTo((j + 0.5) * multiplier, (i + 0.5) * multiplier);
      ctx.lineTo(
        (j + 0.5) * multiplier + 5 * fieldGrid.v[i * gridWidth + j],
        (i + 0.5) * multiplier + 5 * fieldGrid.u[i * gridWidth + j]
      );
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
}
function coor(x, y) {
  return gridWidth * y + x;
}

function diffuse(d, dt, diff, type) {
  let a = dt * diff;
  let d0 = d.concat([]);
  for (let k = 0; k < 20; k++) {
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
  let i0, i1, j0, j1;

  var d0 = d.concat([]);

  let dtx = dt;
  let dty = dt;

  let s0, s1, t0, t1;
  let tmp1, tmp2, x, y;

  for (let j = 1; j < N - 1; j++) {
    for (let i = 1; i < N - 1; i++) {
      tmp1 = dtx * v[coor(i, j)];
      tmp2 = dty * u[coor(i, j)];
      x = i - tmp1;
      y = j - tmp2;

      if (x < 0.5) x = 0.5;
      if (x > N + 0.5) x = N + 0.5;
      i0 = Math.floor(x);
      i1 = i0 + 1;
      if (y < 0.5) y = 0.5;
      if (y > N + 0.5) y = N + 0.5;
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
        s0 * (t0 * d0[coor(i0i, j0i)] + t1 * d0[coor(i0i, j1i)]) +
        s1 * (t0 * d0[coor(i1i, j0i)] + t1 * d0[coor(i1i, j1i)]);
    }
  }
  setBnd(d, type);
}

function project(v, u) {
  var div = v.concat([]);
  var p = v.concat([]);

  for (let j = 1; j < N - 1; j++) {
    for (let i = 1; i < N - 1; i++) {
      div[coor(i, j)] =
        (-0.5 *
          (v[coor(i + 1, j)] -
            v[coor(i - 1, j)] +
            u[coor(i, j + 1)] -
            u[coor(i, j - 1)])) /
        N;
      p[coor(i, j)] = 0;
    }
  }
  setBnd(div, 3);
  for (let k = 0; k < 20; k++) {
    for (let i = 1; i <= N; i++) {
      for (let j = 1; j <= N; j++) {
        p[coor(i, j)] =
          (div[coor(i, j)] +
            p[coor(i - 1, j)] +
            p[coor(i + 1, j)] +
            p[coor(i, j - 1)] +
            p[coor(i, j + 1)]) /
          4;
      }
    }
    setBnd(p, 3);
  }

  for (let j = 1; j < N - 1; j++) {
    for (let i = 1; i < N - 1; i++) {
      v[coor(i, j)] -= 0.5 * (p[coor(i + 1, j)] - p[coor(i - 1, j)]) * N;
      u[coor(i, j)] -= 0.5 * (p[coor(i, j + 1)] - p[coor(i, j - 1)]) * N;
    }
  }

  setBnd(v, 1);
  setBnd(u, 2);
}

function rotor(fieldGrid){
  for (let i = 1; i < gridHeight-1; i++) {
    for (let j = 1; j < gridWidth-1; j++) {
      let temp1 = -fieldGrid.v[coor(j,i+1)];
      let temp2 = fieldGrid.v[coor(j,i-1)];
      let temp3 = -fieldGrid.u[coor(j+1,i)];
      let temp4 = fieldGrid.u[coor(j-1,i)];
      fieldGrid.rotor[coor(j,i)] = temp1+temp2+temp3+temp4;
    }
  }
}

function setBnd(x, b) {
  if (b == 0) { //для плотности
    for (let i = 1; i < gridWidth - 1; i++) {
      x[coor(i, 0)] = x[coor(i, 1)];
      x[coor(i, gridWidth - 1)] = x[coor(i, gridWidth - 2)];
    }
    for (let i = 1; i < gridHeight - 1; i++) {
      x[coor(0, i)] = x[coor(1, i)];
      x[coor(gridHeight - 1, i)] = x[coor(gridHeight - 2, i)];
    }
  }
  if (b == 1) { //для х компоненты скорости
    for (let i = 1; i < gridWidth - 1; i++) {
      x[coor(i, 0)] = 0;
      x[coor(i, gridWidth - 1)] = 0;
    }
    for (let i = 1; i < gridHeight - 1; i++) {
      //if (i>40 && i<60)
      x[coor(0, i)] = 1;
      //else x[coor(0, i)] = 0;
      x[coor(gridHeight - 1, i)] = x[coor(gridHeight - 2, i)];
    }
  }
  if (b == 2) { //для у компоненты скорости
    for (let i = 1; i < gridWidth - 1; i++) {
      x[coor(i, 0)] = 0;
      x[coor(i, gridWidth - 1)] = 0;
    }
    for (let i = 1; i < gridHeight - 1; i++) {
      x[coor(0, i)] = 0;
      x[coor(gridHeight - 1, i)] = 0;
    }
  }
  if (b == 3) {//особый случай, искользуется в расчете уравнения Пуассона
    for (let i = 1; i < gridWidth - 1; i++) {
      x[coor(i, 0)] = x[coor(i, 1)];
      x[coor(i, gridWidth - 1)] = x[coor(i, gridWidth - 2)];
    }
    for (let i = 1; i < gridHeight - 1; i++) {
      x[coor(0, i)] = x[coor(1, i)];
      x[coor(gridHeight - 1, i)] = x[coor(gridHeight - 2, i)];
    }
  }

  x[coor(0, 0)] = 0.5 * (x[coor(1, 0)] + x[coor(0, 1)]);
  x[coor(0, gridWidth - 1)] =
    0.5 * (x[coor(1, gridWidth - 1)] + x[coor(0, gridWidth - 2)]);
  x[coor(gridHeight - 1, 0)] =
    0.5 * (x[coor(gridHeight - 2, 0)] + x[coor(gridHeight - 1, 1)]);
  x;
  if(b!=0){
  for (let i = 0; i < boundary.length; i++) {
    x[coor(boundary[i].x,boundary[i].y)]=0;    
  }
}
}

function gridInitialize(fieldGrid) {
  for (let i = 0; i < gridHeight; i++) {
    for (let j = 0; j < gridWidth; j++) {
      if (j > 30 && j < 50 && (i > 30 && i < 50)) fieldGrid.t.push(200);
      //else if (j > 50 && j < 70 && (i > 50 && i < 70)) fieldGrid.t.push(200);
      //else 
      fieldGrid.t.push(0);
      //if (j > 30 && j < 50 && (i > 30 && i < 50)) fieldGrid.v.push(50);
      //else 
      fieldGrid.v.push(0);
      //if (j > 40 && j < 60 )
      //if (j > 50 && j < 70 && (i > 50 && i < 70)) fieldGrid.u.push(-50);
      //else 
      fieldGrid.u.push(0);
      //else
      //fieldGrid.u.push(0);
      fieldGrid.rotor.push(0);
    }
  }
}

function bodyInit(boundary){
  for (let i = 0; i < 10; i++) {
    boundary.push({x:10+i,y:50+i});
    boundary.push({x:10+i,y:50-i});
    boundary.push({x:30-i,y:50+i});
    boundary.push({x:30-i,y:50-i});
    
  }
}

function init() {
  fieldGrid = {
    t: [],
    prevT: [],
    tSource: [],
    v: [],
    u: [],
    rotor: [],
  };
  gridInitialize(fieldGrid);
  bodyInit(boundary);
  canvasEl = document.getElementById("el");
  ctx = canvasEl.getContext("2d");
  ctx.canvas.width = width ;
  ctx.canvas.height = height;
  start(ctx);
}
