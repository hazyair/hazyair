var gTypes;
var gType;
var gPeriod = 'day';

function uppercase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function round(value, decimals) {
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
    
    gTypes.forEach(function(type) {
        document.getElementById(type.parameter).className = 'hazyair-link';
    });
    document.getElementById(type).className = 'hazyair-link-active';

    document.getElementById('day').className = 'hazyair-link';
    document.getElementById('week').className = 'hazyair-link';
    document.getElementById('month').className = 'hazyair-link';
    document.getElementById('year').className = 'hazyair-link';
    document.getElementById(period).className = 'hazyair-link-active';
    
    if (type === 'dust') {
    
        document.getElementById('title').innerHTML = 'Dust concentration chart during last';
        var pm100limit = 50;
        var pm25limit = 25;
        if (period === 'year') {
            pm100limit = 20;
            pm25limit = 10;
        }

        fetch('hazyair/dust/last?'+period)
            .then(function(res) {
                return res.json();
            })
            .then(function(data) {
                var x = ['x'];
                var pm10 = ['PM 1.0'];
                var pm25 = ['PM 2.5'];
                var pm100 = ['PM 10'];
                var pm10mean = 0;
                var pm25mean = 0;
                var pm100mean = 0;
                data.forEach(function(record) {
                    x.push(record.timestamp);
                    pm10.push(record['concentration_pm1.0_normal'].value);
                    pm25.push(record['concentration_pm2.5_normal'].value);
                    pm100.push(record.concentration_pm10_normal.value);
                    pm10mean += record['concentration_pm1.0_normal'].value;
                    pm25mean += record['concentration_pm2.5_normal'].value;
                    pm100mean += record.concentration_pm10_normal.value;
                });
                pm10mean = round(pm10mean/data.length, 0);
                pm25mean = round(pm25mean/data.length, 0);
                pm100mean = round(pm100mean/data.length, 0);
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
            .catch(function(err) {
                document.getElementById("chart").innerHTML = err;
            });
            
    } else {
        
        document.getElementById('title').innerHTML = uppercase(type) +' chart during last';
        
        fetch('hazyair/'+type+'/last?'+period)
            .then(function(res) {
                return res.json();
            })
            .then(function(data) {
                var x = ['x'];
                var serie = [uppercase(type)];
                var mean = 0;
                var precision = 0;
                data.forEach(function(record) {
                    x.push(record.timestamp);
                    serie.push(record[type].value);
                    mean += record[type].value;
                });
                if (type == 'temperature') {
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
                            label: data[0][type].unit
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
                                { value: mean, text: uppercase(type) + ' Mean ('+mean+')', position: 'middle' }
                            ]
                        }
                    }
                });
            })
            .catch(function(err) {
                document.getElementById("chart").innerHTML = err;
            });
    }
}

try {

    fetch('hazyair/info')
        .then(function(res) {
            return res.json();
        })
        .then(function(data) {
            document.getElementById("type").innerHTML = '<th>Chart type:</th>';
            gTypes = data;
            gTypes.forEach(function(type) {
                document.getElementById("type").innerHTML +=
                '<td id="'+type.parameter+'" class="hazyair-link" onclick="hazyair(this.id, null)">'+type.parameter+'</td>';
            });
            gType = gTypes[0].parameter;
            hazyair(gType, gPeriod);
        })
        .catch(function (err) {
            document.getElementById("chart").innerHTML = err;
        });

} catch (err) {

    document.getElementById("chart").innerHTML = err;

}
