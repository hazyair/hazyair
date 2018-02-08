/*global dweetio*/

function handler(dweet) {

    Object.keys(dweet.content).forEach(function(parameter) {
        document.getElementById(parameter).innerHTML = dweet.content[parameter];
        if (parameter === 'PM2.5Concentration' && parseInt(dweet.content[parameter], 10) > 25) {
            document.getElementById(parameter+'Text').className = 'hazyair-alert';
        } else if (parameter === 'PM10Concentration' && parseInt(dweet.content[parameter], 10) > 50) {
            document.getElementById(parameter+'Text').className = 'hazyair-alert';
        } else {
            document.getElementById(parameter+'Text').className = 'hazyair-result';
        }
    });
    
}

dweetio.get_latest_dweet_for('25935C0E2C7F42558309E27E216C1D65', function(error, dweet) {

    if (error) return;
    dweet = dweet[0];
    handler(dweet);

});

dweetio.listen_for('25935C0E2C7F42558309E27E216C1D65', handler);