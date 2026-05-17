// Simple sample data
const sampleEdges = [
    "EPL — Arsenal ML +6.2% (sample)",
    "MLS — LAFC Over 2.5 + BTTS Yes (sample)",
    "Bundesliga — Bayern Over 3.5 (sample)",
    "La Liga — Girona ML +5.1% (sample)",
    "Liga MX — Tigres ML + BTTS No (sample)"
];

const samplePicks = [
    "Captain’s Pick: Arsenal ML & Under 3.5 (sample)",
    "Captain’s Pick: LAFC Over 2.5 (sample)",
    "Captain’s Pick: Bayern -1.5 (sample)",
    "Captain’s Pick: Tigres ML (sample)",
    "Captain’s Pick: Columbus BTTS Yes (sample)"
];

// Tabs
const navItems = document.querySelectorAll(".nav-list li");
const panels = document.querySelectorAll(".panel");

navItems.forEach(item => {
    item.addEventListener("click", () => {
        const target = item.getAttribute("data-target");

        navItems.forEach(n => n.classList.remove("active"));
        item.classList.add("active");

        panels.forEach(panel => {
            panel.classList.toggle("active", panel.id === target);
        });
    });
});

// Sample report button (kept for feel)
document.getElementById("loadSampleReport").addEventListener("click", () => {
    const sampleReport = document.getElementById("sampleReport");
    sampleReport.innerHTML = `
        <p><strong>Top Edge:</strong> Arsenal ML +6.2% (sample)</p>
        <p><strong>Over/Under:</strong> LAFC Over 2.5 (sample)</p>
        <p><strong>Bundesliga:</strong> Bayern Over 3.5 (sample)</p>
        <p><em>More coming soon, Captain Tin...</em></p>
    `;
});

// Live Edges
document.getElementById("refreshEdges").addEventListener("click", () => {
    const list = document.getElementById("liveEdgesList");
    list.innerHTML = "";
    sampleEdges.forEach(edge => {
        const li = document.createElement("li");
        li.textContent = edge;
        list.appendChild(li);
    });
});

// Captain’s Picks
document.getElementById("rollPicks").addEventListener("click", () => {
    const list = document.getElementById("captainPicksList");
    list.innerHTML = "";
    const shuffled = [...samplePicks].sort(() => Math.random() - 0.5).slice(0, 3);
    shuffled.forEach(pick => {
        const li = document.createElement("li");
        li.textContent = pick;
        list.appendChild(li);
    });
});

// Initial fill (optional)
document.getElementById("refreshEdges").click();
document.getElementById("rollPicks").click();
