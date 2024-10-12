// Wait for the HTML document to load before running the code inside the function
document.addEventListener("DOMContentLoaded", function () {
    
    // Get todos and archived todos from local storage
    let todos = JSON.parse(localStorage.getItem("todos")) || [];
    let archivedTodos = JSON.parse(localStorage.getItem("archivedTodos")) || [];

    // A function to show the todo lists in 'todos.html'
    function updateTodoList() {
        const todoContainer = document.getElementById("todo-container");
        // Stop the function if there are no todos
        if (!todoContainer) return;

        // Clear current list of todos, to prevent duplicate todos lists from appearing when the page is updated or refreshed
        todoContainer.innerHTML = "";

        // Check if there are no todos and show a message if there are none
        if (todos.length === 0) {
            const emptyMessage = document.createElement("div");
            emptyMessage.innerHTML = "<p>You don't have any to-do lists yet. Let's get to work!</p>";
            todoContainer.appendChild(emptyMessage);
            return;
        }

        // Go through each todo item to create and display them
        todos.forEach(function (todo, index) {

            // Create a post-it (div) for each todo
            const todoDiv = document.createElement("div");
            todoDiv.className = "todo-box";

            // Create a space for the category icon
            const categoryIcon = document.createElement("span");
            categoryIcon.className = "category-icon";
            categoryIcon.textContent = getCategoryIcon(todo.category);

            // Create an element for the todo title 
            const title = document.createElement("h3");
            title.textContent = todo.title;

            // Create a list to display todo items with checkboxes
            const itemList = document.createElement("ul");
            todo.items.forEach(function (item, itemIndex) {
                const listItem = document.createElement("li");
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";

                // Check the box if the item is marked as completed
                checkbox.checked = item.completed;

                // Update checkbox event listener, when the checkbox is checked
                checkbox.addEventListener("change", function () {
                    item.completed = checkbox.checked;

                    // Save the updated todo post-it back to local storage
                    localStorage.setItem("todos", JSON.stringify(todos));

                    // If item is marked as completed, a line will go through the item text
                    listItem.style.textDecoration = item.completed ? "line-through" : "none";

                    // Check if all items are completed
                    const allCompleted = todo.items.every(item => item.completed);

                    // Change background of the post-it to green if all items are completed
                    todoDiv.style.backgroundColor = allCompleted ? "lightgreen" : "";

                    // Show a pop-up message if all items are completed
                    if (allCompleted) {
                        alert(`Yay, you finished all the tasks in "${todo.title}"!`);
                    }
                });

                // Add a checkbox, item title, and strikethrough to the list item
                listItem.appendChild(checkbox);
                listItem.appendChild(document.createTextNode(item.title));
                listItem.style.textDecoration = item.completed ? "line-through" : "none";
                
                // Add the list item to the list
                itemList.appendChild(listItem); // Append the list item to the item list
            });

            // Check if all items are completed to set the post-it background color
            const allCompleted = todo.items.every(item => item.completed);
            todoDiv.style.backgroundColor = allCompleted ? "lightgreen" : "";

            // Create a container for 'edit' and 'delete' buttons for the todo
            const buttonContainer = document.createElement("div");
            buttonContainer.className = "button-container";

            // Create element for 'edit' button
            const editButton = document.createElement("button");
            editButton.textContent = "Edit";

            // When the button is clicked, the user will be directed to the edit.html page
            editButton.addEventListener("click", function () {
                window.location.href = "edit.html?index=" + index;
            });

            // Create element for 'delete' button
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";

            // When the button is clicked, a dialog box pops up asking the user to confirm their actions
            deleteButton.addEventListener("click", function () {
                if (confirm(`Are you sure you want to delete "${todo.title}"?`)) {

                    // Save the removed todo list in archive for later use
                    const archivedTodo = { ...todo }; // Create a copy of the todo
                    archivedTodos.push(archivedTodo); // Add it to the archivedTodos array

                    // Remove the todo from the main list
                    todos.splice(index, 1);

                    // Update local storage with remaining todos
                    localStorage.setItem("todos", JSON.stringify(todos));
                    localStorage.setItem("archivedTodos", JSON.stringify(archivedTodos));

                    // Refresh the displayed todo
                    updateTodoList();
                }
            });

            // Append buttons to the button container
            buttonContainer.appendChild(editButton);
            buttonContainer.appendChild(deleteButton);

            // Append all components of the todo to the todoDiv
            todoDiv.appendChild(categoryIcon);
            todoDiv.appendChild(title);
            todoDiv.appendChild(itemList);
            todoDiv.appendChild(buttonContainer);
            todoContainer.appendChild(todoDiv);
        });
    }

    // Function to show an emoji based on category
    function getCategoryIcon(category) {

        // Show a specific emoji for each category
        switch (category) {
            case "work": return "📁";
            case "personal": return "🏠";
            case "shopping": return "🛒";
            case "health": return "💪";
            default: return "📋";
        }
    }

    // Check if the user is on the edit.html page with the edit-todo-form element
    const editTodoForm = document.getElementById("edit-todo-form");
    if (editTodoForm) {

        // Get the URL parameters to get the index of the todo item to edit
        const urlParams = new URLSearchParams(window.location.search);
        const taskIndex = urlParams.get('index');

        // Make sure the index is valid and inside of the todos array
        if (taskIndex !== null && taskIndex < todos.length) {
            const currentTodo = todos[taskIndex];

            // Function to update item list display
            function updateItemList() {
                const itemList = document.getElementById("item-list");

                // Get the latest list of items
                itemList.innerHTML = "";

                // Go through each item in the todo list
                currentTodo.items.forEach(function (item, itemIndex) {

                    // Create a list item for all items and show the names
                    const listItem = document.createElement("li");
                    listItem.textContent = item.title;

                    // Create delete button for each item
                    const deleteItemButton = document.createElement("button");
                    deleteItemButton.textContent = "Delete";

                    // Create a function to delete items when the user clicks on them
                    deleteItemButton.addEventListener("click", function () {
                        currentTodo.items.splice(itemIndex, 1);

                        // Update the todo list
                        todos[taskIndex] = currentTodo;

                        // Update local storage with the modified list
                        localStorage.setItem("todos", JSON.stringify(todos));

                        // Refresh the item list displayed on the page
                        updateItemList();
                    });

                    // Add the button next to the items
                    listItem.appendChild(deleteItemButton);

                    // Add the list item to the item list
                    itemList.appendChild(listItem);
                });
            }

            // Make sure the user does not return to the edit.html page when they press the submit button
            editTodoForm.addEventListener("submit", function (event) {
                event.preventDefault();

                // Get the user input with no whitespace
                const itemTitle = document.getElementById("item-title").value.trim();

                // Check for valid input
                const itemErrorMessage = document.getElementById("edit-error-message");

                // If the input is too short, display an error message
                if (itemTitle.length === 0 || itemTitle.length < 3) {
                    itemErrorMessage.textContent = "* Invalid input";
                    document.getElementById("item-title").classList.add("invalid");

                // Clear error message if valid
                } else {
                    itemErrorMessage.textContent = "";
                    document.getElementById("item-title").classList.remove("invalid");

                    // Create a new item object, and set it as not completed
                    const newItem = {
                        title: itemTitle,
                        completed: false,
                    };

                    // Add a new item to the todo list
                    currentTodo.items.push(newItem);

                    // Clear field after adding
                    document.getElementById("item-title").value = "";

                    // Refresh the item list display
                    updateItemList();

                    // Save updated todos back to local storage
                    todos[taskIndex] = currentTodo;
                    localStorage.setItem("todos", JSON.stringify(todos));
                }
            });

            // Create a checkbox for hiding items
            const hideItemsCheckbox = document.getElementById("hide-items-checkbox");
            hideItemsCheckbox.addEventListener("change", function () {
                const itemList = document.getElementById("item-list");

                // Shows the visibility of the item list based on checkbox state
                itemList.style.display = hideItemsCheckbox.checked ? "none" : "block";
            });

            // Create a 'save' button
            const saveButton = document.getElementById("save-button");
            saveButton.addEventListener("click", function () {

                // Save the updated todos back to local storage
                localStorage.setItem("todos", JSON.stringify(todos));

                // Alert for saving the list
                alert('Your changes have been saved!');

                // Redirect the user to the todos.html page after saving
                window.location.href = "todos.html";
            });

            // Refreshes the item list and displays the items
            updateItemList();

        // Alerts the user for an invalid selection of a task list
        } else {
            alert("Invalid task selected.");

            // Redirect the user to the todos.html page
            window.location.href = "todos.html";
        }

    // Refreshes the todo lists on the todos.html page
    } else {
        updateTodoList();
    }

    // Checks for the form on the page add.html
    const addTodoForm = document.getElementById("add-todo-form");

    // If the form is found, the user is on the add.html page
    if (addTodoForm) {

        // Waits for the user to submit the form
        addTodoForm.addEventListener("submit", function (event) {

            // Make sure the user does not return to the same page
            event.preventDefault();

            // Get the elements
            const todoTitleInput = document.getElementById("todo-title");
            const categoryInput = document.getElementById("category");
            const addErrorMessage = document.getElementById("add-error-message");
            const categoryErrorMessage = document.getElementById("category-error-message");

            // Clear previous error messages
            addErrorMessage.textContent = '';
            categoryErrorMessage.textContent = '';

            // STart validity check
            let isValid = true;

            // Validate title input and show an error message
            if (todoTitleInput.value.trim() === "" || todoTitleInput.value.trim().length < 3) {
                addErrorMessage.textContent = "* Invalid input";
                todoTitleInput.classList.add("invalid");
                isValid = false;
            } else {

                // Clear error message if valid
                addErrorMessage.textContent = "";
                todoTitleInput.classList.remove("invalid");
            }

            // Check if the user selected a category, and display an error message
            if (categoryInput.value.trim() === "") {
                categoryErrorMessage.textContent = "* Please select a category.";
                isValid = false;
            }

            // If input was valid ,create a new todo list and reset the fields
            if (isValid) {
                const newTodo = {

                    // Get the title and category, and start the item list array
                    title: todoTitleInput.value.trim(),
                    category: categoryInput.value,
                    items: [],
                };

                // Add the new todo list and update local storage
                todos.push(newTodo);
                localStorage.setItem("todos", JSON.stringify(todos));

                // Get the index of the list
                const newTaskIndex = todos.length - 1;

                // Redirect the user to the edit.html page, with the index of the new task
                window.location.href = `edit.html?index=${newTaskIndex}`;
            }
        });
    }

// Predefined categories for calculating the progress
const predefinedCategories = ["work", "personal", "shopping", "health", "other"];

// Initialize an object to track completed items by category
const categories = {};
predefinedCategories.forEach(category => {
    categories[category] = { completed: 0, total: 0 };
});

// Calculate progress based on the todos
todos.forEach(todo => {
    todo.items.forEach(item => {
        const category = todo.category ? todo.category.toLowerCase() : "other";
        if (categories[category]) {
            categories[category].total++;
            if (item.completed) {
                categories[category].completed++;
            }
        } else {
            // If the category is not predefined, count it as "other"
            categories["other"].total++;
            if (item.completed) {
                categories["other"].completed++;
            }
        }
    });
});

// Function to display the progress of tasks
function displayProgress() {
    const progressContainer = document.getElementById("progress-container");
    // Check if the progress container exists
    if (!progressContainer) return;
    // Clear any previous progress
    progressContainer.innerHTML = "";

    // Create progress bars for each category
    for (const category in categories) {
        const { completed, total } = categories[category];
        const progressBar = document.createElement("div");
        const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Style for the progress bar
        progressBar.innerHTML = `
            <div>${category}: ${progressPercentage}% completed</div>
            <div class="progress-bar">
                <div class="progress" style="width: ${progressPercentage}%;"></div>
            </div>
        `;

        progressContainer.appendChild(progressBar);
    }
}

// Update the todo list display and show progress on page load
updateTodoList();
displayProgress();
});