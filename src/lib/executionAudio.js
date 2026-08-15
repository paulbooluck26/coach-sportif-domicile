// Un seul moteur audio réutilisé pour tous les bips, plutôt qu'un nouveau
// à chaque appel — beaucoup plus fiable pour des sons déclenchés
// automatiquement (pas par un clic direct), ce que la plupart des
// navigateurs ont tendance à bloquer/retarder sinon.
let sharedCtx = null;
function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!sharedCtx || sharedCtx.state === "closed") {
    sharedCtx = new AudioContextClass();
  }
  if (sharedCtx.state === "suspended") {
    sharedCtx.resume().catch(() => {});
  }
  return sharedCtx;
}

export function playBeep(frequency = 800, duration = 200) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = frequency;
    gain.gain.value = 0.3;
    const now = ctx.currentTime;
    osc.start(now);
    osc.stop(now + duration / 1000);
  } catch (e) {}
  try { navigator.vibrate?.(200); } catch (e) {}
}

export function playDoubleBeep() {
  playBeep(600, 150);
  setTimeout(() => playBeep(900, 200), 250);
}

// Petit bip aigu et court — pour les 3 dernières secondes d'un repos.
export function playCountdownTick() {
  playBeep(1000, 100);
}

// Bip plus long et plus grave, distinct des ticks — signal de reprise
// ("GO !") à la toute fin du décompte, comme sur les vraies applis sportives.
export function playGoSignal() {
  playBeep(500, 450);
}

export function parseTimeFromReps(reps) {
  if (!reps) return 0;
  const minMatch = reps.match(/(\d+)\s*min/i);
  if (minMatch) return parseInt(minMatch[1]) * 60;
  const secMatch = reps.match(/(\d+)\s*s/i);
  if (secMatch) return parseInt(secMatch[1]);
  return 0;
}
