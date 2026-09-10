const state = { odes: [], opening: [], closing: [] };

const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

function paragraph(text) {
  const p = document.createElement("p");
  p.textContent = text;
  return p;
}

function showDialog(room) {
  if (!room) return;

  try {
    if (typeof room.showModal === "function") {
      if (!room.open) room.showModal();
    } else {
      room.setAttribute("open", "");
      room.classList.add("dialog-fallback");
    }
  } catch {
    room.setAttribute("open", "");
    room.classList.add("dialog-fallback");
  }

  document.body.classList.add("modal-open");
  room.scrollTop = 0;
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
  showDialog(room);
}

function closeDialog(dialog) {
  if (!dialog) return;
  if (typeof dialog.close === "function") {
    try {
      dialog.close();
    } catch {
      dialog.removeAttribute("open");
    }
  } else {
    dialog.removeAttribute("open");
  }
  dialog.classList.remove("dialog-fallback");
  if (!document.querySelector("dialog[open]")) {
    document.body.classList.remove("modal-open");
  }
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
  art.tabIndex = 0;
  art.setAttribute("role", "button");
  art.setAttribute("aria-label", `Open ${ode.title}`);
  art.addEventListener("click", () => openOde(ode));
  art.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openOde(ode);
    }
  });
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
    showDialog(document.querySelector("#opening-room"));
  }

  const close = event.target.closest(".close");
  if (close) closeDialog(close.closest("dialog"));
});

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("close", () => {
    if (!document.querySelector("dialog[open]")) {
      document.body.classList.remove("modal-open");
    }
  });

  dialog.addEventListener("click", (event) => {
    const box = dialog.getBoundingClientRect();
    const outside =
      event.clientX < box.left || event.clientX > box.right ||
      event.clientY < box.top || event.clientY > box.bottom;
    if (outside) closeDialog(dialog);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeDialog(document.querySelector("dialog[open]"));
  }
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
