'use client'
import React, { useEffect, useState } from 'react';
import { firestore } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Skeleton } from "@/components/ui/skeleton";
import Link from 'next/link';
import Image from 'next/image';

import { usePathname } from "next/navigation";

function DoctorList({ heading = 'Popular Doctor', }) {
  const [doctorList, setDoctorList] = useState([]);
  const [doctor, setDoctor] = useState();

  const params = usePathname();
    const category01 = params.split("/")[2];
    const categorycond = params.split("/")[1];
    let paramsCondition = false;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'users'));
        const doctorList = querySnapshot.docs.map(doc => doc.data());
        const doctors = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setDoctorList(doctors);
        
      } catch (error) {
        console.error("Error fetching categories: ", error);
      }
    };
    fetchCategories();
  }, []);
console.log(doctorList)
  const renderDoctors = () => {
    return doctorList.length > 0
      ? doctorList.map((doctor, index) => {
          if (categorycond === 'search') {
            paramsCondition = true;
            return doctor.role === 'doctor' && doctor.category === category01 ? (
              
              <div
                key={index}
                className="border-[1px] rounded-lg p-3 bg-gray-25 bg-gray-50 cursor-pointer hover:border-primary hover:shadow-sm transition-all ease-in-out"
              >
                <Image
                  src={doctor.doctorImg}
                  alt="doctor"
                  width={500}
                  height={250}
                  className="h-[200px] w-full object-cover rounded-lg"
                />
                <div className="mt-3 items-baseline flex flex-col gap-1">
                  <h2 className="text-[10px] bg-blue-100 p-1 rounded-full px-2 text-primary">
                    {doctor.category}
                  </h2>
                  <h2 className="font-bold">{doctor.name}</h2>
                  <h2 className="text-primary text-sm">{doctor.exp} years</h2>
                  <h2 className="text-gray-500 text-sm">{doctor.address}</h2>
                  <Link href={'/details/'+doctor.id} className="w-full">
                    <h2 className="p-2 px-3 border-[1px] border-primary text-primary rounded-full w-full text-center text-[11px] mt-2 cursor-pointer hover:bg-primary hover:text-white">
                      Book Now
                    </h2>
                  </Link>
                </div>
              </div>
            ) : null;
          } if( !paramsCondition ) {
            return doctor.role === 'doctor' ? (
              <div
                key={index}
                className="border-[1px] rounded-lg p-3 bg-gray-25 bg-gray-50 cursor-pointer hover:border-primary hover:shadow-sm transition-all ease-in-out"
              >
                <Image
                  src={doctor.doctorImg}
                  alt="doctor"
                  width={500}
                  height={250}
                  className="h-[200px] w-full object-cover rounded-lg"
                />
                <div className="mt-3 items-baseline flex flex-col gap-1">
                  <h2 className="text-[10px] bg-blue-100 p-1 rounded-full px-2 text-primary">
                    {doctor.category}
                  </h2>
                  <h2 className="font-bold">{doctor.name}</h2>
                  <h2 className="text-primary text-sm">{doctor.exp} years</h2>
                  <h2 className="text-gray-500 text-sm">{doctor.address}</h2>
                  <Link href={'/details/'+doctor.id} className="w-full">
                    <h2 className="p-2 px-3 border-[1px] border-primary text-primary rounded-full w-full text-center text-[11px] mt-2 cursor-pointer hover:bg-primary hover:text-white">
                      Book Now
                    </h2>
                  </Link>
                </div>
              </div>
            ) : null;
          }
        })
      : [1, 2, 3, 4].map((item, index) => (
          <div
            className="grid grid-cols-2 sm:grid-cols-2 gap-7 align-baseline justify-content-center md:grid-cols-3 lg:grid-cols-4 mt-5 items-center"
            key={index}
          >
            <div className="bg-slate-200 lg:w-[220px] lg:h-[330px] item-center animate-pulse rounded-lg p-3 bg-gray-25">
              <Skeleton className="bg-slate-300 lg:w-[196px] lg:h-[190px] object-cover rounded-lg" />
            </div>
          </div>
        ));
  };

  return (
    <div className="mb-10 px-10">
      <h2 className="font-bold text-xl">{heading}</h2>
      <div className="grid grid-cols-2 gap-7 md:grid-cols-2 lg:grid-cols-4 mt-5">
        {renderDoctors()}
      </div>
    </div>
  );
}

export default DoctorList;
