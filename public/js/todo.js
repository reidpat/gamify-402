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
    handleFormSubmit: async function () {
      //if we add a new task and we have less than 3 in our list, send that new one to our database
      if (this.tasks.length < 3) {
        this.tasks.push({
          complete: false,
          loaded: false,
          name: this.newTaskName
        });
        addTask = firebase.functions().httpsCallable('addTask');
        addTask({ newTaskName: this.newTaskName });

        this.newTaskName = "";
      }
    },
    handleDelete: function (task) {
      this.tasks.pop(task);
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
        tasks.push({ ...doc.data(), id: doc.id, hover: false, loaded: true })
      });
      this.tasks = tasks;
    },
  },
  mounted() {
  }
});