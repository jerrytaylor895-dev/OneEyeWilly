window.addEventListener("load", () => {
  window.scrollTo(0, 0);
});

window.scrollTo(0, 0);
// Update timestamp
const updatedText = document.getElementById('updatedText');
updatedText.textContent = "Updated: " + new Date().toLocaleString();

// Bottom navigation smooth scroll (GitHub Pages FIXED version) const y = el
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const targetId = btn.getAttribute('data-target');

    if (targetId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const el = document.getElementById(targetId);
    if (!el) return;

   setTimeout(() => {
  const y = el.getBoundingClientRect().top + window.scrollY - 140;
  window.scrollTo({ top: y, behavior: 'smooth' });
}, 50);

    // Create team logo
function createLogo(team) {
  const logoDiv = document.createElement('div');
  logoDiv.className = 'team-logo';

  const logos = team && team.logos;
  if (logos && logos.length && logos[0].href) {
    const img = document.createElement('img');
    img.src = logos[0].href;
    img.alt = team.shortDisplayName || team.displayName || 'Team';
    logoDiv.appendChild(img);
  } else {
    const initials = (team.shortDisplayName || team.displayName || 'T')
      .split(' ')
      .map(w => w[0])
      .join('')
      .slice(0, 3)
      .toUpperCase();
    logoDiv.textContent = initials;
  }
  return logoDiv;
}

// Load scoreboard
async function loadScoreboard(url, targetId) {
  const container = document.getElementById(targetId);
  container.innerHTML = "<div class='status'>Loading…</div>";

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();

    const events = data.events || [];
    if (!events.length) {
      container.innerHTML = '<div class="status">No games today.</div>';
      return;
    }

    container.innerHTML = "";
    events.forEach(ev => {
      const comp = ev.competitions && ev.competitions[0];
      if (!comp) return;

      const competitors = (comp.competitors || []).sort(
        (a, b) => (a.homeAway === "home" ? 1 : -1)
      );
      const status = ev.status && ev.status.type ? ev.status.type : {};
      const shortStatus = status.shortDetail || status.detail || "";
      const state = status.state || "";

      const gameDiv = document.createElement('div');
      gameDiv.className = 'game';
      if (state === "in") gameDiv.classList.add('live');
      if (state === "post") gameDiv.classList.add('final');

      const teamsDiv = document.createElement('div');
      teamsDiv.className = 'teams';

      competitors.forEach(teamObj => {
        const line = document.createElement('div');
        line.className = 'team-line';

        const logo = createLogo(teamObj.team || {});
        const name = document.createElement('span');
        name.className = 'team-name';
        name.textContent = teamObj.team?.shortDisplayName || teamObj.team?.displayName || "Team";

        const score = document.createElement('span');
        score.className = 'score';
        score.textContent = teamObj.score || "";

        line.appendChild(logo);
        line.appendChild(name);
        if (score.textContent) line.appendChild(score);
        teamsDiv.appendChild(line);
      });

      const statusDiv = document.createElement('div');
      statusDiv.className = 'status';
      statusDiv.textContent = shortStatus;
      if (state === "in") statusDiv.classList.add('live');
      if (state === "post") statusDiv.classList.add('final');

      gameDiv.appendChild(teamsDiv);
      gameDiv.appendChild(statusDiv);
      container.appendChild(gameDiv);
    });
  } catch (e) {
    console.error(e);
    container.innerHTML = '<div class="status">Error loading data.</div>';
  }
}

// Load all leagues
function loadAll() {
  loadScoreboard("https://site.api.espn.com/apis/site/v2/sports/soccer/scoreboard", "soccerGames");
  loadScoreboard("https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard", "mlbGames");
  loadScoreboard("https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard", "nbaGames");
  loadScoreboard("https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard", "nhlGames");
}

// Initial load
loadAll();

// Auto-refresh every 60 seconds
setInterval(() => {
  loadAll();
  updatedText.textContent = "Updated: " + new Date().toLocaleString();
}, 60000);
