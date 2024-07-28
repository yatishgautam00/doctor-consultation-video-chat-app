"use client";
import React, { useState, useEffect, useRef } from "react";
import MessageCard from "@/app/components/MessageCard";
import MessageInput from "@/app/components/MessageInput";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  onSnapshot,
  query,
  where,
  orderBy,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import ChatTopbar from "./ChatTopbar";
import { AiOutlineClose } from "react-icons/ai";
import { FaPhone, FaVideo } from "react-icons/fa";

function ChatSection({
  showChatSection,
  handleChatSectionToggle,
  user,
  selectedChatroom,
  showSidebar,
  handleSidebarToggle,
}) {
  const me = selectedChatroom?.myData;
  const other = selectedChatroom?.otherData;
  const chatRoomId = selectedChatroom?.id;

  const [message, setMessage] = useState([]);
  const [messages, setMessages] = useState([]);
  const messagesContainerRef = useRef(null);
  const [image, setImage] = useState(null);

  useEffect(() => {
    // Scroll to the bottom when messages change
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  //get messages
  useEffect(() => {
    if (!chatRoomId) return;
    const unsubscribe = onSnapshot(
      query(
        collection(firestore, "messages"),
        where("chatRoomId", "==", chatRoomId),
        orderBy("time", "asc")
      ),
      (snapshot) => {
        const messages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        //console.log(messages);
        setMessages(messages);
      }
    );

    return unsubscribe;
  }, [chatRoomId]);

  //put messages in db
  const sendMessage = async () => {
    const messagesCollection = collection(firestore, "messages");
    // Check if the message is not empty
    if (message == "" && image == "") {
      return;
    }

    try {
      // Add a new message to the Firestore collection
      const newMessage = {
        chatRoomId: chatRoomId,
        sender: me.id,
        content: message,
        time: serverTimestamp(),
        image: image,
      };

      await addDoc(messagesCollection, newMessage);
      setMessage("");
      setImage("");
      //send to chatroom by chatroom id and update last message
      const chatroomRef = doc(firestore, "chatrooms", chatRoomId);
      await updateDoc(chatroomRef, {
        lastMessage: message ? message : "Image",
      });

      // Prepare notification data
      const notificationData = {
        type: "Message",
        from: me.id,
        fromName: me.name,
        time: serverTimestamp(),
        status: true,
      };

      // Reference to the recipient's notification document
      const notificationRef = doc(firestore, "notifications", other.id);

      // Update or create the nested field in the notification document
      await updateDoc(notificationRef, {
        [`notificationName.${me.id}`]: notificationData,
      });

      // Clear the input field after sending the message
    } catch (error) {
      console.error("Error sending message:", error.message);
    }

    // Scroll to the bottom after sending a message
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={` ${
          showSidebar
            ? "block bg-black bg-opacity-70 fixed inset-0  z-40"
            : "hidden lg:hidden"
        }`}
        onClick={handleSidebarToggle}
      ></div>

      <div
        className={`fixed  lg:relative flex-1 lg:block bg-slate-50 lg:h-[calc(95dvh)] h-full pt-0 ${
          showChatSection
            ? " inset-0 flex-col flex  w-full  "
            : "hidden lg:block"
        }`}
      >
        <div className="flex flex-col h-full">
          <ChatTopbar
            handleChatSectionToggle={handleChatSectionToggle}
            other={other}
          />
          {/* Messages container with overflow and scroll */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-10 px-3 lg:px-10"
          >
            {messages?.map((message) => (
              <MessageCard
                key={message.id}
                message={message}
                me={me}
                other={other}
              />
            ))}
          </div>

          {/* Input box at the bottom */}
          <MessageInput
            sendMessage={sendMessage}
            message={message}
            setMessage={setMessage}
            image={image}
            setImage={setImage}
          />
        </div>
      </div>
    </>
  );
}

export default ChatSection;
