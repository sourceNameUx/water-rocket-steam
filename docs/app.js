const parts = {
  fins: {
    image: "fins.webp",
    alt: "Detalle de las aletas negras hechas a mano",
    title: "Mantener la dirección.",
    text: "Las aletas ayudan a mantener la dirección del cohete. También añaden masa, así que poner más material no siempre mejora el vuelo.",
  },
  nose: {
    image: "nose.webp",
    alt: "Detalle de la punta cónica unida con cinta",
    title: "Facilitar el paso del aire.",
    text: "La punta cónica ayuda a que el aire pase alrededor del frente. La agregué al diseño, pero en estas pruebas no medí cuánto cambió la resistencia del aire.",
  },
  joints: {
    image: "finished-rocket.webp",
    alt: "Cohete terminado con cinta visible en las uniones",
    title: "Mantener las piezas unidas.",
    text: "La cinta une el cuerpo, la punta y las aletas. Las piezas deben quedar firmes, pero más capas añaden peso y no solucionan una fuga en el cierre de la botella.",
  },
  support: {
    image: "documentary-poster.webp",
    alt: "Preparación de la prueba final; el soporte verde está parcialmente oculto en la grabación",
    title: "Colocar el cohete antes de soltarlo.",
    text: "El soporte verde sostiene el cohete antes del lanzamiento y se queda en el suelo, por eso no lo sumo a la masa que vuela. La inclinación o el roce podrían afectar la salida.",
  },
};
const partImage = document.querySelector("#part-image");
const partDescription = document.querySelector("#part-description");
document.querySelectorAll("[data-part]").forEach((button) =>
  button.addEventListener("click", () => {
    const part = parts[button.dataset.part];
    document
      .querySelectorAll("[data-part]")
      .forEach((item) =>
        item.setAttribute("aria-pressed", String(item === button)),
      );
    partImage.src = `assets/${part.image}`;
    partImage.alt = part.alt;
    partDescription.querySelector("h3").textContent = part.title;
    partDescription.querySelector("p").textContent = part.text;
  }),
);

const player = document.querySelector("#documentary-player");
const chapterButtons = [...document.querySelectorAll("[data-time]")];
const status = document.querySelector("#player-status");
chapterButtons.forEach((button) =>
  button.addEventListener("click", async () => {
    const seek = () => {
      player.currentTime = Number(button.dataset.time);
    };
    if (player.readyState >= 1) seek();
    else player.addEventListener("loadedmetadata", seek, { once: true });
    try {
      await player.play();
      status.textContent = "";
    } catch {
      status.textContent =
        "Capítulo seleccionado. Pulsa reproducir en los controles del video para verlo.";
    }
  }),
);
player.addEventListener("timeupdate", () => {
  const current = chapterButtons
    .filter((button) => Number(button.dataset.time) <= player.currentTime)
    .at(-1);
  chapterButtons.forEach((button) =>
    button.setAttribute("aria-current", String(button === current)),
  );
});
player.addEventListener("error", () => {
  status.textContent =
    "No se pudo cargar el video. Usa el enlace de descarga que está debajo para abrirlo directamente.";
});
