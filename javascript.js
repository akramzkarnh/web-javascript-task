
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

function initiateRemoveCompleted() {
    const completedTasks = tasksList.filter(function(task) {
        return task.done === true;
    });
    
    if (completedTasks.length === 0) {
        displayNotification('No done tasks to delete.', 'info');
        return;
    }
    showModal(clearCompletedModalWindow);
}

function executeRemoveCompleted() {
    tasksList = tasksList.filter(function(task) {
        return task.done === false;
    });
    persistToStorage();
    hideModal(clearCompletedModalWindow);
    displayTasks();
    displayNotification('All done tasks have been deleted.', 'success');
}

function changeView(viewType) {
    activeView = viewType;
    
    for (let i = 0; i < viewFilterButtons.length; i++) {
        viewFilterButtons[i].classList.remove('active');
    }
    
    const selectedButton = document.querySelector('[data-view="' + viewType + '"]');
    selectedButton.classList.add('active');
    
    displayTasks();
}

function displayTasks() {
    let filteredTasksList = tasksList;

    if (activeView === 'done') {
        filteredTasksList = tasksList.filter(function(task) {
            return task.done === true;
        });
    } else if (activeView === 'todo') {
        filteredTasksList = tasksList.filter(function(task) {
            return task.done === false;
        });
    }

    if (filteredTasksList.length === 0) {
        tasksContainer.innerHTML = 'No Tasks 📝';
        return;
    }

    tasksContainer.innerHTML = '';
    
    for (let i = 0; i < filteredTasksList.length; i++) {
        const currentTask = filteredTasksList[i];
        
        const listItem = document.createElement('li');
        const itemClasses = 'todo-item' + (currentTask.done ? ' done' : '');
        listItem.setAttribute('class', itemClasses);
        
        const textSpan = document.createElement('span');
        textSpan.textContent = currentTask.text;
        
        const actionsContainer = document.createElement('div');
        actionsContainer.setAttribute('class', 'todo-actions');
        
        const toggleButton = document.createElement('button');
        toggleButton.setAttribute('class', 'toggle');
        const toggleIcon = currentTask.done ? 
            '<i class="fa-regular fa-square-check"></i>' : 
            '<i class="fa-regular fa-square"></i>';
        toggleButton.innerHTML = toggleIcon;
        toggleButton.addEventListener('click', function() {
            toggleTaskStatus(i);
        });
        
        const editButton = document.createElement('button');
        editButton.setAttribute('class', 'edit');
        editButton.innerHTML = '<i class="fa-solid fa-pen"></i>';
        editButton.addEventListener('click', function() {
            initiateEditTask(i);
        });
        
        const deleteButton = document.createElement('button');
        deleteButton.setAttribute('class', 'delete');
        deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
        deleteButton.addEventListener('click', function() {
            initiateRemoveTask(i);
        });
        
        actionsContainer.appendChild(toggleButton);
        actionsContainer.appendChild(editButton);
        actionsContainer.appendChild(deleteButton);
        
        listItem.appendChild(textSpan);
        listItem.appendChild(actionsContainer);
        
        tasksContainer.appendChild(listItem);
    }
}

function findActualIndex(displayIndex) {
    let filteredTasksList = tasksList;
    
    if (activeView === 'done') {
        filteredTasksList = tasksList.filter(function(task) {
            return task.done === true;
        });
    } else if (activeView === 'todo') {
        filteredTasksList = tasksList.filter(function(task) {
            return task.done === false;
        });
    }
    
    const targetTask = filteredTasksList[displayIndex];
    return tasksList.indexOf(targetTask);
}

function showModal(modalElement) {
    modalElement.style.display = 'flex';
}

function hideModal(modalElement) {
    modalElement.style.display = 'none';
}

function displayNotification(messageText, messageType) {
    const mainContainer = document.querySelector('.container');
    const existingNotification = mainContainer.querySelector('.message-box');
    
    if (existingNotification) {
        mainContainer.removeChild(existingNotification);
    }

    const notificationBox = document.createElement('div');
    const boxClasses = 'message-box ' + messageType;
    notificationBox.setAttribute('class', boxClasses);
    notificationBox.textContent = messageText;
    
    mainContainer.appendChild(notificationBox);

    setTimeout(function() {
        if (notificationBox.parentNode) {
            mainContainer.removeChild(notificationBox);
        }
    }, 3000);
}

function persistToStorage() {
    const serializedData = JSON.stringify(tasksList);
    localStorage.setItem('todos', serializedData);
}