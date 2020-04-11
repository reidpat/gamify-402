const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const fetch = require('node-fetch');
var unirest = require('unirest');
var request = require('request');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });


// auth trigger (new user signup)
exports.newUserSignup = functions.auth.user().onCreate((user) => {
    return admin.firestore().collection('users').doc(user.uid).set({
        email: user.email,
        rtKey: "",
        gp: 0,
        mp: 0,
        xp: 0
    });
});

// auth trigger (user deleted)
exports.userDeleted = functions.auth.user().onDelete((user) => {
    const doc = admin.firestore().collection('users').doc(user.uid);
    return doc.delete();
});

exports.updateRTData = functions.https.onCall(async (data, context) => {

    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'You must log in to use this service'
        )
    }



    function resolveData(result) {
        let rows;
        let rtData = [];
        rows = result.rows;

        rows.forEach(element => {

            let log = {
                date: element[0],
                time: Math.round(element[1] / 60 * 100) / 100,
                eNum: element[3],
                eEff: element[4],
                score: Math.round((element[1] / 3) * (element[3] * 5) / 10 * 100) / 100,
            }
            log.xp = Math.round(log.score / 50 * 100) / 100;
            rtData.push(log);
        });
        return addData(rtData);
    }

    function addData(data) {

        const userId = admin.firestore().collection('users').doc(context.auth.uid);
        const rescueTime = admin.firestore().collection('users').doc(context.auth.uid).collection('rescueTime');

        //rescueTime.orderBy('date', 'asc').catch(error => console.log(error));
        const ref = rescueTime.orderBy('date', 'asc');
        return ref.get()
            .catch(error => console.log(error))
            .then((rescueTime) => {
                let dataArray = [];

                rescueTime.forEach((data) => {
                    dataArray.push(data.data())
                })
                return (dataArray[dataArray.length - 1]);

            })
            .then(latestEntry => {
                console.log(latestEntry);
                let dataArray = [];
                data.forEach(data => {
                    //dataArray.push(new Date(data.date));
                    let targetTime = new Date(data.date);
                    var timeZoneFromDB = -7.00; //time zone value from database
                    //get the timezone offset from local time in minutes
                    var tzDifference = timeZoneFromDB * 60 + targetTime.getTimezoneOffset();
                    //convert the offset to milliseconds, add to targetTime, and make a new Date
                    var offsetTime = new Date(targetTime.getTime() - (tzDifference * 60 * 1000));
                    //dataArray.push(offsetTime);
                    if (offsetTime > latestEntry.date.toDate()) {
                        data.date =  admin.firestore.Timestamp.fromDate(offsetTime);
                        dataArray.push(data);
                        rescueTime.add(data);
                        //     .catch((err) => {throw new Error(e)});
                    }
                })
                //console.log(latestEntry.date.toDate());
                console.log(dataArray);
                return null;
            });

            
    }




async function getRTData(date, key) {
    return fetch(`https://www.rescuetime.com/anapi/data?key=${key}&perspective=interval&restrict_kind=efficiency&interval=minute&restrict_begin=${date}&format=json`)
        .then(res => res.json())
        .then(json => resolveData(json));

}


function getTodayDate() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    let todayFormatted = yyyy + '-' + mm + '-' + dd;
    return (todayFormatted);
}

return getRTData(getTodayDate(), "B63GZAGYqzgIMd4sQ_7NoIRbKHxSQZtd8w1SV3GG");
});
