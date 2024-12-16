#!/usr/bin/env node

import fs from "node:fs";
import path, { dirname } from "node:path";
import { Console } from "node:console";
import { Transform } from "node:stream";
import * as readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";
import { fileURLToPath } from "node:url";

const parseArguments = () => {
  // remove the first two args because they are node and the filename
  const args = process.argv.slice(2); // the arguments after the filename
  // the first command or argument
  const arg = args[0];

  handleCommands(args, arg);
};

const handleCommands = (args, arg) => {
  let taskDescription;
  let id;
  let ids;

  switch (arg) {
    case "add":
    case "-a":
      // you only need -a (args[0]) and "description" (args[1]) for it to work
      if (args.length > 2) {
        console.log(
          `Invalid command. Usage: task-cli add "description" (use task-cli -h for help)`,
        );
        break;
      }

      taskDescription = args[1];
      if (!taskDescription) {
        console.log("Provide a description of the task.");
        break;
      }

      addTask(taskDescription);
      break;
    case "list":
    case "-l":
      listTasks();
      break;
    case "list-all":
    case "-la":
      listAllTasks();
      break;
    case "update":
    case "-u":
      // you only need -u (args[0]) and "description" (args[1]) for it to work
      if (args.length > 3) {
        console.log(
          'Invalid command. Usage: task-cli update {id} "description" (use task-cli -h for help)',
        );
        break;
      }

      id = args[1];
      if (!id) {
        console.log("Please provide a id for the task.");
        break;
      }

      taskDescription = args[2];
      if (!taskDescription) {
        console.log("Please provide a description for the task.");
        break;
      }

      updateTask(id, taskDescription);
      break;
    case "delete":
    case "-d":
      // get every ids after the command -d
      ids = args.slice(1);
      if (!ids) {
        console.log("Please provide a id for the task.");
        break;
      }

      deleteTasks(ids);
      break;
    case "delete-all":
    case "-da":
      deleteAllTasks();
      break;
    case "mark-todo":
    case "-mt":
      ids = args.slice(1);
      if (!ids) {
        console.log("Please provide a id for the task.");
        break;
      }
      updateStatus(ids, "todo");
      break;
    case "mark-in-progress":
    case "-mp":
      ids = args.slice(1);
      if (!ids) {
        console.log("Please provide a id for the task.");
        break;
      }
      updateStatus(ids, "in-progress");
      break;
    case "mark-completed":
    case "-mc":
      ids = args.slice(1);
      if (!ids) {
        console.log("Please provide a id for the task.");
        break;
      }
      updateStatus(ids, "completed");
      break;
    case "-h":
      helpMenu();
      break;
    default:
      console.log(
        // "\x1b[31m%s\x1b[0m" colors the text "error:" red but not the other line
        "\x1b[31m%s\x1b[0m",
        "error:",
        "Unknown command (use task-cli -h for help)",
      );
      break;
  }
};

const helpMenu = () => {
  console.log("\x1b[1m\x1b[36mCommands and Options:\x1b[0m\n");

  console.log(
    '\x1b[32mTip: Use "task-cli" or "t" instead of "node index".\x1b[0m\n',
  );

  console.log('\x1b[34m  -a, --add "Task Description"\x1b[0m');
  console.log(
    "\x1b[33m    Add a new task with the specified description.\x1b[0m\n",
  );

  console.log("\x1b[34m  -l, --list\x1b[0m");
  console.log(
    "\x1b[33m    List tasks without created and updated columns.\x1b[0m\n",
  );

  console.log("\x1b[34m  -la, --list-all\x1b[0m");
  console.log(
    "\x1b[33m    List tasks, including created and updated columns.\x1b[0m\n",
  );

  console.log('\x1b[34m  -u, --update (id) "Updated Task Description"\x1b[0m');
  console.log(
    "\x1b[33m    Update a task by specifying its ID and new description.\x1b[0m\n",
  );

  console.log("\x1b[34m  -d, --delete (id) | (1 2...)\x1b[0m");
  console.log("\x1b[33m    Delete one or more tasks by their IDs.\x1b[0m\n");

  console.log("\x1b[34m  -da, --delete-all\x1b[0m");
  console.log("\x1b[33m    Delete all tasks.\x1b[0m\n");

  console.log("\x1b[34m  -mt, --mark-todo (id) (1 2...)\x1b[0m");
  console.log(
    '\x1b[33m    Mark one or more tasks as "todo" by their IDs.\x1b[0m\n',
  );

  console.log("\x1b[34m  -mp, --mark-in-progress (id) (1 2...)\x1b[0m");
  console.log(
    '\x1b[33m    Mark one or more tasks as "in-progress" by their IDs.\x1b[0m\n',
  );

  console.log("\x1b[34m  -mc, --mark-completed (id) (1 2...)\x1b[0m");
  console.log(
    '\x1b[33m    Mark one or more task as "completed" by their IDs.\x1b[0m\n',
  );
};

// url of the current dir
const __dirname = dirname(fileURLToPath(import.meta.url));
const tasksFilePath = path.join(__dirname, "tasks.json");
let tasks;

if (fs.existsSync(tasksFilePath)) {
  tasks = JSON.parse(fs.readFileSync(tasksFilePath, "utf-8"));
} else {
  tasks = fs.writeFileSync(tasksFilePath, JSON.stringify([]));
}

const addTask = (description) => {
  const terminalWidth = process.stdout.columns || 80;
  // make the description not go over the terimal wdith, -27 is the other
  // columns id and status
  if (description.length >= terminalWidth - 27) {
    console.log("Sorry, the description you provided is too long.");
    return;
  }

  const task = {
    // if the array is not empty,
    // get the last task's id using the array's last index (length - 1).
    // else, start with id 1.
    id: tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 1,
    description,
    status: "todo",
    created: new Date().toLocaleDateString(),
    updated: new Date().toLocaleDateString(),
  };
  tasks.push(task);
  saveTasks();
  console.log(
    // green
    "\x1b[32m%s\x1b[0m",
    `Task added successfully (ID: ${task.id})`,
  );
};

// idk what this does too but
// it gives us a custom nicely formatted table
// the reason for using this instead of console.table() is
// console.table() has index column that you can't remove
// https://stackoverflow.com/questions/49618069/remove-index-from-console-table
const table = (input) => {
  const ts = new Transform({
    transform(chunk, enc, cb) {
      cb(null, chunk);
    },
  });

  const logger = new Console({ stdout: ts });
  logger.table(input);
  const table = (ts.read() || "").toString();
  let result = "";
  for (let row of table.split(/[\r\n]+/)) {
    let r = row.replace(/[^┬]*┬/, "┌");
    r = r.replace(/^├─*┼/, "├");
    r = r.replace(/│[^│]*/, "");
    r = r.replace(/^└─*┴/, "└");
    r = r.replace(/'/g, " ");
    result += `${r}\n`;
  }
  console.log(result);
};

const listTasks = () => {
  if (tasks.length === 0) {
    console.log("No tasks found! Use the 'add' or '-a' command to create one.");
    return;
  }

  const removedCreatedAndUpdatedTasks = tasks.map((task) => {
    delete task.created;
    delete task.updated;
    return task;
  });

  table(removedCreatedAndUpdatedTasks);
};

const listAllTasks = () => {
  if (tasks.length === 0) {
    console.log("No tasks found! Use the 'add' or '-a' command to create one.");
    return;
  }

  table(tasks);
};

const updateTask = (id, description) => {
  const terminalWidth = process.stdout.columns || 80;
  // make the description not go over the terimal width, -27 is the other
  // columns id and status
  if (description.length >= terminalWidth - 27) {
    console.log("Sorry, the description you provided is too long.");
    return;
  }

  // find the first task where the task's id matches the provided id
  const findTask = tasks.find((task) => task.id === parseInt(id));

  if (!findTask) {
    console.log("\x1b[31mInvalid id\x1b[0m");
    return;
  }

  findTask.description = description;
  findTask.updated = new Date().toLocaleDateString();

  saveTasks();
  console.log("\x1b[32m%s\x1b[0m", `Task updated successfully (ID: ${id})`);
};

const deleteTasks = (ids) => {
  // find and return the ids that don't match any ids in tasks
  const invalidIds = ids.filter(
    (id) => !tasks.some((task) => String(task.id) === id),
  );

  if (invalidIds.length > 0) {
    const label = invalidIds.length === 1 ? "Invalid ID" : "Invalid IDs";
    console.log("\x1b[31m%s\x1b[0m", `${label}: ${invalidIds.join(", ")}`);
    return;
  }

  // removes tasks from tasks if id is found in the ids array and
  // it keeps tasks if id is not found in the ids array.
  tasks = tasks.filter((task) => !ids.includes(String(task.id)));

  saveTasks();
  console.log(
    // green
    "\x1b[32m%s\x1b[0m",
    `Task deleted successfully (ID: ${ids.join(", ")})`,
  );
};

const deleteAllTasks = () => {
  const rl = readline.createInterface({ input, output });

  rl.question(
    "Are you sure you want to delete all the tasks? (Y/N): ",
    (answer) => {
      if (answer.toLowerCase() === "y" || answer === "") {
        tasks = [];
        console.log(
          // green
          "\x1b[32m%s\x1b[0m",
          "All tasks have been deleted.",
        );
        saveTasks();
      } else {
        console.log("No tasks were deleted.");
      }
      rl.close();
    },
  );
  saveTasks();
};

const updateStatus = (ids, status) => {
  // find and return the ids that don't match any ids in tasks
  const invalidIds = ids.filter(
    (id) => !tasks.some((task) => String(task.id) === id),
  );

  if (invalidIds.length > 0) {
    const label = invalidIds.length === 1 ? "Invalid ID" : "Invalid IDs";
    console.log("\x1b[31m%s\x1b[0m", `${label}: ${invalidIds.join(", ")}`);
    return;
  }

  tasks.forEach((task) => {
    if (ids.includes(String(task.id))) {
      task.status = status;
      task.updated = new Date().toLocaleDateString();
    }
  });

  console.log(
    // green
    "\x1b[32m%s\x1b[0m",
    `Task status now updated to "${status}" (ID: ${ids.join(", ")})`,
  );

  saveTasks();
};

// write the "tasks" into the file
const saveTasks = () => {
  fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2));
};

parseArguments();
