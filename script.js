const itemsPerPage = 50;
const itemsPerRow = 5;


function toggleDetails(card) {
  const details = card.querySelector('.details');

  if (details.style.display === 'block') {
    details.style.display = 'none';
  } else {
    details.style.display = 'block';
  }
}

function showSection(section) {
  document.querySelectorAll(".section").forEach((el) => {
    el.style.display = "none";
  });

  document.getElementById(`${section}Section`).style.display = "block";

  fetchAndRenderData(section);
}

function fetchAndRenderData(apiEndpoint, page = 1, searchTerm = "") {
  const limit = itemsPerPage;
  const offset = (page - 1) * limit;

  fetch(`https://mhw-db.com/${apiEndpoint}?limit=${limit}&offset=${offset}`)
    .then((response) => response.json())
    .then((data) => {
      console.log('Fetched data:', data);
      renderItems(data, apiEndpoint, searchTerm);
    })
    .catch((error) => console.error(`Error fetching ${apiEndpoint}:`, error));
}



function renderItems(itemsData, section, searchTerm) {
  console.log('Render items:', itemsData);
  const sectionContainer = document.getElementById(`${section}Section`);
  sectionContainer.innerHTML = "";

  for (let i = 0; i < itemsData.length; i += itemsPerRow) {
    const row = document.createElement("div");
    row.classList.add("row");

    for (let j = i; j < i + itemsPerRow && j < itemsData.length; j++) {
      const item = itemsData[j];
      const isLargeMonster = section === "monsters" && item.type === "large";
      const isElderDragon = section === "monsters" && item.species === "elder dragon";

      const shouldShowItem = searchTerm
      ? item.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

        if (shouldShowItem) {
          const itemHtml = `
            <div class="card ${isLargeMonster ? 'large-monster' : ''} ${isElderDragon ? 'elder-dragon' : ''}" onclick="toggleDetails(this)">
              <h2>${item.name}</h2>
              <p>Type: ${item.type || "N/A"}</p>
              ${getAdditionalFields(item, section)}
              <div class="details" style="display: none;">
              </div>
            </div>
          `;
          row.innerHTML += itemHtml;
        }
        
        
    }

    sectionContainer.appendChild(row);
  }

  renderPagination(itemsData.length, section, sectionContainer);
}


function filterItems(section, searchTerm) {
  const itemsList = getDisplayedItems(section);
  
  const filteredItems = itemsList.filter((item) => {
    const itemName = item.name && typeof item.name === 'string' ? item.name.toLowerCase() : '';
    return itemName.includes(searchTerm.toLowerCase());
  });

  return filteredItems;
}



function handleSearch() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const currentSection = getCurrentSection();
  const filteredItems = filterItems(currentSection, searchTerm);
  fetchAndRenderData(currentSection, 1, searchTerm); 
}



function handleKeyPress(event) {
  if (event.key === "Enter") {
    handleSearch();
  }
}


function getCurrentSection() {
  const sections = ["ailments", "monsters", "armor", "weapons"];
  for (const section of sections) {
    const sectionElement = document.getElementById(`${section}Section`);
    if (sectionElement.style.display === "block") {
      return section;
    }
  }
  return null;
}

function getDisplayedItems(section) {
  const sectionContainer = document.getElementById(`${section}Section`);
  const cards = sectionContainer.getElementsByClassName("card");
  return Array.from(cards);
}

function getAdditionalFields(item, section) {
  switch (section) {
    case "ailments":
      return `
        <p>Description: ${item.description || "N/A"}</p>
        <p>Recovery Actions: ${item.recovery ? item.recovery.actions : "N/A"}</p>
        <p>Protection Items: ${renderProtectionItems(item.protection)}</p>
      `;
    case "monsters":
      return `
        <p>Species: ${item.species || "N/A"}</p>
        <p>Description: ${item.description || "N/A"}</p>
        <p>Weaknesses: ${renderWeaknesses(item.weaknesses)}</p>
      `;
    case "armor":
      return `     
        <p>Rank: ${item.rank || "N/A"}</p>
        <p>Rarity: ${item.rarity || "N/A"}</p>
        <p>Fire Resistance: ${item.resistances ? renderStars(item.resistances.fire) : "N/A"}</p>
        <p>Water Resistance: ${item.resistances ? renderStars(item.resistances.water) : "N/A"}</p>
        <p>Ice Resistance: ${item.resistances ? renderStars(item.resistances.ice) : "N/A"}</p>
        <p>Thunder Resistance: ${item.resistances ? renderStars(item.resistances.thunder) : "N/A"}</p>
        <p>Dragon Resistance: ${item.resistances ? renderStars(item.resistances.dragon) : "N/A"}</p>
        <p>Armor Set: ${item.armorSet ? item.armorSet.name : "N/A"}</p>
      `;
    case "weapons":
      return `
        <p>Rarity: ${item.rarity || "N/A"}</p>
        <p>Attack: ${item.attack ? item.attack.display : "N/A"}</p>
        <p>Damage Type: ${item.damageType || "N/A"}</p>
      `;
      
    default:
      return "";
  }
}

function renderStars(starsCount) {
  const starSymbol = "⭐️";
  return starsCount > 0 ? starSymbol.repeat(starsCount) : "N/A";
}

      

function renderWeaknesses(weaknesses) {
  return weaknesses
    .map(
      (weakness) => {
        const stars = weakness.stars || 0; 
        const starSymbols = Array.from({ length: stars }, () => "⭐️").join("");

        return `<p>Element: ${weakness.element || "N/A"} ${starSymbols}</p>`;
      }
    )
    .join("");
}


function renderRewards(rewards) {
  return rewards
    .map(
      (reward) => `
        <p>Item: ${reward.name || "N/A"}</p>
        <p>Description: ${reward.description || "N/A"}</p>
        <p>Rarity: ${reward.rarity || "N/A"}</p>
      `
    )
    .join("");
}

function renderProtectionItems(protection) {
  if (protection && protection.items) {
    const itemList = protection.items
      .map(item => `<li>${item.name || "N/A"}</li>`)
      .join("");

    return `<ul>${itemList}</ul>`;
  } else {
    return "N/A";
  }
}


function renderPagination(totalItems, section, container) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginationHtml = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  )
    .map(
      (page) =>
        `<span class="pageLink" onclick="changePage(${page}, '${section}')">${page}</span>`
    )
    .join("");

  container.innerHTML += `<div id="${section}Pagination">${paginationHtml}</div>`;
}
function changePage(page, section) {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  fetchAndRenderData(section, startIndex, endIndex);
}



window.onload = function () {
  showSection("ailments"); 
};


