// Based on https://stackoverflow.com/a/49321304/466030

const $COLOR1 = document.getElementById('color1');
const $COLOR2 = document.getElementById('color2');
const $MIDPOINTS = document.getElementById('midpoints');
const $OUTPUT = document.getElementById('output');

function load() {
  if (localStorage.getItem('saved')) {
    $COLOR1.value = localStorage.getItem('color1');
    $COLOR2.value = localStorage.getItem('color2');
    $MIDPOINTS.value = localStorage.getItem('midpoints');
  }
}

function store() {
  localStorage.setItem('saved', "true");
  localStorage.setItem('color1', $COLOR1.value);
  localStorage.setItem('color2', $COLOR2.value);
  localStorage.setItem('midpoints', $MIDPOINTS.value);
}

function init() {
  $COLOR1.addEventListener('change', update);
  $COLOR2.addEventListener('change', update);
  $MIDPOINTS.addEventListener('change', update);
}

function update() {
  try {
    clear();

    const TOP = parseInt($MIDPOINTS.value) + 1;
    const GRADIENT = new Gradient(new Color($COLOR1.value), new Color($COLOR2.value));

    for (let i = 0; i <= TOP; i++) {
      addStop(GRADIENT.step(i / TOP));
    }
  } finally {
    store();
  }
}

function clear() {
  const NODES = [];
  for (const node of $OUTPUT.childNodes) {
    NODES.push(node);
  }
  for (const node of NODES) {
    node.remove();
  }
}

function addStop(color) {
  const row = document.createElement('tr');

  let col = document.createElement('td');
  let text = document.createTextNode(color.value);
  col.appendChild(text);
  row.appendChild(col);

  col = document.createElement('td');
  text = document.createTextNode(color.css);
  col.appendChild(text);
  row.appendChild(col);

  col = document.createElement('td');
  col.style.backgroundColor = color.value;
  row.appendChild(col);

  $OUTPUT.appendChild(row);
}

function lerp(a, b, ratio) {
  return a * (1 - ratio) + b * ratio;
}

function pad(str) {
  return `0${str}`.substr(-2);
}

class Color {
  constructor(value) {
    this.r = this.gammaToLinear(parseInt(value.substr(1, 2), 16) / 255);
    this.g = this.gammaToLinear(parseInt(value.substr(3, 2), 16) / 255);
    this.b = this.gammaToLinear(parseInt(value.substr(5, 2), 16) / 255);
  }

  fromComponents(r, g, b) {
    const COLOR = new Color('#000000');

    COLOR.r = r;
    COLOR.g = g;
    COLOR.b = b;

    return COLOR;
  }

  gammaToLinear(component) {
    if (component <= 0.04045) {
      return component / 12.92;
    } else {
      return Math.pow((component + 0.055) / 1.055, 2.4);
    }
  }

  linearToGamma(component) {
    if (component <= 0.0031308) {
      return component * 12.92;
    } else {
      return (Math.pow(component, 1 / 2.4) * 1.055) - 0.055;
    }
  }

  lerp(other, ratio) {
    return Color.prototype.fromComponents(
      lerp(this.r, other.r, ratio),
      lerp(this.g, other.g, ratio),
      lerp(this.b, other.b, ratio),
    );
  }

  get value() {
    return `#${
      pad(Math.floor(this.linearToGamma(this.r) * 255).toString(16))
    }${
      pad(Math.floor(this.linearToGamma(this.g) * 255).toString(16))
    }${
      pad(Math.floor(this.linearToGamma(this.b) * 255).toString(16))
    }`;
  }

  get css() {
    console.warn('TODO: Color.css');
    return `rgb(${
      Math.floor(this.linearToGamma(this.r) * 255)
    }, ${
      Math.floor(this.linearToGamma(this.g) * 255)
    }, ${
      Math.floor(this.linearToGamma(this.b) * 255)
    })`;
  }
}

class Gradient {
  constructor(color1, color2) {
    this.gamma = 0.43;
    this.color1 = color1;
    this.color2 = color2;
    this.bright1 = Math.pow(color1.r + color1.g + color1.b, this.gamma);
    this.bright2 = Math.pow(color2.r + color2.g + color2.b, this.gamma);
  }

  step(ratio) {
    const INTENSITY = Math.pow(lerp(this.bright1, this.bright2, ratio), 1 / this.gamma);
    const COLOR = this.color1.lerp(this.color2, ratio);
    const TOTAL = COLOR.r + COLOR.g + COLOR.b;
    if (TOTAL > 0) {
      return Color.prototype.fromComponents(
        COLOR.r * INTENSITY / TOTAL,
        COLOR.g * INTENSITY / TOTAL,
        COLOR.b * INTENSITY / TOTAL,
      );
    } else {
      return COLOR;
    }
  }
}

init();
load();
update();
store();
