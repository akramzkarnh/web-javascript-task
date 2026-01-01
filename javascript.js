
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
