import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { doc, updateDoc } from "firebase/firestore";
import app, { db } from "../firebase/config";

const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

export const requestNotificationPermission = async (userId?: string) => {
  if (!messaging) return;

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'BFpEJN9QkRrccYxkaLYpZXClev0Hvn4v8g8YlWneLxK8388SlkmzMsfGzx9Lw70_2b8Nvhq_fs3dBNM0135ZQ5I'
      });
      
      if (userId && token) {
        await updateDoc(doc(db, 'users', userId), {
          fcmToken: token,
          updatedAt: new Date().toISOString()
        });
      }
      
      console.log('✅ Notificações configuradas com sucesso.');
      return token;
    } else if (permission === 'denied') {
      console.warn('❌ Permissão de notificação negada pelo usuário.');
    }
  } catch (error) {
    console.error('⚠️ Erro ao configurar notificações:', error);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) return;
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
