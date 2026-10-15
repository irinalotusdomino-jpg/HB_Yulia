// Общие функции для всех страниц

// Плавный уход со страницы при переходе по кнопке «Далее»
document.addEventListener("click", function (e) {
  var a = e.target.closest("a[data-next]");
  if (!a) return;
  e.preventDefault();
  var href = a.getAttribute("href");
  document.body.classList.add("leaving");
  setTimeout(function () { window.location.href = href; }, 420);
});

// Фоновые сердечки
(function () {
  var holder = document.querySelector(".bg-sparks");
  if (!holder) return;
  var icons = ["💖", "✨", "🎈", "🌸", "💫", "🎉"];
  for (var i = 0; i < 16; i++) {
    var s = document.createElement("span");
    s.textContent = icons[i % icons.length];
    s.style.left = Math.random() * 100 + "%";
    s.style.fontSize = 16 + Math.random() * 22 + "px";
    s.style.animationDuration = 9 + Math.random() * 10 + "s";
    s.style.animationDelay = -Math.random() * 15 + "s";
    holder.appendChild(s);
  }
})();

// Конфетти
window.launchConfetti = function (count) {
  var box = document.createElement("div");
  box.className = "confetti";
  document.body.appendChild(box);
  var colors = ["#ffd166", "#ff6fa5", "#7be0ff", "#b388ff", "#8aff9c", "#fff"];
  for (var i = 0; i < (count || 90); i++) {
    var c = document.createElement("i");
    c.style.left = Math.random() * 100 + "%";
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    c.style.animationDuration = 2.5 + Math.random() * 3 + "s";
    c.style.animationDelay = Math.random() * 1.2 + "s";
    box.appendChild(c);
  }
  setTimeout(function () { box.remove(); }, 8000);
};
