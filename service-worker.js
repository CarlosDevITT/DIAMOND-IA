// service-worker.js

self.addEventListener('push', function(event) {
    const data = event.data ? event.data.json() : { title: 'Notificação sem título', body: 'Você não recebeu um corpo de notificação.' };

    const options = {
        body: data.body,
        icon: 'assets/avatar.png',
        badge: 'assets/badge.png',
        vibrate: [100, 50, 100],
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});