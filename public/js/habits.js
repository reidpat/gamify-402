


class Habit {
    name; //string
    streak = 0; //int
    percent = 0; //number
    complete = false; //bool
    timesCompleted = [];

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

        }
    }
});