"use client";
import { useEffect, useState } from "react";
import { auth, firestore } from "@/lib/firebase"; // Adjust the import path as necessary
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import ReceiptForm from "./ReceiptForm";

const ReceiptDoctor = () => {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.role === "doctor") {
            setHasAccess(true);
          } else {
            setHasAccess(false);
            // Optionally, redirect or show a message
            // router.push("/unauthorized"); // Redirect to unauthorized page
          }
        } else {
          setHasAccess(false);
          // Handle case where user document does not exist
        }
      } else {
        setHasAccess(false);
        // Handle user not logged in
        // router.push("/login"); // Redirect to login page
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Clean up the listener on unmount
  }, [router]);

  if (loading) {
    return <div>Loading...</div>; // You can customize the loading state
  }

  // Render children if the user has access
  return hasAccess ? <><ReceiptForm /></> : null;
};

export default ReceiptDoctor;
