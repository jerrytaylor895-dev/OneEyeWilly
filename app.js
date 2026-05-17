// Always start at top on load
window.addEventListener("load", () => {
  window.scrollTo(0, 0);
});

// Update timestamp
const updatedText = document.getElementById("updatedText");
function updateTimestamp() {
  updatedText.textContent = "Updated: " + new Date().toLocaleString();
}
updateTimestamp();

// -------------------------------
//  ESPN FETCH HELPERS
// -------------------------------

// Generic ESPN fetcher
async function fetchESPN(path) {
  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/${path}/scoreboard`;
    const res = await fetch(url);
    const data = await res.json();
    return data.events || [];
  } catch (err) {
    console.error("ESPN fetch error:", err);
    return [];
  }
}

// Map ESPN event → clean game object
function mapGame(ev) {
  const c = ev.competitions[0];
  const home = c.competitors.find(t => t.homeAway === "home");
  const away = c.competitors.find(t => t.homeAway === "away");

  return {
    homeTeam: home.team.shortDisplayName.replace(/\s+/g, ""),
    awayTeam: away.team.shortDisplayName.replace(/\s+/g, ""),
    homeScore: home.score || 0,
    awayScore: away.score || 0,
    status: c.status.type.shortName.toUpperCase(), // LIVE / FINAL / etc.
    isLive: c.status.type.state === "in"
  };
}

// -------------------------------
//  LEAGUE LOADERS
// -------------------------------

async function loadSoccer() {
  const events = await fetchESPN("soccer/usa.1");
  return events.map(mapGame);
}

async function loadMLB() {
  const events = await fetchESPN("baseball/mlb");
  return events.map(mapGame);
}

async function loadNBA() {
  const events = await fetchESPN("basketball/nba");
  return events.map(mapGame);
}

async function loadNHL() {
  const events = await fetchESPN("hockey/nhl");
  return events.map(mapGame);
}

// -------------------------------
//  RENDERING
// -------------------------------

function createLogo(team) {
  const div = document.createElement("div");
  div.className = "team-logo";

  const img = document.createElement("img");
  img.src = `icons/${team}.png`;
  img.onerror = () => (img.style.display = "none");

  div.appendChild(img);
  return div;
}

function renderGame(game) {
  const row = document.createElement("div");
  row.className = "game";

  if (game.isLive) row.classList.add("live");
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

    <div class="score">${game.homeScore} - ${game.awayScore}</div>

    <div class="status ${game.status.toLowerCase()}">${game.status}</div>
  `;

  return row;
}

function renderLeague(containerId, games) {
  const box = document.getElementById(containerId);
  box.innerHTML = "";
  games.forEach(g => box.appendChild(renderGame(g)));
}

// -------------------------------
//  LOAD ALL LEAGUES
// -------------------------------

async function loadAll() {
  updateTimestamp();

  const [soccer, mlb, nba, nhl] = await Promise.all([
    loadSoccer(),
    loadMLB(),
    loadNBA(),
    loadNHL()
  ]);

  renderLeague("soccerGames", soccer);
  renderLeague("mlbGames", mlb);
  renderLeague("nbaGames", nba);
  renderLeague("nhlGames", nhl);
}

// Initial load
loadAll();

// Auto-refresh every 60 seconds
setInterval(loadAll, 60000);

// -------------------------------
//  TAB SCROLLING
// -------------------------------

document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-target");

    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    if (target === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const el = document.getElementById(target);
    if (!el) return;

    setTimeout(() => {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }, 50);
  });
});
