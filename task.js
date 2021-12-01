const { argv } = require("process");
const fs = require("fs");

const usage = `Usage :-
$ ./task add 2 hello world     # Add a new item with priority 2 and text "hello world" to the list
$ ./task ls                    # Show incomplete priority list items sorted by priority in ascending order
$ ./task del NUMBER   # Delete the incomplete item with the given priority number
$ ./task done NUMBER  # Mark the incomplete item with the given PRIORITY_NUMBER as complete
$ ./task help                  # Show usage
$ ./task report                # Statistics`;

/**
 *
 * Reads "task.txt" file and if there are any pending tasks returns a priority sorted array with objects containing index, task and priority
 * @returns {Object[]} data
 *
 */
const loadData = () => {
    let dataArr;

    try {
        dataArr = fs.readFileSync(`./task.txt`, "utf8");
    } catch (err) {
        console.log("There are no pending tasks!");
    }

    if (dataArr) {
        const data = dataArr.split("\n").filter((e) => e !== "");
        return data
            .map((t, i) => {
                const index = t.indexOf(" ");
                const priority = t.slice(0, index);
                const taskValue = t.slice(index + 1);
                return {
                    index: i + 1,
                    value: taskValue,
                    priority,
                };
            })
            .sort((a, b) => a.priority - b.priority);
    }
};

/**
 *
 * Reads "completed.txt" file and if there are any completed tasks returns an array with objects containing index and task
 * @returns {Object[]} data
 */
const loadCompleted = () => {
    let dataArr;

    try {
        dataArr = fs.readFileSync(`./completed.txt`, "utf8");
    } catch (err) {
        console.log("There are no completed todos!");
    }

    const data = dataArr.split("\n").filter((e) => e !== "");
    return data.map((t, i) => {
        const taskValue = t;
        return {
            index: i + 1,
            value: taskValue,
        };
    });
};

/**
 *
 * Prints usage info
 */
const printHelp = () => console.log(usage);

/**
 * Adds task to "task.txt" file along with priority
 */
const addTask = () => {
    const priority = argv[3];
    const todoText = argv[4];

    try {
        if (todoText || priority) {
            fs.appendFileSync(
                `${__dirname}/task.txt`,
                `${priority} ${todoText}` + "\n"
            );
            console.log(`Added task: "${todoText}" with priority ${priority}`);
        } else {
            console.log("Error: Missing tasks string. Nothing added!");
        }
    } catch (error) {
        console.log("Error:" + error);
    }
};

/**
 * Lists pending tasks in "task.txt" file with proper formatting
 */
const listTasks = () => {
    const tasksData = loadData();

    if (tasksData) {
        tasksData.forEach((t) =>
            console.log(`${t.index}. ${t.value} [${t.priority}]`)
        );
    }
};

/**
 *
 * Deletes task with index
 */
const deleteTask = () => {
    const index = argv[3];
    const tasksData = loadData();

    if (!index) {
        console.log(`Error: Missing NUMBER for deleting tasks.`);
        return;
    }

    if (index > 0 && index <= tasksData.length) {
        tasksData.splice(index - 1, 1);
        const newTasks = tasksData.map((t) => `${t.priority} ${t.value}`);
        fs.writeFileSync(`${__dirname}/task.txt`, newTasks.join("\n"));
        console.log(`Deleted task #${index}`);
    } else {
        console.log(
            `Error: task with index #${index} does not exist. Nothing deleted.`
        );
    }
};

/**
 * Reports pending and completed tasks
 */
const report = () => {
    const pending = loadData();
    const completed = loadCompleted();

    console.log(`Pending : ${pending.length}`);
    pending.map((task) =>
        console.log(`${task.index}. ${task.value} [${task.priority}]`)
    );
    console.log(`\nCompleted : ${completed.length}`);
    completed.map((task) => console.log(`${task.index}. ${task.value}`));
};

/**
 * Removes pending task from "task.txt" and moves it to completed tasks in "completed.txt"
 */
const completedTask = () => {
    const index = argv[3];
    const tasks = loadData("task.txt");

    const completed = tasks.find((task) => task.index === Number(index));

    const new_tasks = tasks
        .filter((task) => task.index !== Number(index))
        .map((task) => {
            const task_s = `${task.priority} ${task.value}`;
            return task_s;
        });
    fs.writeFileSync(`${__dirname}/task.txt`, ``);
    new_tasks.forEach((task) =>
        fs.appendFileSync(`${__dirname}/task.txt`, `${task}\n`)
    );

    if (completed) {
        fs.appendFileSync(`${__dirname}/completed.txt`, `${completed.value}\n`);
        console.log("Marked item as done.");
    } else if (!completed && index) {
        console.log(`Error: no incomplete item with index #${index} exists.`);
    } else if (!index) {
        console.log("Error: Missing NUMBER for marking tasks as done.");
    }
};

switch (argv[2]) {
    case "help":
        printHelp();
        break;
    case "add":
        addTask();
        break;
    case "ls":
        listTasks();
        break;
    case "del":
        deleteTask();
        break;
    case "done":
        completedTask();
        break;
    case "report":
        report();
        break;
    default:
        printHelp();
}