let data = {};
let currentMode = "overall";

// Rank points
const rankPoints = {
  "LT5": 10, "HT5": 20, "LT4": 30, "HT4": 40,
  "LT3": 50, "HT3": 60, "LT2": 70, "HT2": 80,
  "LT1": 90, "HT1": 100
};

// Fetch data with cache-busting
function fetchData() {
  fetch("data.json?t=" + new Date().getTime())
    .then(res => res.json())
    .then(json => {
      data = json;
      render();
    })
    .catch(err => console.error("Error loading data.json:", err));
}

// Render leaderboard
function render() {
  const tbody = document.getElementById("rows");
  const search = document.getElementById("search").value.toLowerCase();
  tbody.innerHTML = "";

  let list = [];

  if (currentMode === "overall") {
    const scores = {};
    for (const mode in data) {
      data[mode].forEach(p => {
        if (!scores[p.player]) scores[p.player] = { player: p.player, points: 0, badges: [] };
        const pts = rankPoints[p.rank] || 0;
        scores[p.player].points += pts;
        scores[p.player].badges.push({ mode, rank: p.rank, points: pts });
      });
    }
    list = Object.values(scores).sort((a,b) => b.points - a.points);
  } else {
    list = (data[currentMode] || []).map(p => ({
      player: p.player,
      rank: p.rank,
      points: rankPoints[p.rank] || 0
    }));
  }

  list.filter(p => p.player.toLowerCase().includes(search))
      .forEach((p,i) => {
        const tr = document.createElement("tr");
        let rankCell = "";

        if (currentMode === "overall") {
          rankCell = p.badges.map(b => `<span class="badge badge-${b.rank}">${b.mode.toUpperCase()}: ${b.rank}</span>`).join(" ");
        } else {
          rankCell = `<span class="badge badge-${p.rank}">${p.rank}</span>`;
        }

        tr.innerHTML = `
          <td>${i+1}</td>
          <td>${p.player}</td>
          <td>${rankCell}</td>
          <td>${p.points}</td>
        `;
        tbody.appendChild(tr);
      });
}

// Search
document.getElementById("search").addEventListener("input", render);

// Tab switching
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelector(".tab.active").classList.remove("active");
    tab.classList.add("active");
    currentMode = tab.dataset.mode;
    render();
  });
});

// Initial fetch
fetchData();

// Auto-refresh every 30 seconds
setInterval(fetchData, 30000);
