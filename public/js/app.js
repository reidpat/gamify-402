// notification
const notification = document.querySelector('.notification');
const getRTData = document.querySelector('.updateRT');

getRTData.addEventListener('click', () => {
  const updateRTData = firebase.functions().httpsCallable('updateRTData');
  console.log("grabbing data...");
  updateRTData();
});

const showNotification = (message) => {
  notification.textContent = message;
  notification.classList.add('active');
  setTimeout(() => {
      notification.classList.remove('active');
      notification.textContent = '';
  }, 4000);
}

let user;

const xp = document.getElementById('xp');
const mp = document.getElementById('mp');
const gp = document.getElementById('gp');


function getCharacterValues(user){
  const userId = user.uid;
  const userValues = firebase.firestore().collection('users').doc(`${userId}`).get()
  .then((userVals)=> {
    const data = userVals.data();
    xp.innerText += data.xp;
    mp.innerText += data.mp;
    gp.innerText += data.gp;
  })
  //console.log(xpRef);
}

firebase.auth().onAuthStateChanged((user) => {
  if(user){
    getCharacterValues(user);
    getFirestoreRTData(user);
  }
});

function getFirestoreRTData(user){
  const userId = user.uid;
  const rescueTime = firebase.firestore().collection('users').doc(`${userId}`).collection('rescueTime').orderBy('date', 'asc').get()
    .then((rescueTime) => {
      let dataArray = []
      rescueTime.forEach((data) => {
        dataArray.push(data.data())
      })
      displayRTGraph(dataArray);
    })
}


