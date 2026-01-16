let data = {};
let currentMode = "overall";

const tierPoints = { S: 4, A: 3, B: 2, C: 1 };

fetch("data.json")
  .then(res => res.json())
  .then(json => { data = json; render(); });

function render() {
  const tbody = document.getElementById("rows");
  const search = document.getElementById("search").value.toLowerCase();
  tbody.innerHTML = "";

  let list = [];

  if (currentMode === "overall") {
    // Sum points across all modes
    const scores = {};
    for (const mode in data) {
      data[mode].forEach(p => {
        if (!scores[p.player]) scores[p.player] = { player: p.player, points: 0, badges: [] };
        scores[p.player].points += tierPoints[p.tier] || 0;
        scores[p.player].badges.push({ mode, tier: p.tier });
      });
    }
    list = Object.values(scores).sort((a,b) => b.points - a.points);
  } else {
    // Single mode
    list = (data[currentMode] || []).map(p => ({
      player: p.player,
      tier: p.tier,
      points: tierPoints[p.tier] || 0
    }));
  }

  list
    .filter(p => p.player.toLowerCase().includes(search))
    .forEach((p, i) => {
      const tr = document.createElement("tr");
      let tierCell = "";

      if (currentMode === "overall") {
        // show badges for overall
        tierCell = p.badges.map(b => `<span class="badge badge-${b.tier}">${b.mode.toUpperCase()}: ${b.tier}</span>`).join(" ");
      } else {
        tierCell = `<span class="tier-${p.tier}">${p.tier}</span>`;
      }

      tr.innerHTML = `
        <td>${i+1}</td>
        <td>${p.player}</td>
        <td>${tierCell}</td>
        <td>${p.points}</td>
      `;
      tbody.appendChild(tr);
    });
}

// Search
document.getElementById("search").addEventListener("input", render);

// Tabs
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelector(".tab.active").classList.remove("active");
    tab.classList.add("active");
    currentMode = tab.dataset.mode;
    render();
  });
});
