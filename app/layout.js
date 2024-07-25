"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import toast, { Toaster } from 'react-hot-toast';
import Header from "./components/Header";
import Footer from "./components/Footer";
import { metadata } from './metadata';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from "react";
import { onAuthStateChanged } from 'firebase/auth';
import { auth, firestore } from '@/lib/firebase';
import { doc, getDoc, query, collection, where, onSnapshot } from "firebase/firestore";
import AnswerVideoCall from "./components/AnswerVideoCall";
import { Suspense } from "react";
import Loading from "./loading";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isProfile1 = pathname.split("/")
  const isDmPath = pathname === '/chats';
  const isConsultation = pathname ==='/consultation'
  const isExample = pathname ==='/example'
  // const isProfile = isProfile1[1] ==='/profile'
  const [userImage, setUserImage] = useState(null);
  const [role, setRole] = useState(null);
  const [id1, setId1] = useState(null);
  const [user, setUser] = useState(null);
  const [user2idDoc, setUser2idDoc] = useState(null);
  const [calltokendoc, setCalltokendoc] = useState(null);
  const [docId, setDocId] = useState(null);
  const [user1id, setUser1id] = useState(null);
  const [callStatus, setCallStatus] = useState(null);
  // toast.success(isDmPath)
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setId1(currentUser.uid);

        // Fetch user data
        try {
          const userDocRef = doc(firestore, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setRole(userData.role);
            setUserImage(userData.role === 'patient' ? userData.avatarUrl : userData.doctorImg);
          } else {
            console.log("No such user document!");
          }
        } catch (error) {
          console.error("Error fetching user document: ", error);
        }

        // Fetch video call data
        try {
          const q = query(
            collection(firestore, 'videoCalls'),
            where('user2id', '==', currentUser.uid),
            where('calltoken', '==', true)
          );

          const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
            snapshot.forEach((doc) => {
              const data = doc.data();
              setUser2idDoc(data.user2id);
              setCalltokendoc(data.calltoken);
              setUser1id(data.user1id);
              setCallStatus(data.callStatus);
              setDocId(doc.id);
              toast.success(`Call for user2id: ${data.user2id}`);
            });
          }, (error) => {
            console.error("Error fetching video calls: ", error);
          });

          return () => unsubscribeSnapshot();
        } catch (error) {
          console.error("Error setting up video call snapshot: ", error);
        }

      } else {
        setUser(null);
        setUserImage(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body className={inter.className}>
        {user2idDoc === id1 && calltokendoc && !callStatus && <AnswerVideoCall docId={docId} user1id={user1id} />}
        <Toaster position='bottom-center' />
        {!isDmPath && !isConsultation && !isExample && <Header />}
        <Suspense fallback={<Loading />}>{children}</Suspense>
        {!isDmPath && !isConsultation && !isExample && <Footer />}
      </body>
    </html>
  );
}
