var todoList = {
  todos: [],
  addTodo: function(todoText) {
    this.todos.push({
      todoText: todoText,
      completed: false,
    });
    this.updateState();
  },
  changeTodo: function(position, newText) {
    this.todos[position].todoText = newText;

    this.updateState();
  },
  deleteTodo: function(position) {
    this.todos.splice(position, 1);

    this.updateState();
  },
  deleteCompleted: function() {
    var pendingTodos = [];
    for (var i = 0; i < this.todos.length; i++) {
      if(this.todos[i].completed === false) {
        pendingTodos.push(this.todos[i]);
      }
    }
    this.todos = pendingTodos;
    this.updateState();
  },
  toggleTodo: function(position) {
    var todo = this.todos[position];
    todo.completed = !todo.completed;

    this.updateState();
  },
  toggleAll: function() {
    var todoCompleted = 0;
    var todoListTotal = this.todos.length;

    this.todos.forEach(function(todo) {
      if (todo.completed === true) {
        todoCompleted++;
      }
    });

    this.todos.forEach(function(todo) {
      if (todoCompleted === todoListTotal ) {
        todo.completed = false;
      } else {
        todo.completed = true;
      }
    });
    this.updateState();
  },
  updateState: function() {
    localStorage.todoState = JSON.stringify(this.todos);
  },
  loadState: function() {
    if (localStorage.todoState != undefined) {
      todoList.todos = JSON.parse(localStorage.todoState);
      view.displayTodos();
      console.log('state loaded');
    }
  }
};

var handlers = {
  addTodo: function() {
    var addTodoText = document.getElementById('add-text');

    if (addTodoText.value === '') {
      alert("Please put something down");
    } else {
      todoList.addTodo(addTodoText.value);
      addTodoText.value = '';
    }

    view.displayTodos();
  },
  changeTodo: function(position) {
    var newContent = document.getElementsByTagName('span')[position];
    var newText = newContent.textContent; // should be a string
    console.log(newText)

    if (newText === '') {
      this.deleteTodo(position);
    } else {
      todoList.changeTodo(position, newText);
      position.valueAsNumber = '';
      newContent.value = '';
    }

    view.displayTodos();
  },
  deleteTodo: function(positionID) {
    todoList.deleteTodo(positionID);
    view.displayTodos();
  },
  clearAll: function() {
    todoList.deleteCompleted();
    view.displayTodos();
  },
  toggleCompleted: function(positionID) {
    todoList.toggleTodo(positionID);
    view.displayTodos();
  },
  toggleAll: function() {
    todoList.toggleAll();
    view.displayTodos();
  }
};

var view = {
  displayTodos: function() {
    var todosUl = document.querySelector('ul');
    todosUl.innerHTML = '';

    todoList.todos.forEach(function(todo, position) {
      var todoLi = document.createElement('li');
      var todoTextWithCompletion = document.createElement('span');
      var checkbox = this.createCheckBox();
      checkbox.className = 'checkbox';

      if (todo.completed === true) {
        checkbox.checked = true;
        checkbox.checked = 'checked';
        todoLi.className = 'strikethrough';
      }

      todoTextWithCompletion.textContent = todo.todoText;
      todoLi.id = position;

      var deleteButton = this.createDeleteButton();

      todosUl.appendChild(todoLi);
      todoLi.appendChild(checkbox);
      todoLi.appendChild(todoTextWithCompletion);
      todoLi.appendChild(deleteButton);
    }, this)
  },
  createDeleteButton: function() {
    var deleteButton = document.createElement('button');
    deleteButton.textContent = "✖";
    deleteButton.className = "deleteButton";

    return deleteButton;
  },
  createCheckBox: function() {
    var checkBox = document.createElement('input');
    checkBox.type = 'checkbox';
    checkBox.value = 'whatever';

    return checkBox;
  },
  setupEventListeners: function() {
    var card = document.getElementsByClassName('card')[0];
    var todoUl = document.querySelector('ul');

    card.addEventListener('keypress', function(event) {
      var key = event.which;
      var enteredElement = event.target;

      if (key === 13) {
        if (enteredElement.id === 'add-text') {
          handlers.addTodo();
        }
      }
    })

    card.addEventListener('click', function(event) {
      var clickedElement = event.target;
      if (clickedElement.value === 'clear-tasks') {
        clickedElement.className += ' wobble';
        setTimeout(function() {
          clickedElement.className = 'btn';
        }, 750)
      }
    })

    todoUl.addEventListener('click', function(event) {
      var clickedElement = event.target;
      var parentElementID = parseInt(clickedElement.parentNode.id);

      if (clickedElement.className === 'deleteButton') {
        handlers.deleteTodo(parentElementID);
      } else if (clickedElement.className === 'checkbox') {
          handlers.toggleCompleted(parentElementID);
      }
    })

    todoUl.addEventListener('dblclick', function(event) {
      var doubleClickedElement = event.target;
      var editableContent = '';
      var todoID = 0;
      var entireDocument = document.documentElement;

      if (doubleClickedElement.localName === 'li') {
        editableContent = doubleClickedElement.children[1];
        todoID = parseInt(doubleClickedElement.id);
      } else if (doubleClickedElement.localName === 'span') {
        editableContent = doubleClickedElement;
        todoID = parseInt(doubleClickedElement.parentNode.id);
      }

      editableContent.contentEditable = true;
      editableContent.focus();


      function detectOutsideClick(e) {
        if (e.target.localName !== 'li' && e.target.localName !== 'span') {
          updateContent();
        }
      }

      function updateContent() {
        handlers.changeTodo(todoID);
        editableContent.contentEditable = false;
        entireDocument.removeEventListener('click', detectOutsideClick)
      }

      entireDocument.addEventListener('click', detectOutsideClick);

      editableContent.addEventListener('keypress', function(event) {
        var key = event.which;
        if (key === 13 && editableContent.localName === 'span') {
          updateContent();
        }
      })

    })

  }
}

window.onload = todoList.loadState();
view.setupEventListeners()
