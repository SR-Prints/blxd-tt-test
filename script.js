let currentTab = 'overall';

function getTierPoints(tier){
  if(!tier) return 0;
  const t = tier.toLowerCase();
  if(t.startsWith('ht')) return 10;
  if(t==='lt1') return 9;
  if(t==='lt2') return 8;
  if(t==='lt3') return 7;
  if(t==='lt4') return 6;
  if(t==='lt5') return 5;
  return 0;
}

async function loadLeaderboard() {
  const res = await fetch('data.json');
  const data = await res.json();
  window.leaderboardData = data.leaderboard;
  document.getElementById("updated").textContent =
    `Last updated: ${new Date(data.lastUpdated).toLocaleString()}`;
  renderLeaderboard();
}

function getScore(player,type){
  if(type==='overall'){
    return ['uhc','pot','sword'].reduce((a,k)=>a+getTierPoints(player[k]),0);
  } else return getTierPoints(player[type]);
}

// Smooth rank-change: store previous order
let previousOrder = [];

function renderLeaderboard(){
  const tbody = document.querySelector("#leaderboard tbody");
  const type = currentTab;
  const sorted = window.leaderboardData.slice().sort((a,b)=>getScore(b,type)-getScore(a,type));
  const newOrder = sorted.map(p=>p.username);

  tbody.innerHTML='';

  sorted.forEach((p,index)=>{
    const row = document.createElement('tr');

    // Badges with hover tooltip
    const badges = ['uhc','pot','sword'].map(k=>{
      if(!p[k]) return '';
      return `<span class="badge ${p[k].toLowerCase()}" title="${getTierPoints(p[k])} pts">${p[k]}</span>`;
    }).join('');

    row.innerHTML = `<td>${index+1}</td><td>${p.username} ${badges}</td><td>${getScore(p,type)}</td>`;

    // Smooth rank-change animation
    const prevIndex = previousOrder.indexOf(p.username);
    if(prevIndex!==-1){
      const diff = prevIndex - index;
      if(diff!==0){
        row.style.transform = `translateY(${diff*10}px)`;
        requestAnimationFrame(()=>{
          row.style.transition = 'transform 0.3s ease';
          row.style.transform = 'translateY(0)';
        });
      }
    }

    row.addEventListener('click',()=>openPlayerModal(p));
    tbody.appendChild(row);
  });

  previousOrder = newOrder;
}

// Player modal
function openPlayerModal(player){
  document.getElementById('modal-name').textContent = player.username;
  document.getElementById('modal-discord').textContent = player.discordId?`Discord: ${player.discordId}`:'';
  ['uhc','pot','sword'].forEach(k=>{
    const el = document.getElementById(`modal-${k}`);
    el.textContent = player[k]||'N/A';
    el.className = `badge ${player[k]?player[k].toLowerCase():''}`;
    el.title = `${getTierPoints(player[k]||'')} pts`;
  });
  document.getElementById('modal-score').textContent = getScore(player,'overall');

  document.getElementById('player-modal').classList.add('show');
}

document.getElementById('close-modal').onclick = ()=> document.getElementById('player-modal').classList.remove('show');
document.getElementById('player-modal').onclick = e=>{if(e.target.id==='player-modal') e.target.classList.remove('show');};

// Tabs
document.querySelectorAll('.leaderboard-tabs .tab').forEach(tab=>{
  tab.onclick = ()=>{
    document.querySelectorAll('.leaderboard-tabs .tab').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    currentTab = tab.dataset.tab;
    renderLeaderboard();
  };
});

// Search
document.getElementById("search").addEventListener("input", e=>{
  const value = e.target.value.toLowerCase();
  document.querySelectorAll("#leaderboard tbody tr").forEach(row=>{
    const name = row.children[1].textContent.toLowerCase();
    if(name.includes(value) && value){
      row.classList.add("highlight"); row.style.display='';
    } else if(!value){ row.classList.remove("highlight"); row.style.display=''; }
    else row.style.display='none';
  });
});

loadLeaderboard();
