import './demo.css';
import { AsciiDeconstructor } from '../src/index';

const canvas = document.getElementById('stage') as HTMLCanvasElement;
const slider = document.getElementById('progress-slider') as HTMLInputElement;
const progressValue = document.getElementById('progress-value') as HTMLOutputElement;
const stageBadge = document.getElementById('stage-badge') as HTMLSpanElement;
const mediaLabel = document.getElementById('media-label') as HTMLSpanElement;
const fileInput = document.getElementById('file-input') as HTMLInputElement;
const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;
const autoBtn = document.getElementById('auto-btn') as HTMLButtonElement;
const stageButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('.stage-btn'));

const engine = new AsciiDeconstructor(canvas, {}, (telemetry) => {
  const code = String(telemetry.stageIndex + 1).padStart(2, '0');
  stageBadge.textContent = `${code} · ${telemetry.stageName}`;
  mediaLabel.textContent = telemetry.mediaLabel;

  stageButtons.forEach((btn, idx) => {
    btn.classList.toggle('is-active', idx === telemetry.stageIndex);
  });
});

engine.start();

function applyProgress(value: number): void {
  const clamped = Math.max(0, Math.min(1, value));
  slider.value = clamped.toFixed(3);
  progressValue.textContent = clamped.toFixed(2);
  engine.setProgress(clamped);
}

applyProgress(parseFloat(slider.value));

slider.addEventListener('input', () => {
  stopAutoSweep();
  applyProgress(parseFloat(slider.value));
});

stageButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    stopAutoSweep();
    const target = parseFloat(btn.dataset.progress || '0');
    applyProgress(target);
  });
});

fileInput.addEventListener('change', () => {
  const file = fileInput.files?.[0];
  if (file) {
    engine.loadCustomFile(file);
  }
  fileInput.value = '';
});

resetBtn.addEventListener('click', () => {
  engine.resetToDefaultMedia();
});

window.addEventListener('dragover', (e) => {
  e.preventDefault();
});

window.addEventListener('drop', (e) => {
  e.preventDefault();
  const file = e.dataTransfer?.files?.[0];
  if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
    engine.loadCustomFile(file);
  }
});

let autoSweepId = 0;
let sweepStart = 0;

function stopAutoSweep(): void {
  if (autoSweepId) {
    cancelAnimationFrame(autoSweepId);
    autoSweepId = 0;
    autoBtn.setAttribute('aria-pressed', 'false');
  }
}

autoBtn.addEventListener('click', () => {
  if (autoSweepId) {
    stopAutoSweep();
    return;
  }
  autoBtn.setAttribute('aria-pressed', 'true');
  sweepStart = performance.now();

  const step = (now: number) => {
    const elapsed = (now - sweepStart) * 0.00018;
    const wave = 0.5 - 0.5 * Math.cos(elapsed * Math.PI * 2);
    applyProgress(wave);
    autoSweepId = requestAnimationFrame(step);
  };
  autoSweepId = requestAnimationFrame(step);
});
