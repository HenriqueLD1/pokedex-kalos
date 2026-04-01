const pokedex = document.getElementById("pokedex");
const search = document.getElementById("search");

const selectedType = document.getElementById("selectedType");
const typeList = document.getElementById("typeList");
const dropdown = document.querySelector(".dropdown");

let pokemonList = [];
let filteredList = [];
let currentType = "all";

// ===== FETCH =====
async function fetchPokemon() {
  const promises = [];

  for (let i = 650; i <= 721; i++) {
    promises.push(fetch(`https://pokeapi.co/api/v2/pokemon/${i}`).then(r => r.json()));
  }

  pokemonList = await Promise.all(promises);
  filteredList = pokemonList;

  populateTypes();
  render();
}

// ===== RENDER =====
function render() {
  pokedex.innerHTML = "";

  filteredList.forEach(pokemon => {
    const card = document.createElement("div");
    card.classList.add("card");

    const types = pokemon.types.map(t => t.type.name);

    if (types.length === 1) {
      card.style.background = `var(--${types[0]})`;
    } else {
      card.style.background = `linear-gradient(135deg,var(--${types[0]}),var(--${types[1]}))`;
    }

    const icons = types.map(t => `
      <img src="https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${t}.svg" class="type-icon">
    `).join("");

    card.innerHTML = `
      <span class="poke-id">#${pokemon.id}</span>
      <img src="${pokemon.sprites.front_default}">
      <h3>${capitalize(pokemon.name)}</h3>
      <div class="types">${icons}</div>
    `;

    card.onclick = () => showDetails(pokemon);

    pokedex.appendChild(card);
  });
}

// ===== MODAL =====
async function showDetails(pokemon) {
  const res = await fetch(pokemon.species.url);
  const data = await res.json();

  const desc = data.flavor_text_entries.find(e => e.language.name === "en");

  const stats = pokemon.stats.map(s => `
    <p>${s.stat.name.toUpperCase()}</p>
    <div class="stat-bar">
      <div class="stat-fill" style="width:${s.base_stat/2}%"></div>
    </div>
  `).join("");

  const modal = document.createElement("div");
  modal.classList.add("modal");

  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-btn" onclick="this.parentElement.parentElement.remove()">✖</span>
      <h2>${capitalize(pokemon.name)}</h2>
      <img src="${pokemon.sprites.front_default}">
      ${stats}
      <p>${desc ? desc.flavor_text : ""}</p>
    </div>
  `;

  document.body.appendChild(modal);
}

// ===== DROPDOWN =====
selectedType.onclick = () => {
  dropdown.classList.toggle("active");
};

document.addEventListener("click", e => {
  if (!dropdown.contains(e.target)) {
    dropdown.classList.remove("active");
  }
});

function populateTypes() {
  const types = new Set();

  pokemonList.forEach(p => {
    p.types.forEach(t => types.add(t.type.name));
  });

  createItem("all", "🌐 Todos");

  types.forEach(t => {
    createItem(t, `${getEmoji(t)} ${t}`);
  });
}

function createItem(value, label) {
  const item = document.createElement("div");
  item.classList.add("dropdown-item");
  item.innerHTML = label;

  item.onclick = () => {
    currentType = value;
    selectedType.innerHTML = label;
    dropdown.classList.remove("active");
    applyFilters();
  };

  typeList.appendChild(item);
}

// ===== FILTROS =====
search.addEventListener("input", applyFilters);

function applyFilters() {
  const value = search.value.toLowerCase();

  filteredList = pokemonList.filter(p => {
    return (
      (p.name.includes(value) || String(p.id).includes(value)) &&
      (currentType === "all" || p.types.some(t => t.type.name === currentType))
    );
  });

  render();
}

// ===== UTIL =====
function capitalize(n) {
  return n.charAt(0).toUpperCase() + n.slice(1);
}

function getEmoji(type) {
  return {
    fire:"🔥", water:"💧", grass:"🌿", electric:"⚡",
    ice:"❄️", fighting:"🥊", poison:"☠️", ground:"🌍",
    flying:"🕊️", psychic:"🔮", bug:"🐛", rock:"🪨",
    ghost:"👻", dragon:"🐉", dark:"🌑", steel:"⚙️",
    fairy:"✨", normal:"⚪"
  }[type] || "❔";
}

// ===== INIT =====
fetchPokemon();