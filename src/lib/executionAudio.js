export function playBeep(frequency = 800, duration = 200) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = frequency;
    gain.gain.value = 0.3;
    osc.start();
    setTimeout(() => { osc.stop(); ctx.close(); }, duration);
  } catch (e) {}
  try { navigator.vibrate?.(200); } catch (e) {}
}

export function playDoubleBeep() {
  playBeep(600, 150);
  setTimeout(() => playBeep(900, 200), 250);
}

export function parseTimeFromReps(reps) {
  if (!reps) return 0;
  const minMatch = reps.match(/(\d+)\s*min/i);
  if (minMatch) return parseInt(minMatch[1]) * 60;
  const secMatch = reps.match(/(\d+)\s*s/i);
  if (secMatch) return parseInt(secMatch[1]);
  return 0;
}