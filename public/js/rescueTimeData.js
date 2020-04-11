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
    //addData(rtData);
    //console.log(rtData[0]);
}



async function getRTData(date, key) {
    let prefix = "https://cors-anywhere.herokuapp.com/"
    let rt_URL = "https://www.rescuetime.com/anapi/data?";
    return await fetch(prefix + rt_URL + `key=${key}&perspective=interval&restrict_kind=efficiency&interval=minute&format=json&restrict_begin=` + date)
        .then((response) => {
            return response.json();
        }).then(function (result) {
            resolveData(result);
        })
}


function getTodayDate() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    let todayFormatted = yyyy + '-' + mm + '-' + dd;
    return (todayFormatted);
}

getRTData(getTodayDate(), "B63GZAGYqzgIMd4sQ_7NoIRbKHxSQZtd8w1SV3GG");


