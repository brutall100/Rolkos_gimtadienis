const root = document.documentElement;
const boxes = document.querySelectorAll(".box");
const openAllBtn = document.getElementById("open-all");
const openedEl = document.getElementById("opened");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const canHover = window.matchMedia("(hover: hover)");
const colors = ["#ff4d8d", "#ff7a45", "#20c997", "#3aa0ff", "#7c5cff", "#ffd23f"];

/* ---------- Theme toggle ---------- */
function getStoredTheme() {
  try {
    return localStorage.getItem("theme");
  } catch {
    return null;
  }
}

function setTheme(theme) {
  root.dataset.theme = theme;
  try {
    localStorage.setItem("theme", theme);
  } catch {
    /* storage may be blocked; the toggle still works for this visit */
  }
}

const storedTheme = getStoredTheme();
if (storedTheme) root.dataset.theme = storedTheme;

document.querySelector(".theme-toggle").addEventListener("click", () => {
  const isDark = root.dataset.theme
    ? root.dataset.theme === "dark"
    : window.matchMedia("(prefers-color-scheme: dark)").matches;
  setTheme(isDark ? "light" : "dark");
});

/* ---------- Confetti ---------- */
function burst(x, y) {
  if (reduceMotion.matches) return;

  for (let i = 0; i < 24; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.background = colors[i % colors.length];
    document.body.append(piece);

    const angle = Math.random() * Math.PI * 2;
    const distance = 60 + Math.random() * 120;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance - 60;

    piece
      .animate(
        [
          { transform: `translate(${x}px, ${y}px) rotate(0deg)`, opacity: 1 },
          { transform: `translate(${x + dx}px, ${y + dy + 140}px) rotate(${Math.random() * 720}deg)`, opacity: 0 },
        ],
        { duration: 900 + Math.random() * 500, easing: "cubic-bezier(.2,.7,.4,1)" }
      )
      .finished.then(() => piece.remove());
  }
}

/* ---------- Gifts ---------- */
function updateCounter() {
  const opened = document.querySelectorAll(".box.is-open").length;
  openedEl.textContent = opened;
  openAllBtn.firstChild.textContent = opened === boxes.length ? "Wrap them up " : "Open all gifts ";
  openedEl.classList.remove("bump");
  void openedEl.offsetWidth; // restart the animation
  openedEl.classList.add("bump");
}

function setOpen(box, open) {
  if (box.classList.contains("is-open") === open) return;

  box.classList.toggle("is-open", open);
  box.setAttribute("aria-expanded", String(open));

  if (open) {
    const rect = box.getBoundingClientRect();
    burst(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }
  updateCounter();
}

boxes.forEach((box) => {
  box.addEventListener("click", () => setOpen(box, true));

  // On devices with a mouse, hovering unwraps a gift, like the original card did
  box.addEventListener("mouseenter", () => {
    if (canHover.matches) setOpen(box, true);
  });
});

openAllBtn.addEventListener("click", () => {
  const allOpen = [...boxes].every((box) => box.classList.contains("is-open"));
  boxes.forEach((box, i) => setTimeout(() => setOpen(box, !allOpen), i * 120));
});

