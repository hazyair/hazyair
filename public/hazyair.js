let gTypes;
let gType;
let gPeriod = 'day';

function hazyair(type, period) {
    
    if (type === null) {
        type = gType;
    } else {
        gType = type;
    }
    if (period === null) {
        period = gPeriod;
    } else {
        gPeriod = period;
    }
    
    
    gTypes.forEach((type) => {
        document.getElementById(type).style['font-weight'] = 'normal';
    });
    document.getElementById(type).style['font-weight'] = 'bold';
    gTypes.forEach((type) => {
        document.getElementById(type).style.color = '#aaa';
    });
    document.getElementById(type).style.color = '#000';

    document.getElementById('day').style['font-weight'] = 'normal';
    document.getElementById('week').style['font-weight'] = 'normal';
    document.getElementById('month').style['font-weight'] = 'normal';
    document.getElementById('year').style['font-weight'] = 'normal';
    document.getElementById(period).style['font-weight'] = 'bold';
    document.getElementById('day').style.color = '#aaa';
    document.getElementById('week').style.color = '#aaa';
    document.getElementById('month').style.color = '#aaa';
    document.getElementById('year').style.color = '#aaa';
    document.getElementById(period).style.color = '#000';
    
    if (type === 'dust') {
    
        let pm100limit = 50;
        let pm25limit = 25;
        if (period === 'year') {
            pm100limit = 20;
            pm25limit = 10;
        }

    
        fetch('hazyair/dust/last?'+period)
            .then((resp) => resp.json()) // Transform the data into json
            .then(function(data) {
                let x = ['x'];
                let pm10 = ['PM 1.0'];
                let pm25 = ['PM 2.5'];
                let pm100 = ['PM 10'];
                let pm10mean = 0;
                let pm25mean = 0;
                let pm100mean = 0;
                data.forEach((record) => {
                    x.push(record.timestamp);
                    pm10.push(record['concentration_pm1.0_normal'].value);
                    pm25.push(record['concentration_pm2.5_normal'].value);
                    pm100.push(record.concentration_pm10_normal.value);
                    pm10mean += record['concentration_pm1.0_normal'].value;
                    pm25mean += record['concentration_pm2.5_normal'].value;
                    pm100mean += record.concentration_pm10_normal.value;
                });
                pm10mean = Math.round(pm10mean/data.length);
                pm25mean = Math.round(pm25mean/data.length);
                pm100mean = Math.round(pm100mean/data.length);
                var chart = c3.generate({
                    bindto: '#chart',
                    data: {
                        x: 'x',
                        columns: [
                            x,
                            pm10,
                            pm25,
                            pm100
                        ],
                    },
                    axis: {
                        x: {
                            type: 'timeseries',
                            tick: {
                                format: '%H:%M %d-%m-%Y',
                                rotate: 15
                            },
                            label: 'time'
                        },
                        y: {
                            label: 'µg/m^3'
                        }
                    },
                    subchart: {
                        show: true
                    },
                    size: {
                        height: 480
                    },
                    grid: {
                        y: {
                            lines: [
                                { value: pm25limit, text: 'PM 2.5 Limit ('+pm25limit+')', position: 'start' },
                                { value: pm100limit, text: 'PM 10 Limit ('+pm100limit+')', position: 'start' },
                                { value: pm25mean, text: 'PM 2.5 Mean ('+pm25mean+')', position: 'middle' },
                                { value: pm100mean, text: 'PM 10 Mean ('+pm100mean+')', position: 'middle' },
                                { value: pm10mean, text: 'PM 1.0 Mean ('+pm10mean+')', position: 'middle' }
                            ]
                        }
                    }
                });
            })
            .catch(function(error) {
            });
    }
}


fetch('hazyair/info')
    .then((resp) => resp.json()) // Transform the data into json
    .then(function(data) {
        document.getElementById('type').innerHTML = '<th>Chart type:</th>';
        data.forEach((type) => {
            document.getElementById('type').innerHTML +=
                '<td id="'+type+'" class="hazyair-link" onclick="hazyair(this.id, null)">'+type+'</td>';    
        });
        gTypes = data;
        gType = gTypes[0];
        hazyair(gType, gPeriod);
    })
    .catch(function(error) {
    });

