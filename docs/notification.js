/*global clients*/

// According to https://developer.mozilla.org/pl/docs/Web/API/Window/self only self will function in workers. 
self.addEventListener('notificationclick', function(event) {

    switch(event.action) {
        case 'hazyair':
            // This looks to see if the current is already open and
            // focuses if it is
            event.waitUntil(clients.matchAll({
                type: "window"
            }).then(function(clientList) {
                console.log(clientList);
                for (var i = 0; i < clientList.length; i++) {
                var client = clientList[i];
                if (client.url == '/hazyair' && 'focus' in client)
                    return client.focus();
                }
                if (clients.openWindow)
                    return clients.openWindow('/hazyair');
            }));        
        case 'dismiss':
        default: event.notification.close();
    }

});