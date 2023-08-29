const canvas = document.querySelector('#main-canvas');
const ctx = canvas.getContext('2d');

const circle = document.querySelector('#circle');

let animationStartTime = null;
let previousTimeStamp = null;
let animateFrom = 0;
let animationDirection = 1;

let code;

let mode = 'js';
let zoom = 1;

let movingP2 = false;
let movingP3 = false;
let ox, oy;

let p2 = {
  x: 1 / 3,
  y: 0.7
};

let p3 = {
  x: 2 / 3,
  y: 0.3
};

let a, b;

function fillOutput() {
  const fnName = document.querySelector('#name').value || 'ease';
  const outputElement = document.querySelector('#output > code');

  code = `// t: number in range [0..1], returns 0 at t=0 and 1 at t=1
function ${fnName}(t${mode === 'ts' ? ': number' : ''})${mode === 'ts' ? ': number' : ''} {
  return ${Math.round(p2.y * 3 * 1000) / 1000} * (1 - t) ** 2 * t + ${Math.round(p3.y * 3 * 1000) / 1000} * (1 - t) * t ** 2 + t ** 3;
}`;

  outputElement.innerHTML = code;
  hljs.highlightElement(outputElement);
}

function updateCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGuides();
  drawBorder();
  drawBezier();
  drawHandles();
}

function drawHandles() {
  ctx.fillStyle = '#9b59b6';
  ctx.strokeStyle = '#9b59b6'
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(atoc(0, 'x'), atoc(0, 'y'));
  ctx.lineTo(atoc(p2.x, 'x'), atoc(p2.y, 'y'));
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(atoc(p2.x, 'x'), atoc(p2.y, 'y'), 10, 0, 2 * Math.PI, false, 'y');
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(atoc(1, 'x'), atoc(1, 'y'));
  ctx.lineTo(atoc(p3.x, 'x'), atoc(p3.y, 'y'));
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(atoc(p3.x, 'x'), atoc(p3.y, 'y'), 10, 0, 2 * Math.PI, false, 'y');
  ctx.fill();
}

function drawBorder() {
  ctx.setLineDash([]);
  ctx.lineWidth = 2;
  drawLine(atoc(0, 'x'), atoc(1, 'y'), atoc(1, 'x'), atoc(1, 'y'));
  drawLine(atoc(1, 'x'), atoc(0, 'y'), atoc(1, 'x'), atoc(1, 'y'));
  drawLine(atoc(0, 'x'), atoc(0, 'y'), atoc(0, 'x'), atoc(1, 'y'));
  drawLine(atoc(0, 'x'), atoc(0, 'y'), atoc(1, 'x'), atoc(0, 'y'));
}

function drawGuides() {
  ctx.setLineDash([5, 15]);
  ctx.lineWidth = 3;
  // drawLine(0, atoc(1/3), canvas.width, atoc(1/3), 'y');
  // drawLine(0, atoc(2/3), canvas.width, atoc(2/3), 'y');
  drawLine(atoc(1 / 3, 'x'), 0, atoc(1 / 3, 'x'), canvas.height);
  drawLine(atoc(2 / 3, 'x'), 0, atoc(2 / 3, 'x'), canvas.height);
}

function drawLine(x1, y1, x2, y2) {
  ctx.strokeStyle = '#FFFFFF30';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawBezier() {
  ctx.strokeStyle = '#1abc9c'
  ctx.beginPath();
  ctx.moveTo(atoc(0, 'x'), atoc(0, 'y'));
  ctx.bezierCurveTo(atoc(p2.x, 'x'), atoc(p2.y, 'y'), atoc(p3.x, 'x'), atoc(p3.y, 'y'), atoc(1, 'x'), atoc(1, 'y'));
  ctx.stroke();
}

function checkP2Click(x, y) {
  dx = atoc(p2.x, 'x') - x;
  dy = atoc(p2.y, 'y') - y;
  console.log(x, y, dx, dy);
  if (Math.sqrt(dx * dx + dy * dy) < 10) {

    movingP2 = true;
    movingP3 = false;
    oy = dy;
  }
}

function checkP3Click(x, y) {
  dx = atoc(p3.x, 'x') - x;
  dy = atoc(p3.y, 'y') - y;
  if (Math.sqrt(dx * dx + dy * dy) < 10) {
    movingP3 = true;
    movingP2 = false;
    oy = dy;
  }
}

function ctoa(n, axis) {
  if (axis === 'x') return n / 300;
  if (axis === 'y') return 1 - (n - (500 - 300 * zoom) / 2) / 300 / zoom;
}

function atoc(n, axis) {
  if (axis === 'x') return n * 300;
  if (axis === 'y') return (1 - n) * 300 * zoom + (500 - 300 * zoom) / 2;
}

function animate(timestamp) {
  console.log(timestamp);
  if (animationStartTime === null) animationStartTime = timestamp;
  const t = (timestamp - animationStartTime) / 1000;

  if (previousTimeStamp !== timestamp) {
    const xOff = animateFrom + animationDirection * ease(t) * 300;
    circle.style.left = `${xOff}px`;
  }

  if (t > 1) {
    if (animateFrom === 0) {
      animateFrom = 300;
    } else {
      animateFrom = 0;
    }

    animationDirection *= -1;

    animationStartTime = null;

    return;
  };

  previousTimeStamp = timestamp;
  window.requestAnimationFrame(animate);
}

function ease(t) {
  return (Math.round(a * 3 * 1000) / 1000) * (1 - t) ** 2 * t + (Math.round(b * 3 * 1000) / 1000) * (1 - t) * t ** 2 + t ** 3;
}

function getOffset(el) {
  var rect = el.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
}

function handleMouseDown(evt) {
  let x, y;

  if (evt.type === 'mousedown') {
    x = evt.offsetX;
    y = evt.offsetY;
  } else {
    const offset = getOffset(document.querySelector('#main-canvas'));
    x = evt.touches[0].pageX - offset.left;
    y = evt.touches[0].pageY - offset.top;
  }

  checkP2Click(x, y);
  checkP3Click(x, y);
}

function handleMouseMove(evt) {
  let x, y;

  if (evt.type === 'mousemove') {
    x = evt.offsetX;
    y = evt.offsetY;
  } else {
    const offset = getOffset(document.querySelector('#main-canvas'));
    x = evt.touches[0].pageY - offset.left;
    y = evt.touches[0].pageY - offset.top;
  }

  if (movingP2) {
    p2.y = ctoa(y + oy, 'y');
    updateCanvas();
    fillOutput();
  }

  if (movingP3) {
    p3.y = ctoa(y + oy, 'y');
    updateCanvas();
    fillOutput();
  }

  evt.preventDefault();
}

function handleMouseUp(evt) {
  movingP2 = false;
  movingP3 = false;
}

canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('touchstart', handleMouseDown);

canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('touchmove', handleMouseMove);

document.addEventListener('mouseup', handleMouseUp);
document.addEventListener('touchend', handleMouseUp);

document.querySelector('#name').addEventListener('input', (evt) => {
  fillOutput();
});

document.querySelector('#copy').addEventListener('click', (evt) => {
  // const codeEl = document.querySelector('#output > code');
  // codeEl.select();
  // codeEl.setSelectionRange(0, 99999);

  navigator.clipboard.writeText(code);
});

document.querySelector('#js').addEventListener('click', (evt) => {
  mode = 'js';
  document.querySelector('#js').classList.add('active');
  document.querySelector('#ts').classList.remove('active');
  document.querySelector('#output > code').classList.add('language-javascript');
  document.querySelector('#output > code').classList.remove('language-typescript');
  fillOutput();
});

document.querySelector('#ts').addEventListener('click', (evt) => {
  mode = 'ts';
  document.querySelector('#ts').classList.add('active');
  document.querySelector('#js').classList.remove('active');
  document.querySelector('#output > code').classList.add('language-typescript');
  document.querySelector('#output > code').classList.remove('language-javascript');
  fillOutput();
});

document.querySelector('#zoom-in').addEventListener('click', (evt) => {
  zoom += 0.2;
  document.querySelector('#zoom-out').classList.remove('disabled');
  if (zoom > 1) {
    zoom = 1;
    document.querySelector('#zoom-in').classList.add('disabled');
  }
  updateCanvas();

});

document.querySelector('#zoom-out').addEventListener('click', (evt) => {
  zoom -= 0.2;
  document.querySelector('#zoom-in').classList.remove('disabled');
  if (zoom < 0.2) {
    zoom = 0.2;
    document.querySelector('#zoom-out').classList.add('disabled');
  }
  updateCanvas();

});

document.querySelector('#animate').addEventListener('click', (evt) => {
  a = p2.y;
  b = p3.y;
  window.requestAnimationFrame(animate);
});

updateCanvas();
fillOutput();