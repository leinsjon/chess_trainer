// Makes the pig on screen jump for joy or wobble when something goes wrong.

export function mood(kind) {
  document.querySelectorAll('.screen.active .mascot, .overlay:not(.hidden) .mascot').forEach((el) => {
    el.classList.remove('happy', 'sad');
    el.getBoundingClientRect();
    el.classList.add(kind);
  });
}

export function confetti() {
  const box = document.createElement('div');
  box.className = 'confetti';
  const bits = ['⭐', '🍎', '💖', '🌟', '🎉'];
  for (let i = 0; i < 24; i++) {
    const s = document.createElement('span');
    s.textContent = bits[i % bits.length];
    s.style.left = Math.random() * 100 + '%';
    s.style.animationDelay = Math.random() * 0.6 + 's';
    s.style.fontSize = 24 + Math.random() * 24 + 'px';
    box.appendChild(s);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 3000);
}
