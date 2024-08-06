"use client";
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
import {
  doc,
  getDoc,
  query,
  collection,
  where,
  onSnapshot,
} from "firebase/firestore";
import AnswerVideoCall from "./components/AnswerVideoCall";
import { Suspense } from "react";
import Loading from "./loading";
import CustomToast from "./components/CustomToast";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isDmPath = pathname === "/chats";
  const isConsultation = pathname === "/consultation";
  const isChannel = pathname.split("/")[1] === "channel";
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
        const notificationsRef = doc(
          firestore,
          "notifications",
          currentUser.uid
        );
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
              toast.custom((t) => <CustomToast myId={currentUser.uid} />, {
                duration: 5000,
              });
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
        <link rel="icon" href="/logo-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/logo-icon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/logo-icon.png" />
        <meta
          name="keywords"
          content="VaidyaPadma, best doctors in India, online appointments, 
          offline appointments, healthcare consultations, medical advice, vaidya, padma, vaidya padma,
           Vaidya Padma, Vaidya padma"
        />
        <meta name="google-site-verification" content="your_verification_code_here" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "http://schema.org",
            "@type": "MedicalOrganization",
            name: "VaidyaPadma",
            url: "https://vaidyapadma.vercel.app",
            description:
              "Connect with top-rated doctors in India for online and offline consultations.",
            contactPoint: {
              "@type": "ContactPoint",
              telephone: "+91-1234567890",
              contactType: "Customer Service",
            },
          })}
        </script>
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
        {!isDmPath && !isConsultation && !isChannel && (
          <Header notificationCount={notificationCount} />
        )}
        <Suspense fallback={<Loading />}>{children}</Suspense>
        {!isDmPath && !isConsultation && !isChannel && <Footer />}
      </body>
    </html>
  );
}
