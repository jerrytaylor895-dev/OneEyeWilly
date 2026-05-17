// --------------------------------------------------
//  INITIAL SCROLL + TIMESTAMP
// --------------------------------------------------

window.addEventListener("load", () => {
  window.scrollTo(0, 0);
});

const updatedText = document.getElementById("updatedText");
function updateTimestamp() {
  if (updatedText) {
    updatedText.textContent = "Updated: " + new Date().toLocaleString();
  }
}
updateTimestamp();

// --------------------------------------------------
//  THEME SYSTEM
// --------------------------------------------------

const THEME_KEY = "oneeyewilly_theme";

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const btn = document.getElementById("themeToggle");
  if (!btn) return;

  const icon = btn.querySelector(".theme-icon");
  const label = btn.querySelector(".theme-label");

  if (theme === "light") {
    icon.textContent = "☀️";
    label.textContent = "Light";
  } else {
    icon.textContent = "🌙";
    label.textContent = "Dark";
  }
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const theme = saved || (prefersDark ? "dark" : "dark");
  applyTheme(theme);

  const btn = document.getElementById("themeToggle");
  if (btn) {
    btn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      const next = current === "dark" ? "light" : "dark";
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
    });
  }
}

initTheme();

// --------------------------------------------------
//  TEAM COLORS
// --------------------------------------------------

const teamColors = {
  Yankees: "#003087",
  RedSox: "#BD3039",
  Dodgers: "#005A9C",
  Giants: "#FD5A1E",
  Braves: "#CE1141",
  Cubs: "#0E3386",
  Mets: "#002D72",
  Phillies: "#E81828",

  Lakers: "#552583",
  Warriors: "#1D428A",
  Celtics: "#007A33",
  Bucks: "#00471B",
  Heat: "#98002E",
  Knicks: "#F58426",

  Rangers: "#0038A8",
  Bruins: "#FFB81C",
  Blackhawks: "#CF0A2C",
  MapleLeafs: "#00205B",
  Canadiens: "#AF1E2D",

  AtlantaUtd: "#A50034",
  Nashville: "#F5E800",
  LAFC: "#C39E6D",
  Sounders: "#5D9732"
};

// --------------------------------------------------
//  ESPN FETCH HELPERS
// --------------------------------------------------

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

// --------------------------------------------------
//  ESPN‑SAFE mapGame()
// --------------------------------------------------

function mapGame(ev) {
  const c = ev?.competitions?.[0];
  if (!c) return null;

  const home = c.competitors?.find(t => t.homeAway === "home");
  const away = c.competitors?.find(t => t.homeAway === "away");
  if (!home || !away) return null;

  const rawStatus =
    c.status?.type?.shortName ||
    c.status?.type?.name ||
    c.status?.type?.state ||
    "TBD";

  const status = String(rawStatus).toUpperCase();

  const isLive = c.status?.type?.state === "in";
  const isFinal = status === "FINAL";

  return {
    homeTeam: home.team?.shortDisplayName?.replace(/\s+/g, "") || "Home",
    awayTeam: away.team?.shortDisplayName?.replace(/\s+/g, "") || "Away",
    homeScore: home.score ?? 0,
    awayScore: away.score ?? 0,
    status,
    isLive,
    isFinal
  };
}

// --------------------------------------------------
//  LEAGUE LOADERS
// --------------------------------------------------

async function loadSoccer() {
  const events = await fetchESPN("soccer/usa.1");
  return events.map(mapGame).filter(Boolean);
}

async function loadMLB() {
  const events = await fetchESPN("baseball/mlb");
  return events.map(mapGame).filter(Boolean);
}

async function loadNBA() {
  const events = await fetchESPN("basketball/nba");
  return events.map(mapGame).filter(Boolean);
}

async function loadNHL() {
  const events = await fetchESPN("hockey/nhl");
  return events.map(mapGame).filter(Boolean);
}

// --------------------------------------------------
//  RENDERING + ANIMATIONS (NO‑LOGO MODE)
// --------------------------------------------------

function animateRow(row) {
  row.classList.add("game-animate-in");
  setTimeout(() => row.classList.remove("game-animate-in"), 400);
}

function renderGame(game) {
  const row = document.createElement("div");
  row.className = "game";

  if (game.isLive) row.classList.add("live");
  if (game.isFinal) row.classList.add("final");

  const color = teamColors[game.homeTeam] || teamColors[game.awayTeam] || "#3ea6ff";
  row.style.borderLeft = `4px solid ${color}`;

  row.innerHTML = `
    <div class="teams">
      <div class="team-line">
        <span class="team-name">${game.homeTeam}</span>
      </div>
      <div class="team-line">
        <span class="team-name">${game.awayTeam}</span>
      </div>
    </div>

    <div class="score">${game.homeScore} - ${game.awayScore}</div>

    <div class="status ${game.isLive ? "live" : game.isFinal ? "final" : ""}">
      ${game.status}
    </div>
  `;

  animateRow(row);
  return row;
}

// --------------------------------------------------
//  LEAGUE‑SPECIFIC FALLBACK SYSTEM
// --------------------------------------------------

function renderLeague(containerId, games) {
  const box = document.getElementById(containerId);
  if (!box) return;

  box.classList.add("games-fade-out");

  setTimeout(() => {
    box.classList.remove("games-fade-out");
    box.innerHTML = "";

    let fallbackMessage = "No games available";

    switch (containerId) {
      case "mlbGames":
        fallbackMessage = "No MLB games today";
        break;
      case "nbaGames":
        fallbackMessage = "No NBA games today";
        break;
      case "nhlGames":
        fallbackMessage = "No NHL games today";
        break;
      case "soccerGames":
        fallbackMessage = "No MLS matches today";
        break;
    }

    if (!games || games.length === 0) {
      const msg = document.createElement("div");
      msg.className = "no-games";
      msg.textContent = fallbackMessage;
      box.appendChild(msg);
      return;
    }

    games.forEach(g => box.appendChild(renderGame(g)));
  }, 120);
}

// --------------------------------------------------
//  SAVED PICKS
// --------------------------------------------------

const PICKS_KEY = "oneeyewilly_picks";

function loadSavedPicks() {
  try {
    const raw = localStorage.getItem(PICKS_KEY);
    if (!raw) return ["ATL Utd ML", "Dodgers -1.5", "Rangers Over 5.5"];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return ["ATL Utd ML", "Dodgers -1.5", "Rangers Over 5.5"];
    }
    return parsed;
  } catch {
    return ["ATL Utd ML", "Dodgers -1.5", "Rangers Over 5.5"];
  }
}

function savePicks(picks) {
  localStorage.setItem(PICKS_KEY, JSON.stringify(picks));
}

function renderPicks() {
  const picksList = document.getElementById("picksList");
  if (!picksList) return;

  const picks = loadSavedPicks();
  picksList.innerHTML = "";

  picks.forEach((text, index) => {
    const row = document.createElement("div");
    row.className = "pick-row";
    row.textContent = text;

    row.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "text";
      input.className = "pick-input";
      input.value = text;
      row.replaceWith(input);
      input.focus();
      input.select();

      const commit = () => {
        const newVal = input.value.trim() || text;
        const all = loadSavedPicks();
        all[index] = newVal;
        savePicks(all);
        renderPicks();
      };

      input.addEventListener("blur", commit);
      input.addEventListener("keydown", e => {
        if (e.key === "Enter") input.blur();
        if (e.key === "Escape") renderPicks();
      });
    });

    picksList.appendChild(row);
  });
}

// --------------------------------------------------
//  LOAD ALL LEAGUES
// --------------------------------------------------

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

  const firstLive = document.querySelector(".game.live");
  if (firstLive) {
    setTimeout(() => {
      const y = firstLive.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }, 200);
  }
}

loadAll();
renderPicks();
setInterval(loadAll, 60000);

// --------------------------------------------------
//  NAVIGATION SCROLL
// --------------------------------------------------

document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-target");

    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    btn.classList.add("nav-press");
    setTimeout(() => btn.classList.remove("nav-press"), 150);

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
