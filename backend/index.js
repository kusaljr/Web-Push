const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const webpush = require("web-push");
var bodyParser = require("body-parser");

const { VAPID_PRIVATE_KEY, VAPID_PUBLIC_KEY } = require("./constants");

const app = express();

app.use(cors());

app.use(bodyParser.json());

// Create an HTTP server
const server = http.createServer(app);

const PORT = 3000;

webpush.setVapidDetails(
  "mailto:kusal.lamshal@gmail.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

const subscriptions = []; // Declare the subscriptions array here
const userSubscriptions = {};

app.post("/subscribe", (req, res) => {
  const { userId, subscription } = req.body;
  userSubscriptions[userId] = subscription;

  console.log(userSubscriptions);
  res.status(201).json({ message: "Subscription added successfully" });
});

app.post("/send-notification", (req, res) => {
  const { userId, notificationPayload } = req.body;
  const subscription = userSubscriptions[userId];

  if (!subscription) {
    return res.status(404).json({ message: "Subscription not found" });
  }

  webpush
    .sendNotification(subscription, JSON.stringify(notificationPayload))
    .then(() =>
      res.status(200).json({ message: "Notification sent successfully" })
    )
    .catch((error) => {
      console.error("Error sending notification:", error);
      res.sendStatus(500);
    });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
