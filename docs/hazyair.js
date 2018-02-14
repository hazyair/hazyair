/*global Notification*/
/*global navigator*/
function notification(pm2_5, pm10) {

    Notification.requestPermission(function(result) {
        if (result === 'granted') {
            if ('serviceWorker' in navigator) {
                // Register a service worker hosted at the root of the
                // site using the default scope.
                navigator.serviceWorker.register('notification.js').then(function(registration) {
                    registration.getNotifications({ tag : 'hazyair-alert' }).then(function(notifications) {
                        notifications.forEach(function(notification) {
                            notification.close();
                        });
                        if (pm2_5 > 25 || pm10 > 50) {
                            registration.showNotification('Air quality standards exceeded!', {
                                actions: [
                                    { action: 'details', title: 'details' },
                                    { action: 'refresh', title: 'refresh' }
                                ],
                                body: 'PM2.5: ' + pm2_5*4 + '%   PM10: ' + pm10*2 + '%',
                                icon: 'favicon.ico',
                                vibrate: [200],
                                tag: 'hazyair-alert'
                            });
                        }
                    });
                }).catch(function(error) {
                    console.log('Service worker registration failed:', error);
                });
            } else {
                console.log('Service workers are not supported.');
            }
        }
    });    

}

function handleAlert(dweet, parameter, output) {

    document.getElementById(parameter).innerHTML = dweet.content[parameter];
    var value = parseInt(dweet.content[parameter], 10);
    document.getElementById(parameter+'Text').className = 'hazyair-result';
    if (parameter === 'PM2.5Concentration') {
        if (value > 25) {
            document.getElementById(parameter+'Text').className = 'hazyair-alert';
        }
        output.pm2_5 = value;
    } else if (parameter === 'PM10Concentration') {
        if (value > 50) {
            document.getElementById(parameter+'Text').className = 'hazyair-alert';
        }
        output.pm10 = value;
    }

}

function listenHandler(dweet) {

    var result = {};
    Object.keys(dweet.content).forEach(function(parameter) {
        handleAlert(dweet, parameter, result);
    });
    notification(result.pm2_5, result.pm10);
    
}

function latestHandler(error, dweet) {

    if (error) return;
    dweet = dweet[0];

    listenHandler(dweet);

}

function visibleHandler(error, dweet) {

    if (error) return;
    dweet = dweet[0];

    var result = {};
    Object.keys(dweet.content).forEach(function(parameter) {
        handleAlert(dweet, parameter, result);
        document.getElementById(parameter+'Chart').src += '';
    });
    notification(result.pm2_5, result.pm10);
    
}

var gTimeout;

/*global dweetio*/
function handleVisibilityChange() {

    if (document.visibilityState == "hidden") {
        gTimeout = new Date();
    } else {
        if (new Date().getHours() > gTimeout.getHours()) {
            dweetio.get_latest_dweet_for('25935C0E2C7F42558309E27E216C1D65', visibleHandler);
            dweetio.get_latest_dweet_for('D47A7D484C1A41D2A1C33CDCBB9936ED', visibleHandler);
        }
    }

}

var gDays = 0;

function handleResize() {

    var days = 7;
    if (document.body.offsetWidth < 1020) {
        days = 3;
    }
    if (gDays != days) {
        document.getElementById('PM1.0ConcentrationChart').src = 'https://thingspeak.com/channels/418257/charts/1?bgcolor=%23ffffff&color=%23d62020&dynamic=true&results=8000&title=PM1.0+Concentration&type=line&yaxis=%C2%B5g%2Fm%5E3&width=auto&height=auto&days='+days;
        document.getElementById('PM2.5ConcentrationChart').src = 'https://thingspeak.com/channels/418257/charts/2?bgcolor=%23ffffff&color=%23d62020&dynamic=true&results=8000&title=PM2.5+Concentration&type=line&yaxis=%C2%B5g%2Fm%5E3&width=auto&height=auto&days='+days;
        document.getElementById('PM10ConcentrationChart').src = 'https://thingspeak.com/channels/418257/charts/3?bgcolor=%23ffffff&color=%23d62020&dynamic=true&results=8000&title=PM10+Concentration&type=line&yaxis=%C2%B5g%2Fm%5E3&width=auto&height=auto&days=' + days;
        document.getElementById('InsideTemperatureChart').src = 'https://thingspeak.com/channels/418257/charts/4?bgcolor=%23ffffff&color=%23d62020&dynamic=true&results=8000&title=Inside+Temperature&type=line&yaxis=%C2%B0C&width=auto&height=auto&days=' + days;
        document.getElementById('InsidePressureChart').src = 'https://thingspeak.com/channels/418257/charts/5?bgcolor=%23ffffff&color=%23d62020&dynamic=true&results=8000&title=Inside+Pressure&type=line&yaxis=hPa&width=auto&height=auto&days=' + days;
        document.getElementById('InsideHumidityChart').src = 'https://thingspeak.com/channels/418257/charts/6?bgcolor=%23ffffff&color=%23d62020&dynamic=true&results=8000&title=Inside+Humidity&type=line&yaxis=%25&width=auto&height=auto&days=' + days;
        document.getElementById('OutsideTemperatureChart').src = 'https://thingspeak.com/channels/418257/charts/7?bgcolor=%23ffffff&color=%23d62020&dynamic=true&results=8000&title=Outside+Temperature&type=line&yaxis=%C2%B0C&width=auto&height=auto&days=' + days;
        gDays = days;
    }

}

window.addEventListener('load', function () {

    dweetio.get_latest_dweet_for('25935C0E2C7F42558309E27E216C1D65', latestHandler);
    dweetio.listen_for('25935C0E2C7F42558309E27E216C1D65', listenHandler);

    dweetio.get_latest_dweet_for('D47A7D484C1A41D2A1C33CDCBB9936ED', latestHandler);
    dweetio.listen_for('D47A7D484C1A41D2A1C33CDCBB9936ED', listenHandler);


    document.addEventListener('visibilitychange', handleVisibilityChange, false);
    window.addEventListener('resize', handleResize, false);

    handleResize();

});
