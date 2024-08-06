"use client";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import DoctorDetail from "../_components/DoctorDetail";
import DoctorSuggestionList from "../_components/DoctorSuggestionList";
import { firestore } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

function Details({ params }) {
  const [doctorList, setDoctorList] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const params1 = usePathname();
  const doctorId = params1.split("/")[2];
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // If the user is not authenticated, redirect to the login page
        router.replace('/login');
      } else {
        // Fetch additional user data from Firestore
        try {
          const userDoc = doc(firestore, 'users', user.uid);
          const userSnapshot = await getDoc(userDoc);
          if (userSnapshot.exists()) {
            setCurrentUser({ ...user, ...userSnapshot.data() });
          } else {
            console.error("No user data found in Firestore");
          }
        } catch (error) {
          console.error("Error fetching user data: ", error);
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'users'));
        const doctors = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setDoctorList(doctors);
      } catch (error) {
        console.error("Error fetching doctors: ", error);
      }
    };

    fetchDoctors();
  }, []);

  return (
    <div className="p-5 md:px-20">
      <h2 className="font-bold text-[22px]">Details</h2>
      <div className="grid grid-cols-1 lg:grid-cols-5">
        {/* Doctor Details */}
        <div className="col-span-3">
          {doctorList && currentUser && (
            <DoctorDetail doctorList={doctorList} currentUser={currentUser} />
          )}
        </div>
        {/* Doctor Suggestion */}
        <div className="col-span-2">
          <DoctorSuggestionList doctorList={doctorList} />
        </div>
      </div>
    </div>
  );
}

export default Details;
