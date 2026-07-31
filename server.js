import { createReadStream, existsSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 10000);
const notionApiKey = process.env.NOTION_API_KEY;
const notionDataSourceId = process.env.NOTION_DATA_SOURCE_ID;

const mimeTypes = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml"
};

function getTitle(page) {
    return page.properties.Title?.title
        .map((part) => part.plain_text)
        .join("") ?? "Untitled task";
}

function getPriorityRank(page) {
    const priority = page.properties["Priority Level"]?.select?.name;
    return {
        "High Priority": 1,
        "Medium Priority": 2,
        "Low Priority": 3,
        "No Priority": 4
    }[priority] ?? 4;
}

function getDate(page) {
    return page.properties.Date?.date?.start ?? "9999-12-31";
}

async function getLaunchTasks() {
    if (!notionApiKey || !notionDataSourceId) {
        throw new Error("Notion environment variables are not configured");
    }

    const response = await fetch(
        `https://api.notion.com/v1/data_sources/${notionDataSourceId}/query`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${notionApiKey}`,
                "Content-Type": "application/json",
                "Notion-Version": "2026-03-11"
            },
            body: JSON.stringify({
                filter: {
                    property: "Checkbox",
                    checkbox: { equals: false }
                },
                page_size: 100
            })
        }
    );

    if (!response.ok) {
        throw new Error(`Notion request failed with ${response.status}`);
    }

    const { results } = await response.json();
    const tasks = results.sort((first, second) =>
        getPriorityRank(first) - getPriorityRank(second) ||
        getDate(first).localeCompare(getDate(second)) ||
        getTitle(first).localeCompare(getTitle(second))
    );

    return {
        remaining: tasks.length,
        next: tasks[0] ? getTitle(tasks[0]) : null
    };
}

function sendJson(response, statusCode, body) {
    response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify(body));
}

const server = createServer(async (request, response) => {
    const requestUrl = new URL(request.url, `http://${request.headers.host}`);

    if (request.method === "GET" && requestUrl.pathname === "/api/health") {
        sendJson(response, 200, { ok: true });
        return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/api/launch-tasks") {
        try {
            sendJson(response, 200, await getLaunchTasks());
        } catch (error) {
            console.error(error);
            sendJson(response, 503, { error: "Launch Tasks are unavailable" });
        }
        return;
    }

    if (request.method !== "GET") {
        sendJson(response, 405, { error: "Method not allowed" });
        return;
    }

    const requestedPath = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
    const filePath = normalize(join(projectRoot, requestedPath));

    if (!filePath.startsWith(projectRoot) || !existsSync(filePath)) {
        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Not found");
        return;
    }

    response.writeHead(200, {
        "Content-Type": mimeTypes[extname(filePath)] ?? "application/octet-stream"
    });
    createReadStream(filePath).pipe(response);
});

server.listen(port, "0.0.0.0", () => {
    console.log(`Dawn dashboard is listening on port ${port}`);
});
