const SHEET_ID = "1V6Z-npSHS1-kUwKF7cMN3Xj3Z_AeskTQ986tR0tfL1E";
const GID = "2061341822";

async function loadDashboardData() {

    // Fetch the Google Sheet
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${GID}`;

    const response = await fetch(url);
    const text = await response.text();

    // Google wraps the JSON in a function call, so strip it off
    const json = JSON.parse(
        text.substring(47).slice(0, -2)
    );

    // Get the newest response row
    const rows = json.table.rows;
    const row = rows[rows.length - 1].c;
    const columns = json.table.cols;
    const valueFor = (label) => {
        const index = columns.findIndex((column) => column.label === label);
        const cell = row[index];
        return cell?.f ?? cell?.v ?? "";
    };

    // Build the Dawn data object
    const dawnData = {
        moon: valueFor("Current Moon Phase"),
        dayType: valueFor("What kind of day is it?"),
        mission: valueFor("Today's Mission"),
        nextAction: valueFor("Next Action"),
        futureNovaNotes: valueFor("Notes for Future Nova?")
    };

    updateDashboard(dawnData);

}

function updateDashboard(data) {

    // Orientation
    document.getElementById("moon").textContent = data.moon;
    document.getElementById("intention").textContent = data.dayType;
    document.getElementById("mission").textContent = data.mission;
    document.getElementById("next-action").textContent = data.nextAction;
    document.getElementById("future-nova-notes").textContent = data.futureNovaNotes;

}

loadDashboardData();
setInterval(loadDashboardData, 60000);
