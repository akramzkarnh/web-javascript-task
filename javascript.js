

let tasksList = JSON.parse(localStorage.getItem('todos')) || [];
let activeView = 'all';
let currentEditingIndex = null;
let currentRemovingIndex = null;

const taskInputField = document.querySelector('#taskInput');
const validationErrorMsg = document.querySelector('#validationError');
const createTaskButton = document.querySelector('#createTaskBtn');
const tasksContainer = document.querySelector('#tasksList');
const viewFilterButtons = document.querySelectorAll('.filter-buttons button');
const clearCompletedButton = document.querySelector('#clearCompletedBtn');
const clearAllButton = document.querySelector('#clearAllBtn');

const editTaskModalWindow = document.querySelector('#editTaskModal');
const editTaskInputField = document.querySelector('#editTaskField');
const editValidationErrorMsg = document.querySelector('#editValidationError');
const updateTaskButton = document.querySelector('#updateTaskBtn');
const cancelEditButton = document.querySelector('#cancelEditBtn');

const removeTaskModalWindow = document.querySelector('#removeTaskModal');
const confirmRemoveButton = document.querySelector('#confirmRemoveBtn');
const cancelRemoveButton = document.querySelector('#cancelRemoveBtn');

const clearAllTasksModalWindow = document.querySelector('#clearAllTasksModal');
const confirmClearAllButton = document.querySelector('#confirmClearAllBtn');
const cancelClearAllButton = document.querySelector('#cancelClearAllBtn');

const clearCompletedModalWindow = document.querySelector('#clearCompletedModal');
const confirmClearCompletedButton = document.querySelector('#confirmClearCompletedBtn');
const cancelClearCompletedButton = document.querySelector('#cancelClearCompletedBtn');

document.addEventListener('DOMContentLoaded', displayTasks);

setupEventListeners();

function setupEventListeners() {
    createTaskButton.addEventListener('click', createNewTask);
    taskInputField.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            createNewTask();
        }
    });

    for (let i = 0; i < viewFilterButtons.length; i++) {
        viewFilterButtons[i].addEventListener('click', function(event) {
            const viewType = event.target.getAttribute('data-view');
            changeView(viewType);
        });
    }

    clearCompletedButton.addEventListener('click', initiateRemoveCompleted);
    clearAllButton.addEventListener('click', initiateRemoveAll);

    updateTaskButton.addEventListener('click', saveTaskChanges);
    cancelEditButton.addEventListener('click', function() {
        hideModal(editTaskModalWindow);
    });

    confirmRemoveButton.addEventListener('click', executeRemoveTask);
    cancelRemoveButton.addEventListener('click', function() {
        hideModal(removeTaskModalWindow);
    });

    confirmClearAllButton.addEventListener('click', executeRemoveAll);
    cancelClearAllButton.addEventListener('click', function() {
        hideModal(clearAllTasksModalWindow);
    });

    confirmClearCompletedButton.addEventListener('click', executeRemoveCompleted);
    cancelClearCompletedButton.addEventListener('click', function() {
        hideModal(clearCompletedModalWindow);
    });
}

function createNewTask() {
    const taskText = taskInputField.value.trim();

    if (taskText.length === 0) {
        validationErrorMsg.textContent = '⛔ Task cannot be empty';
        return;
    }

    if (taskText.length < 5) {
        validationErrorMsg.textContent = '⛔ Task must be at least 5 characters long';
        return;
    }

    const firstChar = taskText[0];
    if (firstChar >= '0' && firstChar <= '9') {
        validationErrorMsg.textContent = '⛔ Task cannot start with a number';
        return;
    }

    const validPattern = /^[a-zA-Z0-9\s.,'!?-]+$/;
    if (!validPattern.test(taskText)) {
        validationErrorMsg.textContent = '⛔ Task must contain only English characters';
        return;
    }

    validationErrorMsg.textContent = '';
    const newTaskObj = { text: taskText, done: false };
    tasksList.push(newTaskObj);
    persistToStorage();
    taskInputField.value = '';
    displayTasks();
    displayNotification('Task added successfully 🎉', 'success');
}

function toggleTaskStatus(displayIndex) {
    const actualIndex = findActualIndex(displayIndex);
    const currentTask = tasksList[actualIndex];
    currentTask.done = !currentTask.done;
    persistToStorage();
    displayTasks();
}

function initiateEditTask(displayIndex) {
    currentEditingIndex = findActualIndex(displayIndex);
    editValidationErrorMsg.textContent = '';
    const taskToEdit = tasksList[currentEditingIndex];
    editTaskInputField.value = taskToEdit.text;
    showModal(editTaskModalWindow);
}

function saveTaskChanges() {
    const updatedText = editTaskInputField.value.trim();

    if (updatedText.length < 5) {
        editValidationErrorMsg.textContent = '⛔ Task must be at least 5 characters long';
        return;
    }

    tasksList[currentEditingIndex].text = updatedText;
    persistToStorage();
    hideModal(editTaskModalWindow);
    displayTasks();
    displayNotification('Task has been edited.', 'success');
}

function initiateRemoveTask(displayIndex) {
    currentRemovingIndex = findActualIndex(displayIndex);
    showModal(removeTaskModalWindow);
}

function executeRemoveTask() {
    tasksList.splice(currentRemovingIndex, 1);
    persistToStorage();
    hideModal(removeTaskModalWindow);
    displayTasks();
    displayNotification('Task has been deleted.', 'success');
}

function initiateRemoveAll() {
    if (tasksList.length === 0) {
        displayNotification('No tasks to delete.', 'info');
        return;
    }
    showModal(clearAllTasksModalWindow);
}

function executeRemoveAll() {
    tasksList = [];
    persistToStorage();
    hideModal(clearAllTasksModalWindow);
    displayTasks();
    displayNotification('All tasks have been deleted.', 'success');
}
