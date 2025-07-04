const VAPID_PUBLIC_KEY = 'BKFxAExxrSCp3Uf7CcQOJNMvL3D82ZK6Hr01kFIfPC8srQ8JE_nRnWUz_2T3gQTpffpOOupMSc-jt3r6ns02VsU';
const api = 'https://eggplant.pcws.kr/wjbuses/back/api2.php';

async function registerServiceWorker() {
    return await navigator.serviceWorker.register('./sw.js');
}

async function subscribeUser() {
    const reg = await registerServiceWorker();
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') throw new Error('알림 권한을 허용해야 합니다.');

    const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    const subs = JSON.parse(JSON.stringify(sub));
    const form = new FormData();
    form.append('endpoint', subs.endpoint);
    form.append('p256dh', subs.keys.p256dh);
    form.append('auth', subs.keys.auth);

    const res = await fetch(`${api}?q=push&t=sub`, {
        method: 'POST',
        body: form
    });

    return res;
}

async function unsubscribeUser() {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    const subs = JSON.parse(JSON.stringify(sub));

    const form = new FormData();
    form.append('endpoint', subs.endpoint);

    if (sub) {
        await sub.unsubscribe();
        const res = await fetch(`${api}?q=push&t=unsub`, {
            method: 'POST',
            body: form
        });

        return res;
    }
}

async function checkSubscription() {
    if (!('serviceWorker' in navigator)) {
        console.warn('서비스워커 미지원 브라우저입니다.');
        return;
    }

    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();

    if (sub) {
        console.log('구독 중:', sub.endpoint);
        return true;
    }
    else {
        console.log('구독상태 아님');
        return false;
    }
}


function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

