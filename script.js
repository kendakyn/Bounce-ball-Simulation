const circle = document.getElementById("circle");
const applyBtn = document.getElementById("applyBtn");
const stopBtn = document.getElementById("stopBtn");

let balls = [];
let running = true;

// ---- SOUND SYSTEM ----
let soundEnabled = false;
let bounceSound = null;

const soundSelect = document.getElementById("soundSelect");
const enableSoundBtn = document.getElementById("enableSoundBtn");

// Apply settings (DO NOT restart ball)
applyBtn.addEventListener("click", () => {
    updateCircleSettings();
    updateBallSettings();
});

// Start/Stop button
stopBtn.addEventListener("click", () => {
    running = !running;

    stopBtn.textContent = running ? "Stop" : "Start";
});

// Toggle sound ON/OFF
enableSoundBtn.addEventListener("click", () => {
    soundEnabled = !soundEnabled;

    if (!soundEnabled) {
        enableSoundBtn.textContent = "Enable Sound";
        bounceSound = null;
        return;
    }

    loadSelectedSound();
    enableSoundBtn.textContent = "Disable Sound";
});

// Load sound when dropdown changes
soundSelect.addEventListener("change", () => {
    if (soundEnabled) loadSelectedSound();
});

// Load audio from dropdown selection
function loadSelectedSound() {
    const selected = soundSelect.value;

    if (selected === "none") {
        bounceSound = null;
        return;
    }

    bounceSound = new Audio("sounds/" + selected);
    bounceSound.volume = 0.5;
}


// ---- UPDATE SETTINGS WITHOUT RESET ----

// Change circle size only
function updateCircleSettings() {
    let circleSize = parseInt(document.getElementById("circleSize").value);

    const maxAllowed = Math.min(window.innerWidth - 60, window.innerHeight - 160);
    if (circleSize > maxAllowed) {
        circleSize = maxAllowed;
        document.getElementById("circleSize").value = maxAllowed;
    }

    circle.style.width = circleSize + "px";
    circle.style.height = circleSize + "px";
}

// Change ball size and speed without resetting
function updateBallSettings() {
    const newSize = parseInt(document.getElementById("ballSize").value);
    const newSpeed = parseInt(document.getElementById("ballSpeed").value);

    balls.forEach(ball => {
        ball.size = newSize;
        ball.element.style.width = newSize + "px";
        ball.element.style.height = newSize + "px";

        // Keep direction but adjust magnitude
        const angle = Math.atan2(ball.dy, ball.dx);
        ball.dx = Math.cos(angle) * newSpeed;
        ball.dy = Math.sin(angle) * newSpeed;
    });
}


// ---- CREATE BALL ----
function createBall(x, y, dx, dy, size) {
    const ball = document.createElement("div");
    ball.classList.add("ball");

    ball.style.width = size + "px";
    ball.style.height = size + "px";

    circle.appendChild(ball);

    return { element: ball, x, y, dx, dy, size };
}


// ---- SETUP (initial creation only once) ----
function setup() {
    balls = [];
    circle.innerHTML = "";

    const circleSize = parseInt(document.getElementById("circleSize").value);
    const ballSize = parseInt(document.getElementById("ballSize").value);
    const speed = parseInt(document.getElementById("ballSpeed").value);

    circle.style.width = circleSize + "px";
    circle.style.height = circleSize + "px";

    // Random direction
    const angle = Math.random() * Math.PI * 2;
    const dx = Math.cos(angle) * speed;
    const dy = Math.sin(angle) * speed;

    // Create initial ball
    balls.push(createBall(circleSize / 2, circleSize / 2, dx, dy, ballSize));
}


// ---- ANIMATION LOOP ----
function animate() {
    requestAnimationFrame(animate);

    if (!running) return;

    const circleSize = circle.offsetWidth;
    const radius = circleSize / 2;

    balls.forEach(ball => {
        ball.x += ball.dx;
        ball.y += ball.dy;

        const cx = ball.x - radius;
        const cy = ball.y - radius;
        const dist = Math.sqrt(cx * cx + cy * cy);

        const wallLimit = radius - ball.size / 2;

        // WALL COLLISION
        if (dist >= wallLimit) {
            ball.dx *= -1;
            ball.dy *= -1;

            // SOUND PLAY
            if (soundEnabled && bounceSound) {
                bounceSound.currentTime = 0;
                bounceSound.play();
            }

            // DUPLICATE
            if (balls.length < 500) {
                const newDx = (Math.random() * 4) - 2;
                const newDy = (Math.random() * 4) - 2;

                balls.push(createBall(radius, radius, newDx, newDy, ball.size));
            }
        }

        // Move ball visually
        ball.element.style.left = (ball.x - ball.size / 2) + "px";
        ball.element.style.top = (ball.y - ball.size / 2) + "px";
    });
}


// Start
setup();
animate();
