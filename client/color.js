// Get Canvas context
let ctx = document.getElementById('bg').getContext('2d');

// Draw loop
function draw() {
    // Draw dynamic background
    ctx.fillStyle = getNextBackgroundColor();
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    requestAnimationFrame(draw);
}

draw();