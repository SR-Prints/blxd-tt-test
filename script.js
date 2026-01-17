let previousOrder = [];

async function loadLeaderboard() {
  const res = await fetch("data.json");
  const data = await res.json();

  renderLeaderboard(data.leaderboard);

  document.getElementById("updated").textContent =
    `Last updated: ${new Date(data.lastUpdated).toLocaleString()}`;
}

function renderLeaderboard(leaderboard) {
  const tbody = document.querySelector("#leaderboard tbody");

  // Calculate total score if needed
  // Assuming leaderboard already has totalScore field
  const sorted = leaderboard.slice().sort((a, b) => b.score - a.score);
  tbody.innerHTML = "";

  sorted.forEach((player, index) => {
    const row = document.createElement("tr");

    // Rank badge based on tier
    let badge = '';
    if(index === 0) badge = '<span class="badge gold">G</span>';
    else if(index === 1) badge = '<span class="badge silver">S</span>';
    else if(index === 2) badge = '<span class="badge bronze">B</span>';

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${player.username} ${badge}</td>
      <td>${player.score}</td>
    `;

    // Rank change animation
    const prevIndex = previousOrder.indexOf(player.username);
    if(prevIndex !== -1) {
      const diff = prevIndex - index;
      if(diff !== 0){
        row.style.transform = `translateY(${diff * 10}px)`;
        requestAnimationFrame(() => {
          row.style.transition = "transform 0.3s ease";
          row.style.transform = "translateY(0)";
        });
      }
    }
    previousOrder[index] = player.username;

    tbody.appendChild(row);
  });
}

// Search highlight
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
