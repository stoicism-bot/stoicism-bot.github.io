const circleElement = document.querySelector(".circle");

const mouse = { x: 0, y: 0 };
const previousMouse = { x: 0, y: 0 };
const circle = { x: 0, y: 0 };

let currentScale = 0;
let currentAngle = 0;

window.addEventListener("mousemove", (e) => {
  mouse.x = e.x;
  mouse.y = e.y;
});

const speed = 0.17;

const tick = () => {
  circle.x += (mouse.x - circle.x) * speed;
  circle.y += (mouse.y - circle.y) * speed;

  const translateTransform = `translate(${circle.x}px, ${circle.y}px)`;

  const deltaMouseX = mouse.x - previousMouse.x;
  const deltaMouseY = mouse.y - previousMouse.y;

  previousMouse.x = mouse.x;
  previousMouse.y = mouse.y;

  const mouseVelocity = Math.min(
    Math.sqrt(deltaMouseX ** 2 + deltaMouseY ** 2) * 4,
    150
  );

  const scaleValue = (mouseVelocity / 150) * 0.5;

  currentScale += (scaleValue - currentScale) * speed;

  const scaleTransform = `scale(${1 + currentScale}, ${1 - currentScale})`;

  const angle = (Math.atan2(deltaMouseY, deltaMouseX) * 180) / Math.PI;

  if (mouseVelocity > 20) {
    currentAngle = angle;
  }

  const rotateTransform = `rotate(${currentAngle}deg)`;

  circleElement.style.transform = `${translateTransform} ${rotateTransform} ${scaleTransform}`;

  window.requestAnimationFrame(tick);
};

tick();

const modeToggle = document.getElementById("modeToggle");
const modeIcon = document.getElementById("modeIcon");
const body = document.body;

function applySystemTheme() {
  const prefersDarkScheme = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  if (prefersDarkScheme) {
    body.classList.add("dark-theme");
    body.classList.remove("light-theme");
    modeIcon.textContent = "light_mode";
  } else {
    body.classList.add("light-theme");
    body.classList.remove("dark-theme");
    modeIcon.textContent = "dark_mode";
  }
}

applySystemTheme();

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", applySystemTheme);

modeToggle.addEventListener("click", () => {
  body.classList.toggle("dark-theme");
  body.classList.toggle("light-theme");
  if (body.classList.contains("dark-theme")) {
    modeIcon.textContent = "light_mode";
  } else {
    modeIcon.textContent = "dark_mode";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const faqItems = document.querySelectorAll(".faq-item");

  function closeItem(item) {
    const answer = item.querySelector(".faq-answer");
    const startHeight = answer.offsetHeight;
    answer.style.height = startHeight + "px";
    answer.offsetHeight; // Force reflow
    answer.style.height = "0px";
    item.classList.remove("active");
  }

  function openItem(item) {
    const answer = item.querySelector(".faq-answer");
    answer.style.height = "auto";
    const startHeight = answer.offsetHeight;
    answer.style.height = "0px";
    answer.offsetHeight; // Force reflow
    answer.style.height = startHeight + "px";
    item.classList.add("active");

    answer.addEventListener("transitionend", function transitionEnd() {
      answer.style.height = "auto";
      answer.removeEventListener("transitionend", transitionEnd);
    });
  }

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");

    question.addEventListener("click", () => {
      const isOpening = !item.classList.contains("active");

      faqItems.forEach((otherItem) => {
        if (otherItem !== item && otherItem.classList.contains("active")) {
          closeItem(otherItem);
        }
      });

      if (isOpening) {
        openItem(item);
      } else {
        closeItem(item);
      }
    });
  });
});
