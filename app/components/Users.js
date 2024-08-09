"use client";
import { useEffect, useState } from "react";
import { firestore, app } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  addDoc,
  serverTimestamp,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteField,
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import UsersCard from "./UsersCard";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

function Users({ userData, setSelectedChatroom }) {
  const [activeTab, setActiveTab] = useState("chatrooms");
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [users, setUsers] = useState([]);
  const [userChatrooms, setUserChatrooms] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationsArray, setNotificationsArray] = useState([]);
  const router = useRouter();
  const auth = getAuth(app);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };


  //get all users
  useEffect(() => {
    setLoading2(true);
    const tasksQuery = query(collection(firestore, "users"));

    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(users);
      setLoading2(false);
    });
    return () => unsubscribe();
  }, []);

  //get chatrooms
  useEffect(() => {
    setLoading(true);
    if (!userData?.id) return;
    const chatroomsQuery = query(
      collection(firestore, "chatrooms"),
      where("users", "array-contains", userData.id)
    );
    const unsubscribeChatrooms = onSnapshot(chatroomsQuery, (snapshot) => {
      const chatrooms = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLoading(false);
      setUserChatrooms(chatrooms);
    });

    // Cleanup function for chatrooms
    return () => unsubscribeChatrooms();
  }, [userData]);

  // Create a chatroom
  const createChat = async (user) => {
    // Check if a chatroom already exists for these users
    const existingChatroomsQuery = query(
      collection(firestore, "chatrooms"),
      where("users", "==", [userData.id, user.id])
    );

    try {
      const existingChatroomsSnapshot = await getDocs(existingChatroomsQuery);

      if (existingChatroomsSnapshot.docs.length > 0) {
        // Chatroom already exists, handle it accordingly (e.g., show a message)
        console.log("Chatroom already exists for these users.");
        toast.error("Chatroom already exists for these users.");
        return;
      }

      // Chatroom doesn't exist, proceed to create a new one
      const usersData = {
        [userData.id]: userData,
        [user.id]: user,
      };

      const chatroomData = {
        users: [userData.id, user.id],
        usersData,
        timestamp: serverTimestamp(),
        lastMessage: null,
      };

      const chatroomRef = await addDoc(
        collection(firestore, "chatrooms"),
        chatroomData
      );
      console.log("Chatroom created with ID:", chatroomRef.id);
      setActiveTab("chatrooms");
    } catch (error) {
      console.error("Error creating or checking chatroom:", error);
    }
  };

  //open chatroom
  const openChat = async (chatroom) => {
    const data = {
      id: chatroom.id,
      myData: userData,
      otherData:
        chatroom.usersData[chatroom.users.find((id) => id !== userData.id)],
    };
    setSelectedChatroom(data);

    try {
      // Fetch the notification document for the current user
      const notificationRef = doc(firestore, "notifications", userData.id);
      const notificationDoc = await getDoc(notificationRef);

      if (notificationDoc.exists()) {
        const data = notificationDoc.data();

        if (
          data &&
          data.notificationName &&
          data.notificationName[
            chatroom.usersData[chatroom.users.find((id) => id !== userData.id)]
              .id
          ]
        ) {
          // Create an update object to delete the specific notification
          const updateObj = {
            [`notificationName.${
              chatroom.usersData[
                chatroom.users.find((id) => id !== userData.id)
              ].id
            }`]: deleteField(),
          };

          // Update the document to delete the notification
          await updateDoc(notificationRef, updateObj);
          // console.log(
          //   `Notification ${
          //     chatroom.usersData[
          //       chatroom.users.find((id) => id !== userData.id)
          //     ]
          //   } deleted`
          // );

          // Update the local state to remove the deleted notification
          
        } else {
          console.warn("No such notification to delete");
        }
      } else {
        console.warn("No notification document found for user");
      }
    } catch (error) {
      console.error("Error deleting notifications:", error.message);
    }
  };

  const logoutClick = () => {
    signOut(auth)
      .then(() => {
        router.push("/login");
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  

  return (
    <div className="shadow-lg h-screen overflow-auto mt-4 mb-20">
      <div className="flex flex-col lg:flex-row justify-between p-4 space-y-4 lg:space-y-0">
        <button
          className={`btn btn-outline ${
            activeTab === "users" ? "btn-primary" : ""
          }`}
          onClick={() => handleTabClick("users")}
        >
          Users
        </button>
        <button
          className={`btn btn-outline ${
            activeTab === "chatrooms" ? "btn-primary" : ""
          }`}
          onClick={() => handleTabClick("chatrooms")}
        >
          Chatrooms
        </button>
        <button className={`btn btn-outline`} onClick={logoutClick}>
          Logout
        </button>
      </div>

      <div>
        {activeTab === "chatrooms" && (
          <>
            <h1 className="px-4 text-base font-semibold">Chatrooms</h1>
            {loading && (
              <div className="flex justify-center items-center h-full">
                <span className="loading loading-spinner text-primary"></span>
              </div>
            )}
            {userChatrooms.map((chatroom) => {
              const otherUserId = chatroom.users.find(
                (id) => id !== userData.id
              );
              return (
                <div
                  key={chatroom.id}
                  onClick={() => {
                    openChat(chatroom);
                  }}
                >
                  <UsersCard
                    name={chatroom.usersData[otherUserId].name}
                    avatarUrl={chatroom.usersData[otherUserId].doctorImg}
                    latestMessage={chatroom.lastMessage}
                    type={"chat"}
                  />
                </div>
              );
            })}
          </>
        )}

        {activeTab === "users" && (
          <>
            <h1 className="mt-4 px-4 text-base font-semibold">Users</h1>
            {loading2 && (
              <div className="flex justify-center items-center h-full">
                <span className="loading loading-spinner text-primary"></span>
              </div>
            )}
            {
              // this is code of doctor
              users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => {
                    createChat(user);
                  }}
                >
                  {user.id !== userData?.id &&
                    user.role === "doctor" &&
                    userData?.role === "patient" && (
                      <UsersCard
                        name={user.name}
                        avatarUrl={user.doctorImg}
                        latestMessage={""}
                        type={"user"}
                      />
                    )}
                </div>
              ))
            }
            {
              // this is code of patient
              users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => {
                    createChat(user);
                  }}
                >
                  {user.id !== userData?.id &&
                    user.role === "patient" &&
                    userData?.role === "doctor" && (
                      <UsersCard
                        name={user.name}
                        avatarUrl={user.avatarUrl}
                        latestMessage={""}
                        type={"user"}
                      />
                    )}
                </div>
              ))
            }
          </>
        )}
      </div>
    </div>
  );
}

export default Users;
