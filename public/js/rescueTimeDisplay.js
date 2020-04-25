
//the html element where we will
var ctx = document.getElementById('rt-chart').getContext('2d');

var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',


    //creating settings for each of the lines we want to draw
    data: {
        labels: [],
        datasets: [
            {
                label: 'Score',
                backgroundColor: 'rgb(255,255,255,0)',
                borderColor: 'rgb(0, 200, 132)',
                data: [],
                
            },
            {
                label: 'XP Earned',
                backgroundColor: 'rgb(255,255,255,0)',
                borderColor: 'rgb(255, 225, 0)',
                data: [],
                hidden: true
            }, 
            {
                label: 'Efficiency',
                backgroundColor: 'rgb(255,255,255,0)',
                borderColor: 'rgb(255, 99, 132)',
                data: [],
                hidden: true
            },
            {
                label: 'Time (minutes)',
                backgroundColor: 'rgb(255,255,255,0)',
                borderColor: 'rgb(0, 160, 255)',
                data: [],
                hidden: true
            }]

    },

    // Configuration options go here
    options: {
        scales: {
            xAxes: [{
                type: 'time',
                time: {
                    //format for how the time should be displayed
                    parser: "HH:mm",
                    unit: 'hour',
                    //show the last 12 hours on the time scale
                    min: moment().subtract(12, 'h'),
                    //show one hour in the future (to give some space on right hand side)
                    max: moment().add(1, 'h'),
                    displayFormats: {
                        'minute': 'HH:mm',
                        'hour': 'HH:mm',
                    },
                }
            }]
        },
        tooltips: {
            mode: 'index'
        }
    }
});

//taking a list of data points as objects and separating them out into their separate lines
function displayRTGraph(rtData) {
    let label = [];
    let eff = [];
    let score = [];
    let time = [];
    let xp = [];

    rtData.forEach((section) => {
        label.push(moment(section.date.toDate()));
        eff.push(section.eEff);
        time.push(section.time);
        score.push(section.score);
        xp.push(Math.round(section.xp * 100) / 100);
    });

    chart.data.datasets[0].data = score;
    chart.data.datasets[1].data = xp;
    chart.data.datasets[2].data = eff;
    chart.data.datasets[3].data = time;

    chart.data.labels = label;
    chart.update();
}


