// notification
const notification = document.querySelector('.notification');
const getRTData = document.querySelector('.updateRT');


//this section will diplay any errors that happen while sending data to the database
//currently not being fully utilized
const showNotification = (message) => {
  notification.textContent = message;
  notification.classList.add('active');
  setTimeout(() => {
    notification.classList.remove('active');
    notification.textContent = '';
  }, 4000);
}




function getCharacterValues(snap) {
  //snap is from firebase snapshot(). Updates data every time the item in the database is changed
  let data = snap.data();
  let currentXp = data.xp;
  let nextLevelXp = data.nextLvlXp;
  let level = data.lvl;

  //levels up the user. Will do so multiple times if they have enough passive xp built up.
  while (currentXp >= nextLevelXp) {
    level++;
    currentXp -= nextLevelXp;
    nextLevelXp = Math.round(Math.pow(level, 1.5)) * 10;
  }
  //if there was a level up, send it to the database
  if (data.xp >= data.nextLvlXp) {
    
    //Yaaay alert the user they have advanced a level
    alert(`Congratulations! You are now level ${level}`)
    const updateUserData = firebase.functions().httpsCallable('updateUserData');
    updateUserData({
      level: level,
      currentXp: currentXp,
      nextLevelXp: nextLevelXp
    })
  }
  //making sure the header data display is also updated
  xp_hud = Math.round(currentXp);
  level_hud = level;
  nextLvlXp_hud = nextLevelXp;
}

//updates streaks and the user's current xp modifier
function getXPMult(snap) {

  let today;
  let lastXpAward;
  let streak;
  let xpMult;

  //the snapshot from firebase
  const data = snap.data();

  //get the last day a streak was awarded
  lastXpAward = data.lastXpAward.toDate();
  //get today's day and set the time to 00:00. This makes sure that we are calculating time from the beginning of each day
  today = new Date();
  today.setHours(0, 0, 0, 0);
  streak = data.streak;
  xpMult = data.xpMult;

  // To calculate the time difference of two dates 
  let difference_In_Time = today.getTime() - lastXpAward.getTime();

  // To calculate the no. of days between two dates 
  let difference_In_Days = difference_In_Time / (1000 * 3600 * 24);

  //if it has been more than a day reset the streak
  if (difference_In_Days >= 2) {
    streak = 0;
  }
  //if greater than one day but less than two, increase the streak by one
  else if (difference_In_Days >= 1) {
    streak++;
  }

  //update last time award given. If this is less than 24 hours it effectively changes nothing
  lastXpAward = today;
  xpMult = 1 + (streak / 10);

  //update and draw the user values in the header
  xpBonus_hud = `${streak * 10}%`;
  streak_hud = streak;
  renderHUD();


  //send new data back to database
  const updateMultData = firebase.functions().httpsCallable('updateMultData');
  updateMultData({
    lastXpAward: today.getTime(),
    streak: streak,
    xpMult: xpMult,
  })
}

let userProfile;
let loaded = false;

firebase.auth().onAuthStateChanged(async (user) => {
  userProfile = user;

  //if the user is logged in, grab all their data and display in in the elements on the screen
  //to make this function more efficient I really should be caching data locally in the browser. Seeing as I don't know how to do that and didn't have the time to learn, I did not do that.
 
  //loaded ensures that we don't get caught in any infinite loops!
  if (user && !loaded) {

    //.onsnapshot() will be called every time there is a change to our database. This allows us to keep the data displayed on the webpage in (nearly) real-time snyc with our database
    const firebaseTodos = firebase.firestore().collection('users').doc(user.uid).collection('tasks').onSnapshot(snap => {
      //everytime there is a change in our task list, display the new data
      vueTodo.updateTasks(snap);
    });

    const firebaseHabits = firebase.firestore().collection('users').doc(user.uid).collection('habits').onSnapshot(snap => {

      vueHabits.updateHabits(snap);
      vueHabits.resetHabits(snap);
    });

    const userDoc = firebase.firestore().collection('users').doc(user.uid).onSnapshot(snap => {
      //shows xp, level, streaks, etc. 
      //updated every time there is a change in the database
      getCharacterValues(snap);
      getXPMult(snap);
    })

    const updateRTData = await firebase.functions().httpsCallable('updateRTData');
    //tell our server to go look for any new data from rescueTime. 
    updateRTData();

    const RTDoc = firebase.firestore().collection('users').doc(user.uid).collection('rescueTime').orderBy('date', 'desc').limit(12).onSnapshot(snap => {
      //any time there is a change to the rescueTime data in the database, we refresh our current display of it
      getFirestoreRTData(snap)
    })

    let listOfHabits = []
    listOfHabits.push(new Habit("Wake Up"));
    listOfHabits.push(new Habit("Journal", 3, [{ complete: false, date: new Date() }, { complete: false, date: new Date() }]));
    vueHabits.habits = listOfHabits;
    //set loaded to true so we don't keep doing this over and over!
    loaded = true;
  }
});

function getFirestoreRTData(snap) {
  //look through the list of rescueTime data and send them to chart.js to be displayed
  let dataArray = []
  snap.forEach((data) => {
    dataArray.push(data.data())
  })
  displayRTGraph(dataArray);
}


//This section is the Vue instance which controls the todo section of our content. 
