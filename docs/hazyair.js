/*global dweetio*/
/*global navigator*/

function listenHandler(dweet) {

    Object.keys(dweet.content).forEach(function(parameter) {
        document.getElementById(parameter).innerHTML = dweet.content[parameter];
        if (parameter === 'PM2.5Concentration' && parseInt(dweet.content[parameter], 10) > 25) {
            document.getElementById(parameter+'Text').className = 'hazyair-alert';
            navigator.vibrate(200);
        } else if (parameter === 'PM10Concentration' && parseInt(dweet.content[parameter], 10) > 50) {
            document.getElementById(parameter+'Text').className = 'hazyair-alert';
            navigator.vibrate(200);
        } else {
            document.getElementById(parameter+'Text').className = 'hazyair-result';
        }
    });
    
}

function latestHandler(error, dweet) {
    if (error) return;
    dweet = dweet[0];
    listenHandler(dweet);
}

dweetio.get_latest_dweet_for('25935C0E2C7F42558309E27E216C1D65', latestHandler);

dweetio.listen_for('25935C0E2C7F42558309E27E216C1D65', listenHandler);

dweetio.get_latest_dweet_for('D47A7D484C1A41D2A1C33CDCBB9936ED', latestHandler);

dweetio.listen_for('D47A7D484C1A41D2A1C33CDCBB9936ED', listenHandler);
