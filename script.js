let players = [];

fetch("data.json")
  .then(res => res.json())
  .then(data => {
    players = data;
    render(players);
  });

function render(list) {
  const tbody = document.getElementById("rows");
  tbody.innerHTML = "";

  list.forEach((p, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${p.player}</td>
      <td class="tier-${p.tier}">${p.tier}</td>
    `;
    tbody.appendChild(tr);
  });
}

document.getElementById("search").addEventListener("input", e => {
  const q = e.target.value.toLowerCase();
  render(players.filter(p =>
    p.player.toLowerCase().includes(q)
  ));
});
