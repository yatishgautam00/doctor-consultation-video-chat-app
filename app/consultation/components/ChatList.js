import React from "react";
import { AiOutlineMenu } from "react-icons/ai";
import { useEffect, useState } from "react";
import { firestore, app } from "@/lib/firebase";
import { IoMenu } from "react-icons/io5";
import {
  collection,
  onSnapshot,
  query,
  addDoc,
  serverTimestamp,
  where,
  getDocs,
} from "firebase/firestore";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getAuth, signOut } from "firebase/auth";
import UsersCard from "@/app/components/UsersCard";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { ImUserPlus } from "react-icons/im";
import { AiFillMessage } from "react-icons/ai";

const ChatList = ({
  handleSidebarToggle,
  handleChatSectionToggle,
  userData,
  setSelectedChatroom,
}) => {
  const [activeTab, setActiveTab] = useState("chatrooms");
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [users, setUsers] = useState([]);
  const [userChatrooms, setUserChatrooms] = useState([]);
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
    <div className="flex-1 lg:flex-none lg:w-80 p-4 bg-slate-100 overflow-y-auto">
      <div className="w-full flex flex-row border-b-[1px] pb-2 border-b-slate-100 justify-between ">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
            <button
            onClick={handleSidebarToggle}
            className="lg:hidden  text-2xl rounded-lg text-black flex justify-center p-5 hover:bg-blue-100"
          >
           <IoMenu />
          </button>
            </TooltipTrigger>
            <TooltipContent className="border-2 border-primary">
              <p className="text-primary ">Menu</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <h1 className="text-3xl lg:flex hidden text-black  justify-center pt-3 pr-2 hover:bg-blue-100">
          Chat
        </h1>

        <div className=" flex flex-row gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleTabClick("users")}
                  className={`btn btn-outline ${
                    activeTab === "users" ? "bg-blue-300" : ""
                  } text-2xl rounded-lg text-black flex justify-center p-5 hover:bg-blue-100`}
                >
                  <ImUserPlus />
                </button>
              </TooltipTrigger>
              <TooltipContent className="border-2 border-primary">
                <p className="text-primary ">Add New Connection</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleTabClick("chatrooms")}
                  className={`btn btn-outline ${
                    activeTab === "chatrooms" ? "bg-blue-300" : ""
                  } text-2xl rounded-lg text-black flex justify-center p-5 hover:bg-blue-100`}
                >
                  <AiFillMessage />
                </button>
              </TooltipTrigger>
              <TooltipContent className="border-2 border-primary">
                <p className="text-primary ">Connections</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
        </div>
      </div>

      <div className="mt-4">
        {/* Chat List Items */}
        <div>
        <button onClick={handleChatSectionToggle} className="w-full ">

          {activeTab === "chatrooms" && (
            <>
              <h1 className="px-1 w-full text-left  text-base justify-start  flex font-semibold">Connections</h1>
              {loading && (
                <div className="flex justify-center items-center h-full">
                  <span className="loading loading-spinner text-primary"></span>
                </div>
              )}
              {userChatrooms.map(
                (chatroom) =>
                  userData?.role === "patient" && (
                    <div
                      key={chatroom.id}
                      onClick={() => {
                        openChat(chatroom);
                        
                      }}
                    >
                      <UsersCard
                        name={
                          chatroom.usersData[
                            chatroom.users.find((id) => id !== userData?.id)
                          ].name
                        }
                        avatarUrl={
                          chatroom.usersData[
                            chatroom.users.find((id) => id !== userData?.id)
                          ].doctorImg
                        }
                        latestMessage={chatroom.lastMessage}
                        type={"chat"}
                      />
                    </div>
                  )
              )}
              {userChatrooms.map(
                (chatroom) =>
                  userData?.role === "doctor" && (
                    <div
                      key={chatroom.id}
                      onClick={() => {
                        openChat(chatroom);
                      }}
                    >
                      <UsersCard
                        name={
                          chatroom.usersData[
                            chatroom.users.find((id) => id !== userData?.id)
                          ].name
                        }
                        avatarUrl={
                          chatroom.usersData[
                            chatroom.users.find((id) => id !== userData?.id)
                          ].avatarUrl
                        }
                        latestMessage={chatroom.lastMessage}
                        type={"chat"}
                      />
                    </div>
                  )
              )}
            </>
          )}
          </button>
          {activeTab === "users" && (
            <>
              <h1 className="mt-4 px-1 text-primary text-base font-semibold">
                Add New Connection
              </h1>
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
                // this is code of doctor
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
        {/* Repeat Chat List Items */}
      </div>
    </div>
  );
};

export default ChatList;
