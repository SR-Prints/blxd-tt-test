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

// Rank classes for top 3
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
  document.querySelectorAll(".player-row").forEach(row=>{
    const name = row.dataset.username.toLowerCase();
    if(name.includes(value) && value){ row.style.display='block'; row.classList.add('highlight'); }
    else if(!value){ row.style.display='block'; row.classList.remove('highlight'); }
    else row.style.display='none';
  });
});

// Render leaderboard
function renderLeaderboard(){
  const columnsDiv = document.getElementById("leaderboard-columns");
  const table = document.getElementById("leaderboard");
  columnsDiv.innerHTML = '';
  table.classList.add('hidden');

  if(currentTab==='overall'){
    table.classList.remove('hidden');
    const tbody = table.querySelector('tbody');
    tbody.innerHTML='';
    const sorted = leaderboardData.slice().sort((a,b)=>{
      const diff = getScore(b,'overall') - getScore(a,'overall');
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
    const tiers = ['lt5','lt4','lt3','lt2','lt1','ht1'].reverse();
    tiers.forEach(t=>{
      const col = document.createElement('div');
      col.className='column';
      const header = document.createElement('div');
      header.className='column-header';
      header.textContent = t.toUpperCase();
      col.appendChild(header);

      const playersInTier = leaderboardData
        .filter(p=>p[currentTab].toLowerCase().startsWith(t.replace('lt','lt').replace('ht','ht')))
        .sort((a,b)=>a.username.localeCompare(b.username));

      playersInTier.forEach((p,index)=>{
        const playerRow = document.createElement('div');
        playerRow.className='player-row '+getRankClass(index);
        playerRow.dataset.username = p.username;
        const badges = `<span class="badge ${p[currentTab].toLowerCase()}" title="${getTierPoints(p[currentTab])} pts">${p[currentTab]}</span>`;
        playerRow.innerHTML = `<div>${p.username}</div>${badges}`;
        playerRow.addEventListener('click',()=>openPlayerModal(p));
        col.appendChild(playerRow);
      });

      columnsDiv.appendChild(col);
    });
  }
}

loadLeaderboard();
