(function () {
  const FILTERS = {
    ALL: "all",
    ACTIVE: "active",
    COMPLETED: "completed",
  };

  let state = {
    tasks: [],
    filter: FILTERS.ALL,
  };

  function persist() {
    try {
      localStorage.setItem("tasks-with-filter", JSON.stringify(state));
    } catch (error) {}
  }

  function loadTasks() {
    try {
      state = JSON.parse(localStorage.getItem("tasks-with-filter")) || {
        tasks: [],
        filter: FILTERS.ALL,
      };
    } catch (error) {}
  }

  function updateProgress() {
    const progressContainer = document.querySelector("#progress-container");
    const progressPercentage = document.querySelector("#progress-percent");
    const progressBar = document.querySelector("#progress-bar");
    if (state.tasks.length === 0) {
      progressContainer.classList.add("hidden");
      return;
    }
    progressContainer.classList.remove("hidden");
    const done = state.tasks.filter((t) => t.isDone).length;
    const percentage = Math.ceil((done * 100) / state.tasks.length);
    progressPercentage.innerHTML = `${percentage}%`;
    progressBar.style.width = `${percentage}%`;
  }

  function updateItemsLeft() {
    const itemsLeft = state.tasks.filter((task) => !task.isDone).length;
    const counterElement = document.querySelector("#counter");
    const isPlural = itemsLeft > 1;
    counterElement.textContent = `${itemsLeft} ${
      isPlural ? "items" : "item"
    } left`;
  }

  function updateActiveTabs() {
    const selectAllBtn = document.querySelector("#all-tasks");
    const completeBtn = document.querySelector("#complete-tasks");
    const activeBtn = document.querySelector("#active-tasks");

    selectAllBtn.classList.remove(
      "font-medium",
      "underline",
      "text-purple-600"
    );
    activeBtn.classList.remove("font-medium", "underline", "text-purple-600");
    completeBtn.classList.remove("font-medium", "underline", "text-purple-600");

    if (state.filter === FILTERS.ALL) {
      selectAllBtn.classList.add("font-medium", "underline", "text-purple-600");
    } else if (state.filter === FILTERS.ACTIVE) {
      activeBtn.classList.add("font-medium", "underline", "text-purple-600");
    } else {
      completeBtn.classList.add("font-medium", "underline", "text-purple-600");
    }
  }

  function render() {
    const taskList = document.querySelector("#task-list");

    taskList.innerHTML = "";

    let filteredTasks = state.tasks;
    if (state.filter === FILTERS.ACTIVE) {
      filteredTasks = state.tasks.filter((task) => !task.isDone);
    } else if (state.filter === FILTERS.COMPLETED) {
      filteredTasks = state.tasks.filter((task) => task.isDone);
    }

    let finalHTML = "";
    if (filteredTasks.length === 0) {
      finalHTML = `<p class="text-center text-sm text-slate-500 uppercase py-10 border-b">Empty list</p>`;
    } else {
      filteredTasks.forEach(function (task) {
        let taskDom = `
          <div class="border-b py-1.5">
            <div class="hover:bg-purple-50 py-1.5 px-3 rounded flex items-center">
              ${
                task.isDone
                  ? `<svg data-role="uncheck-task" data-taskid="${task.id}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5 text-green-600 cursor-pointer">
                      <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd"/>
                    </svg>`
                  : `<svg data-role="check-task" data-taskid="${task.id}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5 cursor-pointer">
                      <path fill-rule="evenodd" d="M4 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H4.75A.75.75 0 0 1 4 10Z" clip-rule="evenodd"/>
                    </svg>`
              }
              <p class="flex-1 ml-3">${task.title}</p>
              <button class="hover:text-red-600" data-role="delete-task" data-taskid="${
                task.id
              }">
                <svg data-role="delete-task" data-taskid="${
                  task.id
                }" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"/>
                </svg>
              </button>
            </div>
          </div>`;
        finalHTML += taskDom;
      });
    }

    updateItemsLeft();
    updateActiveTabs();
    updateProgress();
    taskList.innerHTML = finalHTML;
  }

  window.addEventListener("DOMContentLoaded", function domLoaded() {
    loadTasks();
    render();

    const taskInput = document.querySelector("#task-input");
    const createBtn = document.querySelector("#create-task");
    const taskList = document.querySelector("#task-list");
    const selectAllBtn = document.querySelector("#all-tasks");
    const completeBtn = document.querySelector("#complete-tasks");
    const activeBtn = document.querySelector("#active-tasks");
    const clearCompletedBtn = document.querySelector("#delete-tasks");

    createBtn.addEventListener("click", function (e) {
      e.preventDefault();
      const title = taskInput.value;
      if (title === "") {
        alert("Please enter a task");
        return;
      }

      const newTask = {
        id: Date.now(),
        title,
        isDone: false,
      };

      state.tasks = [...state.tasks, newTask];
      taskInput.value = "";

      persist();
      render();
    });

    taskList.addEventListener("click", function (e) {
      const role = e.target.dataset.role;
      const taskId = parseInt(e.target.dataset.taskid);
      if (
        role !== "delete-task" &&
        role !== "check-task" &&
        role !== "uncheck-task"
      ) {
        return;
      }

      if (role === "delete-task") {
        state.tasks = state.tasks.filter((task) => task.id !== taskId);
      } else if (role === "check-task" || role === "uncheck-task") {
        state.tasks = state.tasks.map((task) => {
          if (task.id === taskId) {
            task.isDone = !task.isDone;
          }
          return task;
        });
      }

      persist();
      render();
    });

    selectAllBtn.addEventListener("click", function (e) {
      e.preventDefault();

      state.filter = FILTERS.ALL;
      persist();
      render();
    });

    activeBtn.addEventListener("click", function (e) {
      e.preventDefault();

      state.filter = FILTERS.ACTIVE;
      persist();
      render();
    });

    completeBtn.addEventListener("click", function (e) {
      e.preventDefault();

      state.filter = FILTERS.COMPLETED;
      persist();
      render();
    });

    clearCompletedBtn.addEventListener("click", function (e) {
      e.preventDefault();

      state.tasks = state.tasks.filter((task) => !task.isDone);
      persist();
      render();
    });
  });
})();
