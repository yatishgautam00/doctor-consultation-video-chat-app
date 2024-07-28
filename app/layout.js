"use client"
import { Inter } from "next/font/google";
import "./globals.css";
import toast, { Toaster } from "react-hot-toast";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { metadata } from "./metadata";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, firestore } from "@/lib/firebase";
import { doc, getDoc, query, collection, where, onSnapshot } from "firebase/firestore";
import AnswerVideoCall from "./components/AnswerVideoCall";
import { Suspense } from "react";
import Loading from "./loading";
import CustomToast from "./components/CustomToast";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isDmPath = pathname === "/chats";
  const isConsultation = pathname === "/consultation";
  const [userImage, setUserImage] = useState(null);
  const [role, setRole] = useState(null);
  const [id1, setId1] = useState(null);
  const [user, setUser] = useState(null);
  const [user2idDoc, setUser2idDoc] = useState(null);
  const [calltokendoc, setCalltokendoc] = useState(null);
  const [docId, setDocId] = useState(null);
  const [user1id, setUser1id] = useState(null);
  const [showAnswerVideoCall, setShowAnswerVideoCall] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setId1(currentUser.uid);
        // toast.custom((t) => (
        //   <CustomToast
        //     myId={currentUser.uid}
        //     notification={notification}
        //   />
        // ), { duration: 5000 });
        // Set up notification listener
        const notificationsRef = doc(firestore, "notifications", currentUser.uid);
        const unsubscribeNotifications = onSnapshot(
          notificationsRef,
          (snapshot) => {
            const data = snapshot.data();
            if (data) {
              const notificationsMap = data.notificationName || {};
            const notificationArray = Object.entries(notificationsMap).map(
              ([key, value]) => ({
                ...value,
                id: key,
              })
            );

              setNotificationCount(notificationArray.length);

              // Show a toast for each new notification
              // notificationArray.forEach(notification => {
                toast.custom((t) => (
                  <CustomToast
                    myId={currentUser.uid}
                  
                  />
                ), { duration: 5000 });
              // });
            }
          },
          (error) => {
            console.error("Error fetching notifications:", error);
          }
        );

        // Fetch user data
        try {
          const userDocRef = doc(firestore, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setRole(userData.role);
            setUserImage(
              userData.role === "patient"
                ? userData.avatarUrl
                : userData.doctorImg
            );
          } else {
            toast.error("No such user document!");
          }
        } catch (error) {
          toast.error("Error fetching user document: ", error);
        }

        // Fetch video call data
        try {
          const q = query(
            collection(firestore, "videoCalls"),
            where("user2id", "==", currentUser.uid),
            where("calltoken", "==", true)
          );

          const unsubscribeVideoCalls = onSnapshot(
            q,
            (snapshot) => {
              snapshot.forEach((doc) => {
                const data = doc.data();
                setUser2idDoc(data.user2id);
                setCalltokendoc(data.calltoken);
                setUser1id(data.user1id);
                setDocId(doc.id);
                setShowAnswerVideoCall(true);
                toast.success(`Call for user2id: ${data.user2id.name}`);
              });
            },
            (error) => {
              console.error("Error fetching video calls: ", error);
            }
          );

          return () => {
            unsubscribeNotifications();
            unsubscribeVideoCalls();
          };
        } catch (error) {
          console.error("Error setting up video call snapshot: ", error);
        }
      } else {
        setUser(null);
        setUserImage(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body className={inter.className}>
        {showAnswerVideoCall && user2idDoc === id1 && calltokendoc && (
          <AnswerVideoCall
            docId={docId}
            user1id={user1id}
            onClose={() => setShowAnswerVideoCall(false)}
          />
        )}
        <Toaster position="top-center" />
        {!isDmPath && !isConsultation && <Header  notificationCount={notificationCount} />}
        <Suspense fallback={<Loading />}>{children}</Suspense>
        {!isDmPath && !isConsultation && <Footer />}
      </body>
    </html>
  );
}
