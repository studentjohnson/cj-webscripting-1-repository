const taskForm = document.querySelector("#taskForm");
const taskInput = document.querySelector("#taskInput");
const tagInput = document.querySelector("#tagInput");
const formError = document.querySelector("#formError");
const taskList = document.querySelector("#taskList");
const taskCounter = document.querySelector("#taskCounter");
const emptyMessage = document.querySelector("#emptyMessage");
const filterButtons = document.querySelectorAll(".filterButton");
const tagFilter = document.querySelector("#tagFilter");

const defaultState = {
  tasks: [],
  statusFilter: "all",
  tagFilter: "all"
};

let state = loadState();

function loadState() {
  const savedState = localStorage.getItem("todoAppState");

  if (!savedState) {
    return structuredClone(defaultState);
  }

  try {
    return { ...structuredClone(defaultState), ...JSON.parse(savedState) };
  } catch (error) {
    localStorage.removeItem("todoAppState");
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem("todoAppState", JSON.stringify(state));
}

function showError(message) {
  formError.textContent = message;
}

function clearError() {
  formError.textContent = "";
}

function activeTaskCount() {
  return state.tasks.filter((task) => !task.done).length;
}

function updateCounter() {
  const activeCount = activeTaskCount();
  const taskWord = activeCount === 1 ? "task" : "tasks";
  taskCounter.textContent = `${activeCount} active ${taskWord}`;
}

function getUniqueTags() {
  const savedTags = state.tasks
    .map((task) => task.tag.trim())
    .filter((tag) => tag !== "");

  return [...new Set(savedTags)].sort();
}

function renderTagFilter() {
  const uniqueTags = getUniqueTags();

  tagFilter.innerHTML = `<option value="all">All tags</option>`;

  uniqueTags.forEach((tag) => {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = tag;
    tagFilter.appendChild(option);
  });

  if (!uniqueTags.includes(state.tagFilter) && state.tagFilter !== "all") {
    state.tagFilter = "all";
  }

  tagFilter.value = state.tagFilter;
}

function filteredTasks() {
  let tasksToShow = [...state.tasks];

  if (state.statusFilter === "active") {
    tasksToShow = tasksToShow.filter((task) => !task.done);
  }

  if (state.statusFilter === "completed") {
    tasksToShow = tasksToShow.filter((task) => task.done);
  }

  if (state.tagFilter !== "all") {
    tasksToShow = tasksToShow.filter((task) => task.tag === state.tagFilter);
  }

  return tasksToShow;
}

function renderFilterButtons() {
  filterButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === state.statusFilter);
  });
}

function createTaskItem(task) {
  const listItem = document.createElement("li");
  listItem.className = "taskItem";

  const taskInfo = document.createElement("section");
  taskInfo.className = "taskInfo";

  const taskText = document.createElement("p");
  taskText.className = "taskText";
  taskText.textContent = task.text;

  if (task.done) {
    taskText.classList.add("done");
  }

  taskInfo.appendChild(taskText);

  if (task.tag) {
    const taskTag = document.createElement("span");
    taskTag.className = "taskTag";
    taskTag.textContent = task.tag;
    taskInfo.appendChild(taskTag);
  }

  const taskActions = document.createElement("section");
  taskActions.className = "taskActions";

  const completeButton = document.createElement("button");
  completeButton.className = "completeButton";
  completeButton.textContent = task.done ? "Undo" : "Complete";
  completeButton.addEventListener("click", () => {
    toggleTask(task.id);
  });

  const deleteButton = document.createElement("button");
  deleteButton.className = "deleteButton";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => {
    deleteTask(task.id);
  });

  taskActions.appendChild(completeButton);
  taskActions.appendChild(deleteButton);

  listItem.appendChild(taskInfo);
  listItem.appendChild(taskActions);

  return listItem;
}

function renderTasks() {
  const tasksToShow = filteredTasks();
  taskList.innerHTML = "";

  tasksToShow.forEach((task) => {
    const taskItem = createTaskItem(task);
    taskList.appendChild(taskItem);
  });

  emptyMessage.style.display = tasksToShow.length === 0 ? "block" : "none";
}

function render() {
  renderFilterButtons();
  renderTagFilter();
  renderTasks();
  updateCounter();
}

function addTask(taskText, taskTag) {
  const cleanedTaskText = taskText.trim();
  const cleanedTaskTag = taskTag.trim().toLowerCase();

  if (cleanedTaskText === "") {
    showError("Task name is required.");
    return;
  }

  const newTask = {
    id: Date.now(),
    text: cleanedTaskText,
    tag: cleanedTaskTag,
    done: false
  };

  state.tasks.push(newTask);
  saveState();
  render();

  taskForm.reset();
  clearError();
  taskInput.focus();
}

function toggleTask(taskId) {
  state.tasks = state.tasks.map((task) => {
    if (task.id === taskId) {
      return { ...task, done: !task.done };
    }

    return task;
  });

  saveState();
  render();
}

function deleteTask(taskId) {
  state.tasks = state.tasks.filter((task) => task.id !== taskId);
  saveState();
  render();
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addTask(taskInput.value, tagInput.value);
});

taskInput.addEventListener("input", () => {
  if (taskInput.value.trim() !== "") {
    clearError();
  }
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.statusFilter = button.dataset.filter;
    saveState();
    render();
  });
});

tagFilter.addEventListener("change", (event) => {
  state.tagFilter = event.target.value;
  saveState();
  render();
});

render();
