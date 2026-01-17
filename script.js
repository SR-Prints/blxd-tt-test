let previousOrder = [];

async function loadLeaderboard() {
  const res = await fetch("data.json");
  const data = await res.json();

  // Populate seasons
  const seasonSelect = document.getElementById("season-select");
  Object.entries(data.seasons).forEach(([key, season]) => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = season.label;
    seasonSelect.appendChild(opt);
  });

  seasonSelect.onchange = () => {
    renderLeaderboard(data.seasons[seasonSelect.value].leaderboard);
  };

  renderLeaderboard(data.seasons[seasonSelect.value].leaderboard);

  // Last updated
  document.getElementById("updated").textContent =
    `Last updated: ${new Date(data.lastUpdated).toLocaleString()}`;
}

function renderLeaderboard(leaderboard) {
  const tbody = document.querySelector("#leaderboard tbody");
  const sorted = leaderboard.slice().sort((a, b) => b.score - a.score);
  tbody.innerHTML = "";

  sorted.forEach((player, index) => {
    const row = document.createElement("tr");

    // Top 3 highlights
    if (index === 0) row.classList.add("gold");
    if (index === 1) row.classList.add("silver");
    if (index === 2) row.classList.add("bronze");

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${player.username}</td>
      <td>${player.score}</td>
    `;

    // Rank change animation
    const prevIndex = previousOrder.indexOf(player.username);
    if (prevIndex !== -1) {
      const diff = prevIndex - index;
      if (diff !== 0) {
        row.style.transform = `translateY(${diff * 10}px)`;
        requestAnimationFrame(() => {
          row.style.transition = "transform 0.3s ease";
          row.style.transform = "translateY(0)";
        });
      }
    }
    previousOrder[index] = player.username;

    // Modal click
    row.addEventListener("click", () => {
      document.getElementById("modal-name").textContent = player.username;
      document.getElementById("modal-rank").textContent = index + 1;
      document.getElementById("modal-score").textContent = player.score;

      // History example
      const historyList = document.getElementById("history-list");
      historyList.innerHTML = "";
      if(player.history){
        player.history.forEach(entry => {
          const li = document.createElement("li");
          li.textContent = `Score: ${entry.score} (${entry.date})`;
          historyList.appendChild(li);
        });
      }

      document.getElementById("player-modal").classList.remove("hidden");
    });

    tbody.appendChild(row);
  });
}

// Modal close
document.getElementById("close-modal").onclick = () => {
  document.getElementById("player-modal").classList.add("hidden");
};
document.getElementById("player-modal").onclick = e => {
  if(e.target.id === "player-modal") e.target.classList.add("hidden");
};

// Tab switching
document.querySelectorAll(".tab").forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll(".tab, .tab-content").forEach(el => el.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
  };
});

// Search + highlight
document.getElementById("search").addEventListener("input", e => {
  const value = e.target.value.toLowerCase();
  document.querySelectorAll("#leaderboard tbody tr").forEach(row => {
    const name = row.children[1].textContent.toLowerCase();
    if(name.includes(value) && value){
      row.classList.add("highlight");
      row.style.display = "";
    } else if(!value){
      row.classList.remove("highlight");
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
});

loadLeaderboard();
