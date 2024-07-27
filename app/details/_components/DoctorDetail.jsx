"use client"
import { usePathname } from "next/navigation";
import React, { useEffect, useState }  from 'react'
import Image from 'next/image'
import { firestore } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Button } from '@/components/ui/button'
import { FaUserGraduate } from "react-icons/fa";
import { FaMapMarkerAlt } from "react-icons/fa";
import Appointment from "@/app/components/Appointment";

function DoctorDetail({doctorList}) {
    const isSpace =" "
    const params1 = usePathname();
    const doctorId = params1.split("/")[2];
    const socialMediaList = [
        {
            id:1,
            icon:'/youtube.png'
        },
        {
            id:2,
            icon:'/linkedin.png'
        },
        {
            id:3,
            icon:'/facebook.png'
        },
        {
            id:4,
            icon:'/twitter.png'
        },
    ]
  return (<>
    {doctorList.map((doctor, index) => doctor.id == doctorId && doctor.role==='doctor' && (
    <div className = "col-span-3 grid grid-cols-1 md:grid-cols-3 border-[1px] p-5 mt-5 rounded-lg " key={index} >
          {/* Doctor image */}
          
      
          <div>
                <img src={doctor.doctorImg} 
                width={200}
                height={200}
                alt='doctor image'
                className='rounded-lg h-[280px] w-full object-cover items-center'
                />
          </div>
          {/* Doctor info */}
          <div className='col-span-2 mt-5 md:px-10 flex flex-col gap-3 items-baseline'>
                <h2 className='font-bold text-xl'>{doctor.name}</h2>
                <h2 className='flex  gap-2 text-gray-5 text-md'>
                <FaUserGraduate className='text-xl' />
                    <span>{doctor.exp} Years of Experience</span>
                </h2>
                <h2 className=' text-md flex  gap-2 text-gray-5'>
                <FaMapMarkerAlt className='text-xl' />
                    <span>{doctor.address}</span>
                </h2>
                <h2 className='text-[14px] bg-blue-100 p-1 rounded-full
                px-2 text-primary'>{doctor.category}</h2>

                <div className='flex gap-3'>
                    {socialMediaList.map((item,index)=>(
                        <Image src = {item.icon} key={index}
                        width={30}
                        height={30}/>
                    ))}
                </div>
                <Button className='mt-3 hrounded-full '>
                   <Appointment/>
                </Button>
                        {/* about doctor */}
                <div>
                    <h2 className='font-bold text-[20px]'>
                        About Me
                    </h2>
                    <p className = 'text-gray-500 tracking-wide mt-2 text-justify'>
                        {doctor.about}
                        </p>
                </div>
          </div>
        </div>
          ))}
          </>
  )
}

export default DoctorDetail