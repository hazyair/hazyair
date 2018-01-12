let gTypes;
let gType;
let gPeriod = 'day';

function uppercase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function round(value, decimals = 0) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

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
        document.getElementById(type.parameter).style['font-weight'] = 'normal';
    });
    document.getElementById(type.parameter).style['font-weight'] = 'bold';
    gTypes.forEach((type) => {
        document.getElementById(type.parameter).style.color = '#aaa';
    });
    document.getElementById(type.parameter).style.color = '#000';

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
    
    if (type.parameter === 'dust') {
    
        document.getElementById('title').innerHTML = 'Dust concentration chart during last';
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
                pm10mean = round(pm10mean/data.length);
                pm25mean = round(pm25mean/data.length);
                pm100mean = round(pm100mean/data.length);
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
                                { value: pm25limit, text: 'PM 2.5 limit ('+pm25limit+')', position: 'start' },
                                { value: pm100limit, text: 'PM 10 limit ('+pm100limit+')', position: 'start' },
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
            
    } else {
        
        document.getElementById('title').innerHTML = uppercase(type.parameter) +' chart during last';
        
        fetch('hazyair/'+type.parameter+'/last?'+period)
            .then((resp) => resp.json()) // Transform the data into json
            .then(function(data) {
                let x = ['x'];
                let serie = [uppercase(type.parameter)];
                let mean = 0;
                let precision = 0;
                data.forEach((record) => {
                    x.push(record.timestamp);
                    serie.push(record[type.parameter].value);
                    mean += record[type.parameter].value;
                });
                if (type.parameter == 'temperature') {
                    precision = 1;
                }
                mean = round(mean/data.length, precision);
                var chart = c3.generate({
                    bindto: '#chart',
                    data: {
                        x: 'x',
                        columns: [
                            x,
                            serie,
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
                            tick: {
                                format: d3.format(".1f"),  
                            },
                            label: data[0][type.parameter].unit
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
                                { value: mean, text: uppercase(type.parameter) + ' Mean ('+mean+')', position: 'middle' }
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
        document.getElementById("type").innerHTML = '<th>Chart type:</th>';
        data.forEach((type) => {
            document.getElementById("type").innerHTML +=
            '<td id="'+type.parameter+'" class="hazyair-link" onclick="hazyair(this.id, null)">'+type.parameter+'</td>';
        });
        gTypes = data;
        gType = gTypes[0];
        hazyair(gType, gPeriod);
    })
    .catch(function(error) {
    });

