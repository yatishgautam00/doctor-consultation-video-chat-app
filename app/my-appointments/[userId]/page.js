"use client"
import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter,usePathname } from "next/navigation";
import { auth, firestore } from "@/lib/firebase";
import AppointmentList from "@/app/components/AppointmentList";
function page() {
    const router = useRouter();
    const params = usePathname();
    const userId = params.split("/")[2]

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // If the user is not authenticated, redirect to the login page
        router.replace("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);
  return (
    <div>
        
        <AppointmentList userId={userId} />
    </div>
  )
}

export default page