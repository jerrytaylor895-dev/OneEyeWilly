// Always start at top on load
window.addEventListener("load", () => {
  window.scrollTo(0, 0);
});

// Update timestamp
const updatedText = document.getElementById("updatedText");
updatedText.textContent = "Updated: " + new Date().toLocaleString();

// Handle bottom nav tab clicks
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-target");

    // Update active tab styling
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    // Home button → scroll to top
    if (target === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const el = document.getElementById(target);
    if (!el) return;

    // Delay fixes scroll anchoring + MLB lock
    setTimeout(() => {
      const y = el.getBoundingClientRect().top + window.scrollY - 80; // header offset
      window.scrollTo({ top: y, behavior: "smooth" });
    }, 50);
  });
});

// Create team logo
function createLogo(team) {
  const div = document.createElement("div");
  div.className = "team-logo";

  const img = document.createElement("img");
  img.src = `icons/${team}.png`;
  img.onerror = () => (img.style.display = "none");

  div.appendChild(img);
  return div;
}

// Render a single game row
function renderGame(game) {
  const row = document.createElement("div");
  row.className = "game";

  if (game.status === "LIVE") row.classList.add("live");
  if (game.status === "FINAL") row.classList.add("final");

  row.innerHTML = `
    <div class="teams">
      <div class="team-line">
        ${createLogo(game.homeTeam).outerHTML}
        <span class="team-name">${game.homeTeam}</span>
      </div>
      <div class="team-line">
        ${createLogo(game.awayTeam).outerHTML}
        <span class="team-name">${game.awayTeam}</span>
      </div>
    </div>

    <div class="score">
      ${game.homeScore} - ${game.awayScore}
    </div>

    <div class="status ${game.status.toLowerCase()}">
      ${game.status}
    </div>
  `;

  return row;
}

// Render league scoreboard
function renderLeague(containerId, games) {
  const box = document.getElementById(containerId);
  box.innerHTML = "";
  games.forEach(g => box.appendChild(renderGame(g)));
}

// Sample placeholder data
const sampleData = {
  soccer: [
    { homeTeam: "AtlantaUtd", awayTeam: "Nashville", homeScore: 1, awayScore: 1, status: "LIVE" }
  ],
  mlb: [
    { homeTeam: "Yankees", awayTeam: "RedSox", homeScore: 4, awayScore: 3, status: "FINAL" },
    { homeTeam: "Dodgers", awayTeam: "Giants", homeScore: 2, awayScore: 1, status: "LIVE" }
  ],
  nba: [
    { homeTeam: "Lakers", awayTeam: "Warriors", homeScore: 110, awayScore: 108, status: "FINAL" }
  ],
  nhl: [
    { homeTeam: "Rangers", awayTeam: "Bruins", homeScore: 3, awayScore: 2, status: "LIVE" }
  ]
};

// Initial render
renderLeague("soccerGames", sampleData.soccer);
renderLeague("mlbGames", sampleData.mlb);
renderLeague("nbaGames", sampleData.nba);
renderLeague("nhlGames", sampleData.nhl);

// Auto-refresh timestamp every 60s
setInterval(() => {
  updatedText.textContent = "Updated: " + new Date().toLocaleString();
}, 60000);
