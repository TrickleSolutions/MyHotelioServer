const NotificationSystem = require("../../../Controllers/notifications/newNotifications/NotificationSystem");
const { FindEventId } = require("../../../config/notificationEvents");

require("dotenv").config();

const NotificationsQueue = async (job) => {
  console.log(job.data);
  const eventCode = job.data.eventId;
  let eventId = await FindEventId(eventCode);
  if (eventId.error) return { error: true, message: eventId.message };
  await NotificationSystem.ManageNotification({
    data: job.data.data,
    eventId: eventId.data,
  });
};

module.exports = NotificationsQueue;
