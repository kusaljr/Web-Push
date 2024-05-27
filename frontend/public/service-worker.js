self.addEventListener("push", (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: "path/to/icon.png", // Update with your actual icon path
    badge: "path/to/badge.png", // Update with your actual badge path
  };

  event.waitUntil(self.registration.showNotification(data.title, options));

  // Send a message to the client
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: "push",
        payload: data,
      });
    });
  });
});
