import axios from "axios";
import React, { useEffect } from "react";

const App: React.FC = () => {
  useEffect(() => {
    // generate random user id
    const userId = "RANDOM_USER_ID";
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          if (subscription) {
            const vapidPublicKey = "VAPID_PUBLIC_KEY";
            const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

            registration.pushManager
              .subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey,
              })
              .then((newSubscription) => {
                console.log("New subscription:", newSubscription);
                return axios.post("http://localhost:3000/subscribe", {
                  userId,
                  subscription: newSubscription,
                });
              });
          }
        });
      });

      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "push") {
          showNotification(event.data.payload);
        }
      });
    }

    if (Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        if (permission !== "granted") {
          console.log("Permission not granted for notifications");
        } else {
          console.log("Notification permission granted");
        }
      });
    } else {
      console.log("Notification permission:", Notification.permission);
    }
  }, []);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const showNotification = (payload: any) => {
    if (Notification.permission === "granted") {
      new Notification(payload.title, {
        body: payload.body,
        icon: "path/to/icon.png", // Update with your actual icon path
        badge: "path/to/badge.png", // Update with your actual badge path
      });
    }
  };

  return (
    <div>
      <h1>Hello World</h1>
    </div>
  );
};

export default App;
