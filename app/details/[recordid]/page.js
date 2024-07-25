"use client";
import { usePathname,useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import DoctorDetail from "../_components/DoctorDetail";
import DoctorSuggestionList from "../_components/DoctorSuggestionList";
import { firestore } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';


function Details({ params }) {
  const [doctor, setDoctor] = useState();
  const [doctorList, setDoctorList] = useState([]);
  const params1 = usePathname();
  const doctorId = params1.split("/")[2];
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

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'users'));
        const doctorList = querySnapshot.docs.map(doc => doc.data());
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

  // console.log(doctorList)

  return (
    <div className="p-5 md:px-20">
      <h2 className="font-bold text-[22px]">Details</h2>
      <div className=" grid grid-cols-1 md:grid-cols-4 ">
        {/* Doctor Details  */}
        <div className="col-span-3">
          {doctorList && <DoctorDetail doctorList={doctorList}/>}
        </div>
        {/* Doctor Suggestion */}
        <div>
          <DoctorSuggestionList doctorList={doctorList} />
        </div>
      </div>
    </div>
  );
}

export default Details;
