let currentTab = 'overall';
let leaderboardData = [];

// Tier points mapping
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

function getScore(player,type){
  if(type==='overall'){
    return ['uhc','pot','sword'].reduce((a,k)=>a+getTierPoints(player[k]),0);
  } else return getTierPoints(player[type]);
}

function getRankClass(index){
  if(index===0) return 'rank1';
  if(index===1) return 'rank2';
  if(index===2) return 'rank3';
  return '';
}

// Load JSON
async function loadLeaderboard(){
  const res = await fetch('data.json');
  const data = await res.json();
  leaderboardData = data.leaderboard;
  renderLeaderboard();
}

// Modal
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

// Close modal
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
    if(name.includes(value) && value){ row.classList.add("highlight"); row.style.display=''; }
    else if(!value){ row.classList.remove("highlight"); row.style.display=''; }
    else row.style.display='none';
  });
});

// Render leaderboard
function renderLeaderboard(){
  const tbody = document.querySelector("#leaderboard tbody");
  const thead = document.getElementById("table-head");
  tbody.innerHTML='';

  if(currentTab==='overall'){
    thead.querySelector("#table-header-row").innerHTML = '<th>Rank</th><th>Player</th><th>Score</th>';
    const sorted = leaderboardData.slice().sort((a,b)=>{
      const diff = getScore(b,'overall')-getScore(a,'overall');
      if(diff===0) return a.username.localeCompare(b.username);
      return diff;
    });
    sorted.forEach((p,index)=>{
      const row = document.createElement('tr');
      const badges = ['uhc','pot','sword'].map(k=>{
        if(!p[k]) return '';
        return `<span class="badge ${p[k].toLowerCase()}" title="${getTierPoints(p[k])} pts">${p[k]}</span>`;
      }).join('');
      row.innerHTML = `<td class="${getRankClass(index)}">${index+1}</td><td>${p.username} ${badges}</td><td>${getScore(p,'overall')}</td>`;
      row.addEventListener('click',()=>openPlayerModal(p));
      tbody.appendChild(row);
    });
  } else {
    // Category tabs: dynamic tier columns
    const tiers = ['lt5','lt4','lt3','lt2','lt1','ht1'].reverse();
    thead.querySelector("#table-header-row").innerHTML = '<th>Rank</th><th>Player</th>' + tiers.map(t=>`<th>${t.toUpperCase()}</th>`).join('');
    const sorted = leaderboardData.slice().sort((a,b)=>{
      const diff = getScore(b,currentTab)-getScore(a,currentTab);
      if(diff===0) return a.username.localeCompare(b.username);
      return diff;
    });
    sorted.forEach((p,index)=>{
      const cells = tiers.map(t=>{
        if(!p[currentTab]) return '';
        if(p[currentTab].toLowerCase().endsWith(t.slice(2))) return `<span class="badge ${p[currentTab].toLowerCase()}" title="${getTierPoints(p[currentTab])} pts">${p[currentTab]}</span>`;
        return '';
      }).join('');
      const row = document.createElement('tr');
      row.innerHTML = `<td>${index+1}</td><td>${p.username}</td>${cells}`;
      row.addEventListener('click',()=>openPlayerModal(p));
      tbody.appendChild(row);
    });
  }
}

loadLeaderboard();
