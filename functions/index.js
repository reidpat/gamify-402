//Firebase cloud functions
//These run on the backend server when requested

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const fetch = require('node-fetch');




// auth trigger (new user signup)
//This function need revision before the app can accept new users
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



//For when the frontend needs to add xp to the user
exports.addXP = functions.https.onCall(async (data, context) => {

    //calling the local addXP function. This is done because other functions also add XP and it is bad to have one cloud function call another.
    return await addXP(context, data.xp);

});

// The function in charge of adding XP to a user 
async function addXP(context, amount) {

    //getting the specific user profile
    const user = admin.firestore().collection('users').doc(context.auth.uid);
    return user.get()
        .then((userData) => {
            //multiplying the amount of xp by the user's current xp multiplier
            amount *= userData.data().xpMult;

            //because there can be negative xp added, don't go below zero! 
            if (userData.data().xp + amount >= 0) {

                //updating the xp value
                return user.update({
                    //xp is rounded to the nearest 100th
                    xp: admin.firestore.FieldValue.increment(Math.round(amount * 100) / 100)
                })
            }
            else {
                return user.update({
                    xp: 0
                })
            }
        });


}
//used to update the user's xp multiplier and streak
//this function is called if the user logs in on a new day
exports.updateMultData = functions.https.onCall(async (data, context) => {
    return admin.firestore().collection('users').doc(context.auth.uid).update({
        //update their data
        streak: data.streak,
        //make sure to update this with the date of their newest sign in!
        lastXpAward: admin.firestore.Timestamp.fromDate(new Date(data.lastXpAward)),
        xpMult: data.xpMult,
    })
})

//for updating users level and xp values
//note that this function should not be used to add xp. Use addXP above instead.
exports.updateUserData = functions.https.onCall(async (data, context) => {
    return admin.firestore().collection('users').doc(context.auth.uid).update({
        lvl: data.level,
        xp: data.currentXp,
        nextLvlXp: data.nextLevelXp
    })
})

exports.addHabit = functions.https.onCall((data, context) => {

    let addHabit = admin.firestore().collection('users').doc(context.auth.uid).collection('habits').add({
        name: data.name, //string
        streak: 0, //int
        percent: 0, //number
        complete: false, //bool
        timesCompleted: [], //compount of date and boolean
    })
    return null;
})
exports.completeHabit = functions.https.onCall((data, context) => {

    //Awards xp for completion and takes away if marked incomplete.
    if (data.complete) {
        addXP(context, data.streak);
    }
    else {
        addXP(context, -(data.streak + 1));
    }

    //log data in database
    return admin.firestore().collection('users').doc(context.auth.uid).collection('habits').doc(data.id).update({
        complete: data.complete,
        streak: data.streak,
        percent: data.percent,
        timesCompleted: data.timesCompleted,
    })

})
//adding a task to the user's task list. 
exports.addTask = functions.https.onCall((data, context) => {
    //console.log("adding task", data.newTaskName);
    let addTask = admin.firestore().collection('users').doc(context.auth.uid).collection('tasks').add({
        complete: false,
        dateAdded: admin.firestore.Timestamp.fromDate(new Date()),
        name: data.newTaskName
    })

    return null;
});

//removing a task from the user's task list
exports.removeTask = functions.https.onCall((data, context) => {
    admin.firestore().collection('users').doc(context.auth.uid).collection('tasks').doc(data.id).delete()
})

//toggling completing tasks. 
exports.completeTask = functions.https.onCall((data, context) => {

    //Awards xp for completion and takes away if marked incomplete.
    if (data.complete) {
        addXP(context, 25);
    }
    else {
        addXP(context, -25);
    }

    //log data in database
    return admin.firestore().collection('users').doc(context.auth.uid).collection('tasks').doc(data.id).update({
        complete: data.complete
    })

})


//the function in charge of getting new data from rescuetime and sending it back to the frontend to be rendered.
exports.updateRTData = functions.https.onCall(async (data, context) => {

    //the main task being completed. Get the data from today with the user's api key.
    return getRTData(getTodayDate(), await getrtKey());

    //actually fetching the data from the RT API
    async function getRTData(date, key) {
        return fetch(`https://www.rescuetime.com/anapi/data?key=${key}&perspective=interval&restrict_kind=efficiency&interval=hour&restrict_begin=${date}&format=json`)
            .then(res => res.json())
            //data it gets in response is turned into readable json and given to resolveData for parsing
            .then(json => resolveData(json));

    }

    //formatting today's date in a way that can be read by the RT API
    function getTodayDate() {

        //start by making a date with the date and time of right now
        var today = new Date();

        //getting the month and date in the format 00 (ex: April 10 -> 04 10)
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0');
        //getting the year
        var yyyy = today.getFullYear();

        //putting it all together with dashes in between
        let todayFormatted = yyyy + '-' + mm + '-' + dd;
        return (todayFormatted);
    }

    async function getrtKey() {

        //get the user's RescueTime API key so that it can be used to fetch their data
        let rtKey;
        const userRef = admin.firestore().collection('users').doc(context.auth.uid)
        const getRef = await userRef.get()
            .then(ref => {
                return ref.data()
            })
            .then(data => {

                rtKey = data.rtKey;
                return data.rtKey;
            });
        return rtKey;
    }




    function resolveData(result) {

        //Each row of the json result has the info for one chunk of time
        let rows;
        let rtData = [];
        rows = result.rows;

        //look through each row and add the data contained in it into a log object.
        //rtData ends up as a list of log
        rows.forEach(element => {

            let log = {
                //grabbing these fields directly from the json
                date: element[0],
                //time gets converted from seconds to minutes and rounded to the nearest 100th
                time: Math.round(element[1] / 60 * 100) / 100,
                eNum: element[3],
                eEff: element[4],
            }

            //score is caluculated from a combitation of the effiency number [-2, 2] and time spent
            log.score = Math.round(log.time * log.eNum / 2 * 100) / 100;

            //xp is a function of score
            log.xp = Math.round(log.score / 5 * 100) / 100;

            //add current log object to our list of rtData
            rtData.push(log);
        });

        //now take all that data and actually add it to the database!
        return addData(rtData);
    }

    function addData(data) {

        //first, get a reference to the place you want to store the data
        const rescueTime = admin.firestore().collection('users').doc(context.auth.uid).collection('rescueTime');

        //sort that list by descending date in order to get the latest entry
        const ref = rescueTime.orderBy('date', 'desc');
        return ref.limit(1).get()
            .catch(error => console.log(error))
            .then((rescueTime) => {

                //even though we only want one entry, it still gets returned to us in a list format

                let dataArray = [];

                //looking at that single entry in the returned list 
                rescueTime.forEach((data) => {
                    let thisData = data.data();
                    //getting all the data about it
                    dataArray.push({
                        date: thisData.date,
                        eEff: thisData.eEff,
                        eNum: thisData.eNum,
                        score: thisData.score,
                        time: thisData.time,
                        xp: thisData.xp,
                        id: data.id
                    })
                })

                //now we have the latest entry that currently exists in our database
                //forwanding it to the next part as a single object, no longer a list
                return (dataArray[0]);

            })
            .then(latestEntry => {
                //latestEntry refers to dataArray[0] from above.

                //firestore keeps things in it's own format called Timestamp. We want to convert it back to a useable date.
                let latestEntryDate = latestEntry.date.toDate();
                let dataArray = [];

                let blank = true;

                //data here refers to the new rescuetime data that we went and fetched earlier
                //here we are looking for any data which doesn't already exist in our database.
                data.forEach(data => {

                    //only care about the new rescuetime data if more than 5m of activity have been logged. Discard it otherwise.
                    if (data.time > 5) {

                        //Pro tip: Working with dates and timezones on the internet sucks. 0/10 do not reccommend doing

                        //this section here is done so we can compare the latest entry on our server to the data coming in and only add new data
                        //first we have to convert the local time of the data from rescue time into the UCT that the server uses

                        //get the new rescuetime date
                        let targetTime = new Date(data.date);

                        //time zone value from database
                        let timeZoneFromDB = -7.00;

                        //get the timezone offset from local time in minutes
                        let tzDifference = timeZoneFromDB * 60 + targetTime.getTimezoneOffset();

                        //convert the offset to milliseconds, add to targetTime, and make a new Date
                        //now we are working with both the rescuetime data and the server data in the same time zone and format
                        let offsetTime = new Date(targetTime.getTime() - (tzDifference * 60 * 1000));


                        //in the very first rescuetime data point we look at, check if more than an hour has passed since the latest entry in our database
                        if (blank && offsetTime.getTime() - latestEntryDate.getTime() > 3610000) {

                            //if yes, add a new entry to our database with a timestamp just after our latest database entry, but give it no data to display
                            //this allows chart.js to make a gap in the line graph every time there is a missing hourly time stamp. Otherwise it will draw a continuous line.
                            rescueTime.add({
                                date: admin.firestore.Timestamp.fromDate(new Date(latestEntryDate.getTime() + 1000))
                            });

                        }
                        //after the first RT data point, set blank to false. We don't need to add any more gaps.
                        blank = false;

                        //Now check if we already have something in our database for the exact time we are looking at. 
                        //if we do have this, it means more recent data has come in for that hour chunk, and we should update what we have. 
                        if (offsetTime.getTime() === latestEntryDate.getTime()) {
                            //console.log("updating timeframe: ", latestEntry.date.toDate());
                            data.date = admin.firestore.Timestamp.fromDate(offsetTime);
                            dataArray.push(data);

                            //don't forget to award the difference in XP between the older data and the new stuff coming in!
                            addXP(context, (data.xp - latestEntry.xp));
                            rescueTime.doc(latestEntry.id).update(data);

                        }

                        //Okay, now grab any of the remaining new data and just plainly add it into our database.
                        if (offsetTime > latestEntry.date.toDate()) {
                            data.date = admin.firestore.Timestamp.fromDate(offsetTime);
                            dataArray.push(data);
                            rescueTime.add(data);
                            addXP(context, data.xp);
                        }
                    }
                })


                return null;
            });


    }
});
