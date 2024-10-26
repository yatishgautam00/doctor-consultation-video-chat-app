"use client"
import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from "next/navigation";
import { auth, firestore } from "@/lib/firebase";
import Call from "@/app/components/Call";
import ReceiptDoctor from "../_component/ReceiptDoctor";

export default function Page({ params }) {
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
        <main className="flex w-full flex-col">
            <p className="absolute z-10 mt-2 ml-12 text-2xl font-bold text-gray-900">
                {params.channelName}
                
            </p>
            <Call appId={"056b8e2d9ceb43179933fab6943d9d65"} channelName={params.channelName}></Call>
            <ReceiptDoctor />
        </main>
    );
}
