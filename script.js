let currentTab = 'overall';

async function loadLeaderboard() {
  const res = await fetch('data.json');
  const data = await res.json();
  window.leaderboardData = data.leaderboard;
  document.getElementById("updated").textContent =
    `Last updated: ${new Date(data.lastUpdated).toLocaleString()}`;
  renderLeaderboard();
}

function getScore(player, type){
  if(type==='overall'){
    let score = 0;
    ['uhc','pot','sword'].forEach(k=>{
      if(!player[k]) return;
      const t = player[k].toLowerCase();
      if(t.startsWith('ht')) score +=10;
      else if(t==='lt1') score+=9;
      else if(t==='lt2') score+=8;
      else if(t==='lt3') score+=7;
      else if(t==='lt4') score+=6;
      else if(t==='lt5') score+=5;
    });
    return score;
  } else {
    const t = player[type] ? player[type].toLowerCase() : '';
    if(t.startsWith('ht')) return 10;
    else if(t==='lt1') return 9;
    else if(t==='lt2') return 8;
    else if(t==='lt3') return 7;
    else if(t==='lt4') return 6;
    else if(t==='lt5') return 5;
    else return 0;
  }
}

function renderLeaderboard(){
  const tbody = document.querySelector("#leaderboard tbody");
  const type = currentTab;
  const sorted = window.leaderboardData.slice().sort((a,b)=>{
    return getScore(b,type) - getScore(a,type);
  });
  tbody.innerHTML='';

  sorted.forEach((p,index)=>{
    const row = document.createElement('tr');

    const badges = ['uhc','pot','sword'].map(k=>{
      if(!p[k]) return '';
      return `<span class="badge ${p[k].toLowerCase()}">${p[k]}</span>`;
    }).join('');

    row.innerHTML = `<td>${index+1}</td><td>${p.username} ${badges}</td><td>${getScore(p,type)}</td>`;

    row.addEventListener('click',()=>openPlayerModal(p));

    tbody.appendChild(row);
  });
}

function openPlayerModal(player){
  document.getElementById('modal-name').textContent = player.username;
  document.getElementById('modal-discord').textContent = player.discordId ? `Discord: ${player.discordId}` : '';
  ['uhc','pot','sword'].forEach(k=>{
    const el = document.getElementById(`modal-${k}`);
    el.textContent = player[k]||'N/A';
    el.className = `badge ${player[k]?player[k].toLowerCase():''}`;
  });
  document.getElementById('modal-score').textContent = getScore(player,'overall');

  const modal = document.getElementById('player-modal');
  modal.classList.add('show');
}

document.getElementById('close-modal').onclick = ()=> document.getElementById('player-modal').classList.remove('show');
document.getElementById('player-modal').onclick = e=>{if(e.target.id==='player-modal') e.target.classList.remove('show');};

document.querySelectorAll('.leaderboard-tabs .tab').forEach(tab=>{
  tab.onclick = ()=>{
    document.querySelectorAll('.leaderboard-tabs .tab').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    currentTab = tab.dataset.tab;
    renderLeaderboard();
  };
});

document.getElementById("search").addEventListener("input", e=>{
  const value = e.target.value.toLowerCase();
  document.querySelectorAll("#leaderboard tbody tr").forEach(row=>{
    const name = row.children[1].textContent.toLowerCase();
    if(name.includes(value) && value){
      row.classList.add("highlight");
      row.style.display = '';
    } else if(!value){
      row.classList.remove("highlight");
      row.style.display = '';
    } else row.style.display = 'none';
  });
});

loadLeaderboard();
