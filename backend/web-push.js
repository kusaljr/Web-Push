const webpush = require("web-push");
const {
  VAPID_PRIVATE_KEY,
  VAPID_PUBLIC_KEY,
  VAPID_SUBJECT,
} = require("./constants");

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

class WebPushService {
  static async sendNotificationToUser(
    user,
    notification,
    config = {
      topic: null,
      urgency: "normal",
    }
  ) {
    try {
      if (!user) {
        throw new BadRequestError("User not found");
      }
      const subscription = await WebPushSubscriptionRepository.getByUser(user);
      if (!subscription) {
        throw new BadRequestError("User not subscribed to web push");
      }
      const payload = JSON.stringify({
        title: notification.title,
        body: notification.body,
        icon: notification.icon,
      });
      const options = {
        TTL: 60,
        topic: config.topic,
        urgency: config.urgency,
      };
      webpush.sendNotification(subscription, payload, options);
    } catch (err) {
      console.error(err);
    }
  }
}

module.exports = WebPushService;
