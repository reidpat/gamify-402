


class Habit {
    name; //string
    streak = 0; //int
    percent = 0; //number
    complete = false; //bool
    timesCompleted = []; //compount of date and boolean

    constructor(name, streak, timesCompleted) {
        this.name = name;
        if (streak) {
            this.streak = streak;
        }
        if (timesCompleted) {
            this.timesCompleted = timesCompleted;
        }
    }

}

let vueHabits = new Vue({
    el: '#habits',
    //start with an empty list of tasks
    data: {
        newHabitName: "",
        habits: [],
    },
    methods: {
        toggleComplete: function (habit) {
            habit.complete = !habit.complete;
            if (habit.complete) {
                habit.timesCompleted.push({
                    date: new Date(),
                    complete: true
                });
                habit.streak++;
            }
            else {

                habit.timesCompleted.pop();
                habit.streak--;
            }

            let total = 0;
            let complete = 0;
            habit.timesCompleted.forEach(element => {
                if (element.complete) {
                    complete++;
                }
                total++
            });

            if (total != 0) {
                habit.percent = Math.round(complete / total * 100);
            }
            else {
                habit.percent = 0;
            }
            completeHabit = firebase.functions().httpsCallable('completeHabit');
            completeHabit(habit);

        },
        handleFormSubmit: async function () {
            this.habits.push({
                name: this.newHabitName, //string
                streak: 0, //int
                percent: 0, //number
                complete: false, //bool
                timesCompleted: [], //compount of date and boolean
            })
            addHabit = firebase.functions().httpsCallable('addHabit');
            addHabit({ name: this.newHabitName });
            console.log("submitted:", this.newHabitName);
            this.newHabitName = "";
        },
        
        updateHabits: function (snapshot) {
            let habits = [];
            snapshot.forEach(doc => {
              habits.push({ ...doc.data(), id: doc.id, hover: false })
            });
            this.habits = habits;
          },

          resetHabits: function (snapshot) {
              snapshot.forEach(doc => {
                  console.log(doc.data());
              })
          }
    }
})