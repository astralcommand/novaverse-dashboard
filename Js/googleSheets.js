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
    const row = json.table.rows[0].c;

    // Build the Dawn data object
    const dawnData = {
        moon: row[1].v,
        energy: row[2].v,
        body: row[3].v,
        focus: row[4].v,
        mood: row[5].v,
        sleep: row[6].v,
        activity: row[7].v,
        duration: row[8].v,
        intention: row[9].v
    };

    updateDashboard(dawnData);

}

function updateDashboard(data) {

    // Orientation
    document.getElementById("moon").textContent = data.moon;
    document.getElementById("intention").textContent = data.intention;

    // Morning Activity
    document.getElementById("activity").textContent = data.activity;
    document.getElementById("duration").textContent = data.duration;

    // Capacity
    updateCapacity("energy", data.energy);
    updateCapacity("body", data.body);
    updateCapacity("focus", data.focus);
    updateCapacity("mood", data.mood);
    updateCapacity("sleep", data.sleep);

}

function updateCapacity(id, value) {

    const lights = document.querySelectorAll(`#${id} .light`);

    lights.forEach((light, index) => {

        if (index < value) {
            light.classList.add("active");
        } else {
            light.classList.remove("active");
        }

    });

}

loadDashboardData();