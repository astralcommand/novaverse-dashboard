console.log("calendar.js loaded");
const API_KEY = "AIzaSyC7_FgnEROwaETyTXxnLxu-YQgJtJa_wDA";

const CALENDARS = {

    work: {

        id: "3688a5490762b87d48d092c08786493b31bcef52a562c501480ec709c334aa55@group.calendar.google.com",

        color: "work"

    },

    events: {

        id: "6c6744cde6319705170862f30364a8fcc241ff82e45ffcf70e63d67a6317cd53@group.calendar.google.com",

        color: "events"

    },

    classes: {

        id: "20cf676d8322af611dc12304029a10fe8aad7e1f61808463ebc3487c9bd05309@group.calendar.google.com",

        color: "classes"

    }

};

async function loadAllCalendars() {

    const today = new Date();

    today.setHours(0,0,0,0);

    const tomorrow = new Date(today);

    tomorrow.setDate(tomorrow.getDate()+1);

    let allEvents = [];

    for (const calendar of Object.values(CALENDARS)) {

        const url =

            `https://www.googleapis.com/calendar/v3/calendars/${

                encodeURIComponent(calendar.id)

            }/events?key=${API_KEY}` +

            `&timeMin=${today.toISOString()}` +

            `&timeMax=${tomorrow.toISOString()}` +

            `&singleEvents=true` +

            `&orderBy=startTime`;

        const response = await fetch(url);

        const data = await response.json();

        if (!data.items) {
            console.error("Calendar failed:", calendar.id, data);
            continue;
        }
        
        const events = data.items.map(event => ({
            ...event,
            calendar: calendar.color
        }));
        
        allEvents.push(...events);

    }

    allEvents.sort((a,b)=>

        new Date(a.start.dateTime || a.start.date) -

        new Date(b.start.dateTime || b.start.date)

    );

    renderAgenda(allEvents);

}

function renderAgenda(events){

    const agenda = document.getElementById("agenda");

    agenda.innerHTML = "";

    if(events.length===0){

        agenda.innerHTML=`

            <div class="agenda-empty">

                ✦ No scheduled commitments today.

            </div>

        `;

        return;

    }

    events.forEach(event=>{

        const start = new Date(event.start.dateTime);

        const end = new Date(event.end.dateTime);

        agenda.innerHTML += `

            <div class="agenda-group">

                <div class="agenda-item ${event.calendar}">

                    ${event.summary}

                </div>

                <div class="agenda-time">

                    ${start.toLocaleTimeString([],{

                        hour:'numeric',

                        minute:'2-digit'

                    })}

                    –

                    ${end.toLocaleTimeString([],{

                        hour:'numeric',

                        minute:'2-digit'

                    })}

                </div>

                <div class="ornament-divider">

                    ──────────── ✦ ────────────

                </div>

            </div>

        `;

    });

}

loadAllCalendars();