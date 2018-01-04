
function hazy(param) {
	
	document.getElementById('day').style['font-weight'] = 'normal';
	document.getElementById('week').style['font-weight'] = 'normal';
	document.getElementById('month').style['font-weight'] = 'normal';
	document.getElementById('year').style['font-weight'] = 'normal';
	document.getElementById(param).style['font-weight'] = 'bold';
	document.getElementById('day').style.color = '#aaa';
	document.getElementById('week').style.color = '#aaa';
	document.getElementById('month').style.color = '#aaa';
	document.getElementById('year').style.color = '#aaa';
	document.getElementById(param).style.color = '#000';
	
	fetch('hazy/api/last?'+param)
    .then((resp) => resp.json()) // Transform the data into json
    .then(function(data) {
    	let x = ['x'];
        let pm10 = ['PM 1.0'];
        let pm25 = ['PM 2.5'];
        let pm100 = ['PM 10'];
        let pm10average = 0;
        let pm25average = 0;
        let pm100average = 0;
        for (let i = 0; i < data.length; i ++) {
        	let record = data[i];
	        x.push(record.timestamp);
        	pm10.push(record['concentration_pm1.0_normal'].value);
        	pm25.push(record['concentration_pm2.5_normal'].value);
        	pm100.push(record.concentration_pm10_normal.value);
			pm10average += record['concentration_pm1.0_normal'].value;
			pm25average += record['concentration_pm2.5_normal'].value;
			pm100average += record.concentration_pm10_normal.value;
        }
        pm10average = Math.round(pm10average/data.length);
        pm25average = Math.round(pm25average/data.length);
        pm100average = Math.round(pm100average/data.length);
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
                		{value: 25, text: 'PM 2.5 Limit (25)', position: 'start'},
                		{value: 50, text: 'PM 10 Limit (50)', position: 'start'},
                		{value: pm25average, text: 'PM 2.5 Average ('+pm25average+')', position: 'middle'},
                		{value: pm100average, text: 'PM 10 Average ('+pm100average+')', position: 'middle'},
                		{value: pm10average, text: 'PM 1.0 Average ('+pm10average+')', position: 'middle'}
            		]
        		}
    		}
		});
    })
    .catch(function(error) {
    });
}

hazy('day');
