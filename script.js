let data = {};
let currentMode = "overall";

const rankPoints = {
  "LT5": 10, "HT5": 20, "LT4": 30, "HT4": 40,
  "LT3": 50, "HT3": 60, "LT2": 70, "HT2": 80,
  "LT1": 90, "HT1": 100
};

// Modal elements
const modal = document.getElementById("playerModal");
const modalName = document.getElementById("modalName");
const modalDiscord = document.getElementById("modalDiscord");
const modalRanks = document.getElementById("modalRanks");
const closeBtn = document.querySelector(".close");

// Close modal
closeBtn.onclick = () => modal.style.display = "none";
window.onclick = e => { if(e.target==modal) modal.style.display="none"; };

// Fetch JSON with cache-busting
function fetchData() {
  fetch("data.json?t=" + new Date().getTime())
    .then(res => res.json())
    .then(json => { data = json; render(); })
    .catch(err => console.error(err));
}

// Render leaderboard
function render() {
  const tbody = document.getElementById("rows");
  const search = document.getElementById("search").value.toLowerCase();
  tbody.innerHTML = "";

  let list = [];
  if(currentMode==="overall"){
    const scores={};
    for(const mode in data){
      data[mode].forEach(p=>{
        if(!scores[p.player]) scores[p.player]={player:p.player, points:0, badges:[], discord:p.discord||null};
        const pts = rankPoints[p.rank]||0;
        scores[p.player].points+=pts;
        scores[p.player].badges.push({mode, rank:p.rank, points:pts});
      });
    }
    list = Object.values(scores).sort((a,b)=>b.points-a.points);
  } else {
    list = (data[currentMode]||[]).map(p=>({player:p.player, rank:p.rank, points:rankPoints[p.rank]||0, discord:p.discord||null}));
  }

  list.filter(p=>p.player.toLowerCase().includes(search)).forEach((p,i)=>{
    const tr = document.createElement("tr");

    let rankCell = currentMode==="overall" ? 
      p.badges.map(b=>`<span class="badge badge-${b.rank}">${b.mode.toUpperCase()}: ${b.rank}</span>`).join(" ")
      : `<span class="badge badge-${p.rank}">${p.rank}</span>`;

    tr.innerHTML = `
      <td>${i+1}</td>
      <td class="player-name" data-player='${JSON.stringify(p)}'>${p.player}</td>
      <td>${rankCell}</td>
      <td>${p.points}</td>
    `;
    tbody.appendChild(tr);
  });

  // Add click event for popup modal
  document.querySelectorAll(".player-name").forEach(el=>{
    el.onclick = ()=>{
      const p = JSON.parse(el.dataset.player);
      modalName.textContent = p.player;
      modalDiscord.innerHTML = p.discord ? `Discord: <a href="https://discord.com/users/${p.discord}" target="_blank">@${p.discord}</a>` : "";
      if(currentMode==="overall"){
        modalRanks.innerHTML = p.badges.map(b=>`${b.mode.toUpperCase()}: ${b.rank} (${b.points} pts)`).join("<br>");
      } else {
        modalRanks.innerHTML = `${currentMode.toUpperCase()}: ${p.rank} (${p.points} pts)`;
      }
      modal.style.display = "block";
    };
  });
}

// Search input
document.getElementById("search").addEventListener("input", render);

// Tabs
document.querySelectorAll(".tab").forEach(tab=>{
  tab.addEventListener("click", ()=>{
    document.querySelector(".tab.active").classList.remove("active");
    tab.classList.add("active");
    currentMode = tab.dataset.mode;
    render();
  });
});

// Initial fetch
fetchData();
setInterval(fetchData, 30000);
