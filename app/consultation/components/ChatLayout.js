import React, { useState, useEffect } from "react";
import { app, firestore } from "@/lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Users from "@/app/components/Users";

import { auth } from "@/lib/firebase";
import SlideBar from "./SlideBar";
import ChatList from "./ChatList";
import ChatSection from "./ChatSection";

// import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "react-resizable-panels"; // Adjust this import based on your library

function ChatLayout() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showChatSection, setShowChatSection] = useState(false);

  const handleSidebarToggle = () => {
    setShowSidebar(!showSidebar);
  };

  const handleChatSectionToggle = () => {
    setShowChatSection(!showChatSection);
  };
  const auth = getAuth(app);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [selectedChatroom, setSelectedChatroom] = useState(null);

  useEffect(() => {
    // Use onAuthStateChanged to listen for changes in authentication state
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(firestore, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() };
          setUser(data);
        } else {
          console.log("No such document!");
        }
      } else {
        setUser(null);
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [auth, router]);



  return (
    <main className="flex  h-[calc(100dvh)] w-full flex-col items-center  justify-center p-4 gap-4">
      <div className="z-10 border rounded-lg max-w-screen w-full h-full text-sm flex">
        <SlideBar
          showSidebar={showSidebar}
          handleSidebarToggle={handleSidebarToggle}
        />
        <ChatList
          handleSidebarToggle={handleSidebarToggle}
          handleChatSectionToggle={handleChatSectionToggle}
          userData={user}
          setSelectedChatroom={setSelectedChatroom}
        />
        {selectedChatroom ? (
          <>
            <ChatSection
              showChatSection={showChatSection}
              handleChatSectionToggle={handleChatSectionToggle}
              user={user}
              selectedChatroom={selectedChatroom}
              showSidebar={showSidebar}
              handleSidebarToggle={handleSidebarToggle}
            />
          </>
        ) : (
          <>
            <div className="hidden lg:flex flex-row items-center justify-center w-full">
              <div className="text-2xl text-gray-600">
                Prioritize your health, stay safe and stay healthy.
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default ChatLayout;
