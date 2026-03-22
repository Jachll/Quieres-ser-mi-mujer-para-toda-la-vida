(() => {
  const scenes = {
    welcome: document.getElementById("welcomeScene"),
    question: document.getElementById("questionScene"),
    final: document.getElementById("finalScene")
  };

  const startBtn = document.getElementById("startBtn");
  const acceptBtn = document.getElementById("acceptBtn");
  const noBtn = document.getElementById("noBtn");
  const noHint = document.getElementById("noHint");
  const cinemaTransition = document.getElementById("cinemaTransition");
  const finalCard = document.querySelector(".final-card");
  const introSunflowerField = document.getElementById("introSunflowerField");
  const sunflowerField = document.getElementById("sunflowerField");
  const particleLayer = document.getElementById("particleLayer");

  const audioToggle = document.getElementById("audioToggle");
  const audioLabel = audioToggle.querySelector(".audio-label");
  const audio = document.getElementById("bgMusic");

  const shyMessages = [
    "Ese botón se puso nervioso al mirarte.",
    "Creo que te quiere invitar a tocar Aceptar.",
    "Dice que contigo solo existe un sí.",
    "No se esconde por miedo, se esconde por amor.",
    "Ese no ya no puede competir con tu sonrisa."
  ];
  const autoplayRetryDelays = [0, 280, 950, 2200];

  let currentScene = "welcome";
  let noAttempts = 0;
  let introStarted = false;
  let finalStarted = false;
  let particleTimer = null;
  let interactionUnlocked = false;
  let musicEnabled = false;

  audio.volume = 0.55;

  const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function randomInt(min, max) {
    return Math.floor(randomBetween(min, max + 1));
  }

  function clamp(min, value, max) {
    return Math.max(min, Math.min(value, max));
  }

  function setAudioButtonState(isPlaying) {
    audioToggle.classList.toggle("is-playing", isPlaying);
    audioToggle.setAttribute("aria-pressed", String(isPlaying));
    audioLabel.textContent = isPlaying ? "Pausar música" : "Activar música";
  }

  async function playAudio() {
    try {
      await audio.play();
      musicEnabled = true;
      setAudioButtonState(true);
    } catch (_error) {
      musicEnabled = false;
      setAudioButtonState(false);
    }
  }

  function tryAutoplayWithRetries() {
    for (const delay of autoplayRetryDelays) {
      window.setTimeout(() => {
        if (!musicEnabled || audio.paused) {
          playAudio();
        }
      }, delay);
    }
  }

  function pauseAudio() {
    audio.pause();
    musicEnabled = false;
    setAudioButtonState(false);
  }

  function unlockAudio() {
    if (interactionUnlocked) {
      return;
    }
    interactionUnlocked = true;
    playAudio();
  }

  function registerGlobalInteractionUnlock() {
    const opts = { once: true };
    window.addEventListener("pointerdown", unlockAudio, opts);
    window.addEventListener("keydown", unlockAudio, opts);
    window.addEventListener("touchstart", unlockAudio, { once: true, passive: true });
  }

  function transitionTo(sceneKey) {
    if (sceneKey === currentScene) {
      return;
    }

    const outgoing = scenes[currentScene];
    const incoming = scenes[sceneKey];

    cinemaTransition.classList.add("play");
    outgoing.classList.add("leaving");

    setTimeout(() => {
      outgoing.classList.remove("active", "leaving");
      incoming.classList.add("active");
      currentScene = sceneKey;

      if (sceneKey === "question") {
        acceptBtn.focus({ preventScroll: true });
      }

      if (sceneKey === "final") {
        startFinalScene();
      }
    }, 430);

    setTimeout(() => {
      cinemaTransition.classList.remove("play");
    }, 1180);
  }

  function animateNoButton() {
    noAttempts += 1;
    noHint.textContent = shyMessages[Math.min(noAttempts - 1, shyMessages.length - 1)];

    noBtn.classList.remove("is-shy");
    void noBtn.offsetWidth;
    noBtn.classList.add("is-shy");

    if (window.innerWidth <= 620 || !hasFinePointer.matches) {
      noBtn.textContent = noAttempts > 2 ? "Me da pena" : "No";
      return;
    }

    const rangeX = Math.min(145, 80 + noAttempts * 12);
    const rangeY = Math.min(62, 30 + noAttempts * 5);

    const dx = randomBetween(-rangeX, rangeX);
    const dy = randomBetween(-rangeY, rangeY);
    const rotation = randomBetween(-8, 8);

    noBtn.style.transform = `translate(${dx.toFixed(0)}px, ${dy.toFixed(0)}px) rotate(${rotation.toFixed(1)}deg)`;

    if (noAttempts > 3) {
      noBtn.textContent = "¿No?";
    }
  }

  function createSunflowers(field, options) {
    if (!field) {
      return;
    }

    const { count, minSize, maxSize, variantClass, xPadding, delayStep } = options;
    const safeCount = Math.max(5, Math.min(10, count));
    const spread = (100 - xPadding * 2) / safeCount;
    const mobileScale = window.innerWidth <= 620 ? 0.78 : 1;
    const tabletScale = window.innerWidth <= 900 ? 0.9 : 1;
    const sizeScale = mobileScale * tabletScale;

    field.textContent = "";
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < safeCount; i += 1) {
      const baseX = xPadding + spread * i + spread * 0.5;
      const xJitter = randomBetween(-1.9, 1.9);
      const size = randomBetween(minSize, maxSize) * sizeScale;
      const delay = 0.14 + i * delayStep + randomBetween(0, 0.22);
      const swayDelay = delay + randomBetween(0.65, 1.2);

      const item = document.createElement("div");
      item.className = `sunflower ${variantClass}`;
      item.style.setProperty("--x", `${Math.min(96, Math.max(4, baseX + xJitter)).toFixed(2)}%`);
      item.style.setProperty("--size", `${size.toFixed(1)}px`);
      item.style.setProperty("--delay", `${delay.toFixed(2)}s`);
      item.style.setProperty("--sway-delay", `${swayDelay.toFixed(2)}s`);

      const sway = document.createElement("div");
      sway.className = "sunflower-sway";
      sway.style.animationDuration = `${randomBetween(5.6, 7.5).toFixed(2)}s`;
      sway.style.animationDirection = Math.random() > 0.5 ? "alternate" : "alternate-reverse";
      sway.innerHTML = `
        <div class="flower-head">
          <div class="petals"></div>
          <div class="core"></div>
        </div>
        <div class="stem"></div>
        <div class="leaf leaf-left"></div>
        <div class="leaf leaf-right"></div>
      `;

      item.appendChild(sway);
      fragment.appendChild(item);
    }

    field.appendChild(fragment);
  }

  function startIntroSunflowers() {
    if (introStarted) {
      return;
    }

    introStarted = true;
    createSunflowers(introSunflowerField, {
      count: randomInt(5, 7),
      minSize: 64,
      maxSize: 88,
      variantClass: "intro",
      xPadding: 8,
      delayStep: 0.15
    });
  }

  function spawnParticle() {
    const particle = document.createElement("span");
    const isHeart = Math.random() < 0.45;

    particle.className = `particle ${isHeart ? "heart" : "spark"}`;

    const size = isHeart ? randomBetween(8, 14) : randomBetween(6, 13);
    particle.style.setProperty("--size", `${size.toFixed(1)}px`);
    particle.style.setProperty("--dur", `${randomBetween(4.5, 8).toFixed(2)}s`);
    particle.style.setProperty("--drift", `${randomBetween(-90, 90).toFixed(0)}px`);
    particle.style.left = `${randomBetween(2, 98).toFixed(2)}%`;

    particleLayer.appendChild(particle);

    setTimeout(() => {
      particle.remove();
    }, 8500);
  }

  function startParticles() {
    if (particleTimer) {
      return;
    }

    for (let i = 0; i < 20; i += 1) {
      setTimeout(spawnParticle, i * 110);
    }

    particleTimer = window.setInterval(spawnParticle, 280);
  }

  function startFinalScene() {
    if (finalStarted) {
      return;
    }

    const safeGap = 26;
    const cardRect = finalCard ? finalCard.getBoundingClientRect() : null;
    const freeSpaceToCard = cardRect
      ? Math.max(150, window.innerHeight - cardRect.bottom - safeGap)
      : Math.max(170, window.innerHeight * 0.3);
    const maxSize = clamp(126, freeSpaceToCard / 1.6, 182);
    const minSize = clamp(102, maxSize - 38, 156);
    const finalCount = window.innerWidth <= 620 ? randomInt(5, 7) : randomInt(7, 9);

    finalStarted = true;
    createSunflowers(sunflowerField, {
      count: finalCount,
      minSize,
      maxSize,
      variantClass: "finale",
      xPadding: 7,
      delayStep: 0.13
    });
    startParticles();
  }

  function handleStart() {
    unlockAudio();
    transitionTo("question");
  }

  function handleAccept() {
    unlockAudio();
    transitionTo("final");
  }

  function handleNo(event) {
    event.preventDefault();
    animateNoButton();
  }

  startBtn.addEventListener("click", handleStart);
  acceptBtn.addEventListener("click", handleAccept);

  noBtn.addEventListener("mouseenter", animateNoButton);
  noBtn.addEventListener("click", handleNo);
  noBtn.addEventListener("touchstart", handleNo, { passive: false });

  audioToggle.addEventListener("click", async () => {
    interactionUnlocked = true;

    if (!musicEnabled || audio.paused) {
      await playAudio();
    } else {
      pauseAudio();
    }
  });

  audio.addEventListener("play", () => {
    musicEnabled = true;
    setAudioButtonState(true);
  });

  audio.addEventListener("pause", () => {
    musicEnabled = false;
    setAudioButtonState(false);
  });

  audio.addEventListener("error", () => {
    audioLabel.textContent = "Audio no disponible";
    audioToggle.disabled = true;
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && (!musicEnabled || audio.paused)) {
      playAudio();
    }
  });

  registerGlobalInteractionUnlock();

  window.addEventListener("load", () => {
    startIntroSunflowers();
    if (scenes.final.classList.contains("active")) {
      startFinalScene();
    }
    tryAutoplayWithRetries();
  });
})();
