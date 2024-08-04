"use client";
import EmailVerification from "@/app/components/EmailVerification";
import Appointment from "@/app/components/Appointment";
import ChatLayout from "@/app/consultation/components/ChatLayout";
import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth, firestore } from "@/lib/firebase";
import AppointmentList from "@/app/components/AppointmentList";

function page() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // If the user is not authenticated, redirect to the login page
        router.replace("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);
  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };
  return (
    <div className="">
      {/* <EmailVerification /> */}

      Doctor Profile
    </div>
  );
}

export default page;
