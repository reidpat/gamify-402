


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
                    date: firebase.firestore.Timestamp.fromDate(new Date()),
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

        resetHabits: async function (snapshot, uid) {

            let lastHabitReset;

            const userDoc = await firebase.firestore().collection('users').doc(uid).get()
                .then(doc => {
                    let data = doc.data();
                    lastHabitReset = data.newDay.toDate();
                    lastHabitReset.setHours(0,0,0,0);
                })

            let today = new Date();
            today.setHours(0, 0, 0, 0);
            let diff_In_Time = today.getTime() - lastHabitReset.getTime();

            // To calculate the no. of days between two dates 
            let diff_In_Days = diff_In_Time / (1000 * 3600 * 24);
            
            //if it has been more than a day reset the streak
            if (diff_In_Days >= 1){
                newDay = firebase.functions().httpsCallable('newDay');
                newDay();
                //reset streak
                //add new completion as false today
                //set completed to false

                snapshot.forEach(doc => {
                    let habit = doc.data();
                    let twoDays = new Date()
                    twoDays.setHours(0, 0, 0, 0);
                    let lastCompletion = twoDays;
                    if (habit.timesCompleted.length > 0) {
                        lastCompletion = new Date(habit.timesCompleted[habit.timesCompleted.length - 1].date.seconds * 1000);
                        lastCompletion.setHours(0, 0, 0, 0);
                    }
                    let today = new Date();
                    today.setHours(0, 0, 0, 0);
                    let difference_In_Time = today.getTime() - lastCompletion.getTime();

                    // To calculate the no. of days between two dates 
                    let difference_In_Days = difference_In_Time / (1000 * 3600 * 24);

                    resetHabits = firebase.functions().httpsCallable('resetHabits');

                    //if it has been more than a day reset the streak
                    if (difference_In_Days >= 1) {
                       
                        if (difference_In_Days >= 2){
                            habit.timesCompleted.push({
                                date: firebase.firestore.Timestamp.fromDate(lastCompletion),
                                complete: false
                            });
                            habit.streak = 0;
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
                        habit.complete = false;
                        habit.id = doc.id;
                        resetHabits(habit);


                    }
                })
                

            }
        }
    }
})