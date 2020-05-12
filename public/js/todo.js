

let vueTodo = new Vue({
  el: '#todo',
  //start with an empty list of tasks
  data: {
    newTaskName: '',
    userID: "",
    tasks: [],
  },

  methods: {
    //this will update our
    toggleComplete: function (task) {
      task.complete = !task.complete;
      compTask = firebase.functions().httpsCallable('completeTask');
      compTask(task);
    },
    //gets triggered when the user enters a new task
    handleFormSubmit: async function (index, event) {
      //if we add a new task and we have less than 3 in our list, send that new one to our database
      if (event.target[0].value.length > 0) {
        if (this.tasks.length < 5) {
          this.tasks[index] = {
            complete: false,
            loaded: false,
            name: event.target[0].value,
            index: index,
          };
          addTask = firebase.functions().httpsCallable('addTask');
          addTask({
            newTaskName: event.target[0].value,
            index: index,
          });

        }
      }
    },
    handleDelete: function (task) {
      this.tasks[task.index] = null;
      removeTask = firebase.functions().httpsCallable('removeTask');
      removeTask(task);

    },
    setHoverTrue: function (task) {
      task.hover = true;
    },
    setHoverFalse: function (task) {
      task.hover = false;
    },
    addUser: function (user) {
      this.userID = user.uid;
      this.updateTasks();
    },
    updateTasks: function (snapshot) {
      let tasks = [];
      snapshot.forEach(doc => {
        let index = doc.data().index;
        tasks[index] = { ...doc.data(), id: doc.id, hover: false, loaded: true };
      });
      this.tasks = tasks;
    },
  },
  mounted() {
  }
});