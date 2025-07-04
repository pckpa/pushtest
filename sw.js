self.addEventListener('push', event => {
    const data = event.data?.json() || {};
    event.waitUntil(
        self.registration.showNotification(data.title || '알림', {
            body: data.body || '',
            icon: data.icon || '/favicon.png'
        })
    );
});