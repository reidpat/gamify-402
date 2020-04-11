var ctx = document.getElementById('rt-chart').getContext('2d');

var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',


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
                    parser: "HH:mm",
                    unit: 'hour',
                    min: moment().subtract(12, 'h'),
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
        xp.push(section.xp);
    });

    chart.data.datasets[0].data = score;
    chart.data.datasets[1].data = xp;
    chart.data.datasets[2].data = eff;
    chart.data.datasets[3].data = time;

    chart.data.labels = label;
    chart.update();
}


