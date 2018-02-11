window.self.addEventListener('notificationclick', function(event) {
    switch(event.action) {
        case 'dismiss':
        default: event.notification.close();
    }
});