const OPEN_FOR_TEST = false;
const BIRTHDAY_UNLOCK_TIME = new Date(2026, 8, 11, 0, 0, 0, 0);

const openBtn = document.getElementById("openBtn");
const openBtnText = document.getElementById("openBtnText");
const openBtnIcon = document.getElementById("openBtnIcon");
const unlockStatus = document.getElementById("unlockStatus");

const closeBtn = document.getElementById("closeBtn");
const modal = document.getElementById("modal");
const birthdayVideo = document.getElementById("birthdayVideo");
const videoIntro = document.getElementById("videoIntro");
const videoStage = document.getElementById("videoStage");
const videoHint = document.getElementById("videoHint");
const birthdayCardEnd = document.getElementById("birthdayCardEnd");
const burstLayer = document.getElementById("burstLayer");
const stars = document.getElementById("stars");
const bubbles = document.getElementById("bubbles");
const hearts = document.getElementById("floatingHearts");
const modalSparkles = document.getElementById("modalSparkles");
const soundToggle = document.getElementById("soundToggle");
const soundIcon = document.getElementById("soundIcon");

let audioCtx = null;
let musicTimer = null;
let musicOn = false;
let isUnlocked = false;
let hasPlayedUnlockEffect = false;
let videoStartTimer = null;
let videoRevealTimer = null;

function createStars() {
    for (let i = 0; i < 90; i++) {
        const s = document.createElement("span");
        s.className = "star";
        const size = Math.random() * 2.5 + 1;
        s.style.width = `${size}px`;
        s.style.height = `${size}px`;
        s.style.left = `${Math.random() * 100}%`;
        s.style.top = `${Math.random() * 100}%`;
        s.style.setProperty("--duration", `${Math.random() * 3 + 2}s`);
        s.style.animationDelay = `${Math.random() * 4}s`;
        stars.appendChild(s);
    }
}

function createBubbles() {
    for (let i = 0; i < 20; i++) {
        const b = document.createElement("span");
        b.className = "bubble";
        const size = Math.random() * 38 + 10;
        b.style.width = `${size}px`;
        b.style.height = `${size}px`;
        b.style.left = `${Math.random() * 100}%`;
        b.style.setProperty("--duration", `${Math.random() * 10 + 11}s`);
        b.style.animationDelay = `${Math.random() * 11}s`;
        bubbles.appendChild(b);
    }
}

function createHearts() {
    for (let i = 0; i < 16; i++) {
        const h = document.createElement("span");
        h.className = "floating-heart";
        h.textContent = Math.random() > .5 ? "♡" : "✦";
        h.style.left = `${Math.random() * 100}%`;
        h.style.fontSize = `${Math.random() * 12 + 10}px`;
        h.style.setProperty("--duration", `${Math.random() * 9 + 12}s`);
        h.style.setProperty("--drift", `${Math.random() * 80 - 40}px`);
        h.style.animationDelay = `${Math.random() * 14}s`;
        hearts.appendChild(h);
    }
}

function createModalSparkles() {
    for (let i = 0; i < 24; i++) {
        const s = document.createElement("span");
        s.className = "modal-sparkle";
        s.textContent = Math.random() > .45 ? "✦" : "♡";
        s.style.left = `${Math.random() * 100}%`;
        s.style.top = `${Math.random() * 100}%`;
        s.style.fontSize = `${Math.random() * 10 + 8}px`;
        s.style.animationDelay = `${Math.random() * 2.5}s`;
        modalSparkles.appendChild(s);
    }
}

function createBurst() {
    const icons = ["♡", "💗", "✨", "✦", "🫧", "🪼"];
    for (let i = 0; i < 34; i++) {
        const item = document.createElement("span");
        item.className = "burst-item";
        item.textContent = icons[Math.floor(Math.random() * icons.length)];
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 300 + 100;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        item.style.setProperty("--x", `${x}px`);
        item.style.setProperty("--y", `${y}px`);
        item.style.setProperty("--r", `${Math.random() * 180 - 90}deg`);
        item.style.fontSize = `${Math.random() * 15 + 14}px`;
        burstLayer.appendChild(item);
        setTimeout(() => item.remove(), 2100);
    }
}

function resetVideoModal() {
    clearTimeout(videoStartTimer);
    clearTimeout(videoRevealTimer);
    birthdayVideo.pause();
    birthdayVideo.currentTime = 0;
    videoStage.classList.remove("show");
    videoIntro.classList.remove("hide");
    birthdayCardEnd.classList.remove("show");
    videoHint.innerHTML = 'Chúc mừng em Suwa đáng iu nhaaa';
}

function openModal() {
    if (!isUnlocked) {
        openBtn.classList.add("unlock-pop");
        setTimeout(() => {
            openBtn.classList.remove("unlock-pop");
        }, 750);
        return;
    }

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    resetVideoModal();

    if (musicOn) {
        stopMusic();
    }

    createBurst();
    playCuteChime();

    videoStartTimer = setTimeout(() => {
        videoIntro.classList.add("hide");

        videoRevealTimer = setTimeout(() => {
            videoStage.classList.add("show");
            birthdayVideo.volume = 1;
            const playPromise = birthdayVideo.play();

            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    videoHint.textContent = "Nhấn nút Play trên video để bắt đầu.";
                });
            }
        }, 350);
    }, 3000);
}

function closeModal() {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    resetVideoModal();

    if (musicOn && !musicTimer) {
        startMusic();
    }
}

birthdayVideo.addEventListener("pause", () => {
    if (
        modal.classList.contains("show") &&
        !birthdayVideo.ended &&
        birthdayVideo.currentTime > 0
    ) {
        birthdayVideo.play().catch(() => {});
    }
});

birthdayVideo.addEventListener("ended", () => {
    videoStage.classList.remove("show");
    birthdayVideo.pause();

    setTimeout(() => {
        birthdayCardEnd.classList.add("show");
        createBurst();
        playCuteChime();
    }, 250);
});

birthdayVideo.addEventListener("contextmenu", (event) => {
    event.preventDefault();
});

birthdayVideo.addEventListener("click", (event) => {
    event.preventDefault();
});

openBtn.addEventListener("click", openModal);
closeBtn.addEventListener("click", closeModal);

modal.addEventListener("click", (event) => {
    if (event.target === modal) {
        closeModal();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeModal();
    }
});

function setUnlockedState(unlocked) {
    isUnlocked = unlocked;

    if (unlocked) {
        openBtn.classList.remove("locked");
        openBtn.classList.add("unlocked");
        openBtn.setAttribute("aria-disabled", "false");
        openBtnText.textContent = "Mở video chúc mừng cho Suwa";
        openBtnIcon.textContent = "✦";
        unlockStatus.textContent = OPEN_FOR_TEST
            ? "🔒 Video chúc mừng sẽ mở vào 00:00 • 11/09/2026"
            : "♡ Đã đến ngày đặc biệt — video chúc mừng đã được mở";
        unlockStatus.classList.add("unlocked");

        if (!hasPlayedUnlockEffect) {
            openBtn.classList.add("unlock-pop");
            setTimeout(() => openBtn.classList.remove("unlock-pop"), 750);
            hasPlayedUnlockEffect = true;
        }
    } else {
        openBtn.classList.add("locked");
        openBtn.classList.remove("unlocked");
        openBtn.setAttribute("aria-disabled", "true");
        openBtnText.textContent = "Chưa tới ngày mở video";
        openBtnIcon.textContent = "🔒";
        unlockStatus.textContent = "🔒 Video chúc mừng sẽ mở vào 00:00 • 11/09/2026";
        unlockStatus.classList.remove("unlocked");
    }
}

function updateCountdown() {
    const now = new Date();
    const diff = BIRTHDAY_UNLOCK_TIME - now;
    const unlockedNow = OPEN_FOR_TEST || diff <= 0;
    setUnlockedState(unlockedNow);

    if (diff <= 0) {
        document.getElementById("days").textContent = "00";
        document.getElementById("hours").textContent = "00";
        document.getElementById("minutes").textContent = "00";
        document.getElementById("seconds").textContent = "00";
        return;
    }

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff / 3600000) % 24);
    const minutes = Math.floor((diff / 60000) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    document.getElementById("days").textContent = String(days).padStart(2, "0");
    document.getElementById("hours").textContent = String(hours).padStart(2, "0");
    document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
    document.getElementById("seconds").textContent = String(seconds).padStart(2, "0");
}

setInterval(updateCountdown, 1000);
updateCountdown();

const notes = [
    523.25, 659.25, 783.99, 659.25,
    587.33, 698.46, 880.0, 698.46,
    523.25, 659.25, 783.99, 1046.5
];

function ensureAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playTone(freq, duration = 0.28, volume = 0.035) {
    ensureAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;

    const now = audioCtx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.03);
}

function playCuteChime() {
    ensureAudio();
    [659.25, 783.99, 1046.5].forEach((freq, i) => {
        setTimeout(() => playTone(freq, 0.28, 0.045), i * 110);
    });
}

function startMusic() {
    ensureAudio();

    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }

    let i = 0;
    const tick = () => {
        if (!musicOn) return;
        playTone(notes[i % notes.length], 0.42, 0.025);
        i++;
    };

    tick();
    musicTimer = setInterval(tick, 520);
}

function stopMusic() {
    clearInterval(musicTimer);
    musicTimer = null;
}

soundToggle.addEventListener("click", () => {
    musicOn = !musicOn;

    if (musicOn) {
        soundIcon.textContent = "♫";
        startMusic();
    } else {
        soundIcon.textContent = "♪";
        stopMusic();
    }
});

document.addEventListener("mousemove", (event) => {
    const x = event.clientX / window.innerWidth;
    const y = event.clientY / window.innerHeight;

    document.body.style.background = `
        radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(198,111,255,.18), transparent 28%),
        #0b0d2b
    `;
});

createStars();
createBubbles();
createHearts();
createModalSparkles();
