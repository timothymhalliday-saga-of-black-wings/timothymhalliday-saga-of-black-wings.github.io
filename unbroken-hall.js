const state = { odes: [], opening: [], closing: [] };

const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

function paragraph(text) {
  const p = document.createElement("p");
  p.textContent = text;
  return p;
}

function openOde(ode) {
  const room = document.querySelector("#reading-room");
  const art = document.querySelector("#dialog-art");
  art.src = ode.image;
  art.alt = `Illustration for ${ode.title}.`;
  document.querySelector("#dialog-number").textContent = roman[ode.number - 1];
  document.querySelector("#dialog-cup").textContent = ode.cup;
  document.querySelector("#dialog-title").textContent = ode.title;
  document.querySelector("#dialog-dedication").textContent = ode.dedication;
  document.querySelector("#dialog-bard").textContent = ode.bard;
  document.querySelector("#dialog-refrain").textContent = ode.refrain;
  const body = document.querySelector("#dialog-body");
  body.replaceChildren(...ode.body.map(paragraph));
  room.showModal();
  room.scrollTop = 0;
}

function closeDialog(dialog) {
  dialog.close();
}

function makeCup(ode) {
  const article = document.createElement("article");
  article.className = "cup-card";
  article.id = `cup-${ode.slug}`;

  const art = document.createElement("div");
  art.className = "cup-art";
  const image = document.createElement("img");
  image.src = ode.image;
  image.alt = `Illustration for ${ode.title}.`;
  image.loading = ode.number > 2 ? "lazy" : "eager";
  const number = document.createElement("span");
  number.className = "cup-number";
  number.textContent = roman[ode.number - 1];
  art.append(image, number);

  const copy = document.createElement("div");
  copy.className = "cup-copy";
  const cup = document.createElement("p");
  cup.className = "eyebrow";
  cup.textContent = ode.cup;
  const title = document.createElement("h3");
  title.textContent = ode.title;
  const dedication = paragraph(ode.dedication);
  dedication.className = "cup-dedication";
  const refrain = paragraph(ode.refrain);
  refrain.className = "cup-refrain";
  const button = document.createElement("button");
  button.className = "raise";
  button.type = "button";
  button.textContent = "Raise this cup";
  button.addEventListener("click", () => openOde(ode));
  copy.append(cup, title, dedication, refrain, button);

  article.append(art, copy);
  return article;
}

function render(data) {
  Object.assign(state, data);
  const grid = document.querySelector("#cup-grid");
  grid.replaceChildren(...data.odes.map(makeCup));

  const links = document.querySelector("#cup-links");
  data.odes.forEach((ode, index) => {
    const a = document.createElement("a");
    a.href = `#cup-${ode.slug}`;
    a.textContent = roman[index];
    a.setAttribute("aria-label", `Cup ${roman[index]}: ${ode.title}`);
    links.append(a);
  });

  document.querySelector("#opening-text").replaceChildren(
    ...data.opening.slice(2).map(paragraph)
  );
  document.querySelector("#closing-text").replaceChildren(
    ...data.closing.slice(2).map(paragraph)
  );
}

document.addEventListener("click", (event) => {
  const scroll = event.target.closest("[data-scroll]");
  if (scroll) document.querySelector(scroll.dataset.scroll)?.scrollIntoView();

  if (event.target.closest("[data-opening]")) {
    document.querySelector("#opening-room").showModal();
  }

  const close = event.target.closest(".close");
  if (close) closeDialog(close.closest("dialog"));
});

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    const box = dialog.getBoundingClientRect();
    const outside =
      event.clientX < box.left || event.clientX > box.right ||
      event.clientY < box.top || event.clientY > box.bottom;
    if (outside) dialog.close();
  });
});

fetch("unbroken-hall-odes.json")
  .then((response) => {
    if (!response.ok) throw new Error("The odes could not be opened.");
    return response.json();
  })
  .then(render)
  .catch(() => {
    document.querySelector("#cup-grid").textContent =
      "The hall is quiet for the moment. Please return shortly.";
  });

