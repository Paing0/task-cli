# task-cli

A minimalistic command-line interface (CLI) tool for managing tasks.

## Features

- Add, update, list, and delete tasks.
- Manage task statuses ("todo", "in-progress", "completed").
- Task data is saved in a JSON file for persistence.
- Input validation and error handling for tasks.
- Customizable terminal output with color coding.

## Prerequisites

- Node.js installed on your system.

## Installation & setup

1. Clone the repository:

   ```bash
   git clone https://github.com/Paing0/task-cli.git
   cd tasks-cli
   ```

2. Create a global symlink for the CLI:

```bash
npm link
```

This step allows you to use the CLI tool globally by simply typing `tasks-cli` or `t` from any directory instead of running node index.js
within the project's folder.

If you later want to remove the symlink, you can use:

```bash
npm unlink
```

## Help menu

Use `task-cli -h`, `t -h`, or, if you haven’t set up the symlink, `node index
-h` to display the help menu.

```bash
Commands and Options:

Tip: Use "task-cli" or "t" instead of "node index".

  -a, add "Task Description"
    Add a new task with the specified description.

  -l, list
    List tasks without created and updated columns.

  -la, list-all
    List tasks, including created and updated columns.

  -u, update (id) "Updated Task Description"
    Update a task by specifying its ID and new description.

  -d, delete (id) | (1 2...)
    Delete one or more tasks by their IDs.

  -da, delete-all
    Delete all tasks.

  -mt, mark-todo (id) (1 2...)
    Mark one or more tasks as "todo" by their IDs.

  -mp, mark-in-progress (id) (1 2...)
    Mark one or more tasks as "in-progress" by their IDs.

  -mc, mark-completed (id) (1 2...)
    Mark one or more task as "completed" by their IDs.
```

## Example usage

```bash
$ node index.js add "Finish reading documentation" (or) t -a "Finish reading documentation"
Task added successfully (ID: 1)

$ node index.js list (or) t -l
┌────┬──────────────────────────────┬────────────┐
│ ID │ Description                  │ Status     │
├────┼──────────────────────────────┼────────────┤
│ 1  │ Finish reading documentation │ todo       │
└────┴──────────────────────────────┴────────────┘

$ node index.js update 1 "Edit documentation" (or) t -u 1 "Edit documentation"
Task updated successfully (ID: 1)

$ node index.js delete 1 (or) t -d 1
Task deleted successfully (ID: 1)

$ node index.js mark-in-progress 1 (or) t -mp 1
Task status now updated to "in-progress" (ID: 1)
```
