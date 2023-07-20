// Convert hex to RGB
function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return [r, g, b];
}

function rgbToHex(r, g, b) {
    r = r.toString(16);
    g = g.toString(16);
    b = b.toString(16);

    if (r.length == 1)
        r = "0" + r;
    if (g.length == 1)
        g = "0" + g;
    if (b.length == 1)
        b = "0" + b;

    return "#" + r + g + b;
}

// Linear interpolate between two RGB colors
function lerp(a, b, t) {
    return a + (b - a) * t;
}

// Transition function
function transition(startHex, endHex, step, element) {

    const startRGB = startHex;
    const endRGB = hexToRgb(endHex);

    let delay = 0;
    for (let i = 0; i <= step; i++) {
        delay += 10;
        setTimeout(() => {
            const r = Math.round(lerp(startRGB[0], endRGB[0], i / step));
            const g = Math.round(lerp(startRGB[1], endRGB[1], i / step));
            const b = Math.round(lerp(startRGB[2], endRGB[2], i / step));

            const newHex = '#' + r.toString(16) + g.toString(16) + b.toString(16);
            element.style.backgroundColor = newHex;
        }, delay);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const inputElement = document.getElementById('input');
    const body = document.getElementById('body');

    let timeout;

    inputElement.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 0.8 * window.innerHeight) + 'px';
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            const inputValue = inputElement.value;
            if (inputValue === "") {
                return;
            } else {
                fetch('https://colorizer-seven.vercel.app/color', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            sentence: inputValue
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        let currColor = window.getComputedStyle(body).backgroundColor;
                        const rgbRegex = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/;

                        const match = currColor.match(rgbRegex);

                        const r = match[1];
                        const g = match[2];
                        const b = match[3];
                        transition([r, g, b].map((c) => parseInt(c)), data.hex, 100, body);
                    })
                    .catch((err) => {
                        const infoPane = document.getElementById('infoPane');
                        infoPane.style.display = "flex";
                        inputElement.disabled = true;
                        infoPane.addEventListener('click', () => {
                            infoPane.style.display = "none";
                            inputElement.disabled = false;
                        })
                    })
            }
        }, 1000);
    });
});