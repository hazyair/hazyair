/*global clients*/

// According to https://developer.mozilla.org/pl/docs/Web/API/Window/self only self will function in workers. 
self.addEventListener('notificationclick', function(event) {

    switch(event.action) {
        case 'hazyair':
            // This looks to see if the current is already open and focuses if it is
            event.waitUntil(clients.matchAll({
                type: "window"
            }).then(function(clientList) {
                clientList.forEach(function(client) {
                    if (client.url == 'https://marcin-sielski.github.io/hazyair/' && 'focus' in client) {
                        return client.focus();
                    }
                });
                if (clients.openWindow) {
                    fetch('https://marcin-sielski.github.io/hazyair/').then(function (response) {
                        if (response.ok) {
                            return clients.openWindow('https://marcin-sielski.github.io/hazyair/');
                        }
                    });
                }
            }));
            break;
        case 'refresh':
            fetch('https://dweet.io/get/latest/dweet/for/25935C0E2C7F42558309E27E216C1D65').then(function(response) {
                return response.json();
            }).then(function(response) {
                if (response.this == 'succeeded') {
                    self.registration.getNotifications({ tag : 'hazyair-alert' }).then(function(notifications) {
                        notifications.forEach(function(notification) {
                            notification.close();
                        });
                        var pm2_5 = response.with[0].content['PM2.5Concentration'];
                        var pm10 = response.with[0].content['PM10Concentration'];
                        var title = 'Air quality is fine.';
                        var pattern = [];
                        if (pm2_5 > 25 || pm10 > 50) {
                            title = 'Air quality standards exceeded!';
                            pattern = [200];
                        }
                        self.registration.showNotification(title, {
                            actions: [
                                { action: 'hazyair', title: 'hazyair' },
                                { action: 'refresh', title: 'refresh' }
                            ],
                            body: 'PM2.5: ' + pm2_5*4 + '%   PM10: ' + pm10*2 + '%',
                            icon: 'favicon.ico',
                            vibrate: pattern,
                            tag: 'hazyair-alert'
                        });

                    });
                }
            });
            break;
        default:
            event.notification.close();
    }
    

});