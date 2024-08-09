import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { LuDot } from "react-icons/lu";
import moment from "moment";
import Link from "next/link";

function CustomToast({ myId }) {
  const [notifications, setNotifications] = useState([]);

  const formatTimeAgo = (timestamp) => {
    const date = timestamp?.toDate();
    const momentDate = moment(date);
    return momentDate.fromNow();
  };
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!myId) {
        console.error("User ID is not provided");
        return;
      }

      try {
        // Fetch the notification document for the current user
        const notificationRef = doc(firestore, "notifications", myId);
        const notificationDoc = await getDoc(notificationRef);

        if (notificationDoc.exists()) {
          const data = notificationDoc.data();
          // console.log("This is data:", data);

          if (data) {
            // Process the data and ensure it matches the expected structure
            const notificationsMap = data.notificationName || {};
            const notificationArray = Object.entries(notificationsMap).map(
              ([key, value]) => ({
                ...value,
                id: key,
              })
            );
            setNotifications(notificationArray);
          } else {
            console.warn("No notification data found for user");
          }
        } else {
          console.warn("No notification document found for user");
        }
      } catch (error) {
        console.error("Error fetching notifications:", error.message);
      }
    };

    fetchNotifications();
  }, [myId]);

  const updateNotificationStatus = async (notificationFrom) => {
    try {
      const notificationRef = doc(firestore, "notifications", myId);
      // Update the specific notification's status in the Firestore document
      await updateDoc(notificationRef, {
        [`notificationName.${notificationFrom}.status`]: false,
      });
      console.log("Notification status updated to false");
    } catch (error) {
      console.error("Error updating notification status:", error.message);
    }
  };

  useEffect(() => {
    // Update notification status after rendering
    notifications.forEach((notification) => {
      if (notification.status) {
        updateNotificationStatus(notification.from);
      }
    });
  }, [notifications]);
  const iconMessage = "💬";

  return (
    <Link href={`/consultation`}>
    <div className="flex flex-col space-y-2  ">
      {notifications.length > 0 &&
        notifications.map((notification, index) =>
          notification.status ? (
            <div
              key={index}
              className="flex items-center space-x-2 p-3 bg-slate-100 border-2 border-[#3db5ff] dark:bg-gray-800 shadow-lg rounded-lg mb-2 
              transition-transform transform hover:scale-105 w-96 max-w-full border-l-8"
              style={{
                borderLeft: '15px solid #3db5ff',
               // Rounded bottom left
              }}
            >
              <div
                className="flex items-center justify-center lg:w-12 lg:h-12 w-10 h-10 bg-[#3db5ff] rounded-2xl text-2xl"
                style={{
                  backgroundColor: "#3db5ff",
                }}
              >
                {iconMessage}
              </div>
              <div className="flex-1">
                <div className="flex flex-row w-full">
                  <div className=" flex flex-row gap-1 text-md w-full font-semibold dark:text-white">
                    <span className="">New</span>
                    {notification.type}{" "}
                    <span className="flex flex-row gap-1 text-md font-light">
                      {" "}
                      <LuDot /> {formatTimeAgo(notification.timestamp)}
                    </span>
                  </div>
                  <div className="px-1 flex flex-row"></div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  from {notification.fromName}
                </p>
                {/* Optional button to manually trigger status update */}
                {/* <button onClick={() => updateNotificationStatus(notification.from)}>
                  X
                </button> */}
              </div>
            </div>
          ) : null
        )}
    </div>
    </Link>
  );
}

export default CustomToast;
