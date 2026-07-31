async function loadLaunchTasks() {

    const taskCount = document.getElementById("activity");
    const nextTask = document.getElementById("next-task");

    try {
        const response = await fetch("/api/launch-tasks");

        if (!response.ok) {
            throw new Error("Launch Tasks request failed");
        }

        const data = await response.json();
        const taskLabel = data.remaining === 1 ? "task remaining" : "tasks remaining";

        taskCount.textContent = `${data.remaining} ${taskLabel}`;
        nextTask.textContent = data.next ?? "You're all clear ✦";
    } catch (error) {
        console.error(error);
        taskCount.textContent = "Tasks unavailable";
        nextTask.textContent = "Check the Notion connection";
    }

}

loadLaunchTasks();
setInterval(loadLaunchTasks, 60000);
