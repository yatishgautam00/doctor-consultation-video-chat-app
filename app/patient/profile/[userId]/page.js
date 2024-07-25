"use client"
import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth, firestore } from "@/lib/firebase";
import EmailVerification from "@/app/components/EmailVerification"

function page() {
  const router = useRouter();

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (!user) {
          // If the user is not authenticated, redirect to the login page
          router.replace('/login');
        }
      });
      return () => unsubscribe();
    }, [router]);
  return (
    <div>
      <EmailVerification />
    </div>
  )
}

export default page