if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(function(registration) {
            console.log('Service Worker registrado com sucesso:', registration);
            askNotificationPermission();
        })
        .catch(function(error) {
            console.error('Falha ao registrar o Service Worker:', error);
        });
}

function askNotificationPermission() {
    Notification.requestPermission().then(function(permission) {
        if (permission === 'granted') {
            console.log('Permissão para notificações concedida.');
            subscribeUser ToPush();
        } else {
            console.log('Permissão para notificações negada.');
        }
    });
}

function subscribeUser ToPush() {
    navigator.serviceWorker.ready.then(function(registration) {
        const applicationServerKey = urlB64ToUint8Array('<YOUR_PUBLIC_VAPID_KEY>');
        registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey
        }).then(function(subscription) {
            console.log('Usuário inscrito para notificações push:', subscription);
            // Aqui você pode enviar a inscrição para o seu servidor para enviar notificações
        }).catch(function(error) {
            console.error('Falha ao se inscrever para notificações push:', error);
        });
    });
}

// Função para converter a chave VAPID
function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
}
