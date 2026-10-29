const parts = {
  fins: {
    image: "fins.webp",
    alt: "Close view of the handmade black fins",
    title: "Keeping a direction.",
    text: "The fins help the rocket stay pointed along its flight. They also add mass, so more material is not automatically better.",
  },
  nose: {
    image: "nose.webp",
    alt: "Close view of the taped conical nose",
    title: "Giving the air a path.",
    text: "The conical nose guides the airflow around the front. Its shape was part of my design, but these tests did not measure how much it changed drag.",
  },
  joints: {
    image: "finished-rocket.webp",
    alt: "The finished rocket with visible tape joining its parts",
    title: "Holding it together.",
    text: "Tape keeps the body, nose and fins joined. Secure parts matter, but extra layers add weight and cannot compensate for a leaking pressure seal.",
  },
  support: {
    image: "documentary-poster.webp",
    alt: "Final-test setup from the original recording; the green support is partly obscured by the foreground",
    title: "Straight before release.",
    text: "The green support positions the rocket before launch. It stays on the ground and is excluded from the flying mass. Tilt or contact friction could affect the release.",
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
        "Chapter selected. Press Play in the video controls to watch.";
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
    "The video could not load. Use the download link below to open the film directly.";
});
