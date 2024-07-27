"use client"
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IoMdListBox } from "react-icons/io";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FaUserDoctor } from "react-icons/fa6";
import { FaUser } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { auth, firestore } from '@/lib/firebase';
import VideoCallButton from './VideoCallButton'
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from "firebase/firestore";
import { IoIosLogIn } from "react-icons/io";
import { CiLogout } from "react-icons/ci";
import { FaHistory } from "react-icons/fa";
import { TbCategoryPlus } from "react-icons/tb";
import { MdManageAccounts } from "react-icons/md";
import { SiImessage } from "react-icons/si";
import Appointment from "./Appointment";
import { usePathname } from "next/navigation";

function Header() {
  const params = usePathname()
  const isDetails = params.split('/')[1]
  const [user, setUser] = useState(null);
  const [userImage, setUserImage] = useState(null);
  const [role, setRole] = useState(null);
  const [id1, setId1] = useState(null);

  const [isPopupOpen, setIsPopupOpen] = useState(false);


  const handleClosePopup = () => setIsPopupOpen(false);

  const handleOpenPopup = () => setIsPopupOpen(true);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        // Fetch the user image from Firestore
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        if (userDoc.exists()) {
          
          const userData = userDoc.data();
          setRole(userData.role);
          setId1(user.uid);
          if (userData.role === 'patient') {
            setUserImage(userData.avatarUrl); // Replace with actual avatar URL
         
          } else {
            setUserImage(userData.doctorImg);
          }
        }
      } else {
        setUser(null);
        setUserImage(null);
      }
    });

    return () => unsubscribe();
  }, []);

 
  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setUserImage(null);
  };

  const Menu = [
    {
      id: 1,
      name: "Home",
      path: "/",
    },
    {
      id: 2,
      name: "Explore",
      path: "/search/Neurologist",
    },
    {
      id: 3,
      name: "Contact Us",
      path: "/details/hOpY2RHTHDV3Rpo7YXHNy7wqnVv2",
    },
  ];


  

  return (
    <div className="flex items-center justify-between p-4 md:px-20 shadow-sm">
      <div className="flex items-center gap-10">
        <Image src="/logo.svg" alt="logo" width={180} height={80} />
        <ul className="md:flex gap-8 hidden">
          {Menu.map((item, index) => (
            <Link href={item.path} key={index}>
              <li className="hover:text-primary cursor-pointer hover:scale-105 transition-all ease-in-out">
                {item.name}
              </li>
            </Link>
          ))}
        </ul>
      </div>

      {/* User or doctor */}
      {user ? (
        <Popover>
          <PopoverTrigger className='flex items-center'>
            <img
              src={userImage || "/user.png"} // Fallback to a default image if user image is not available
              alt="User"
              width={50}
              height={50}
              className="w-[50px] h-[50px] object-cover rounded-full cursor-pointer "
            />
          </PopoverTrigger>
          <PopoverContent className='text-lg flex flex-col gap-2 w-64 mr-4'>
          <Link href={`/${role}/profile/${user.uid}`}>
              <div className='flex hover:text-primary'>
                <div className='text-3xl pr-3 '><MdManageAccounts /></div>
                Profile
              </div>
            </Link>
         
          <DropdownMenuSeparator />
          <Link href={`/consultation`}>
              <div className='flex hover:text-primary'>
                <div className='text-3xl pr-3 '><SiImessage /></div>
                Messages
              </div>
            </Link>
          <DropdownMenuSeparator />
          {/* appointment component */}
          {!isDetails ? <Appointment />:
          <div className='flex hover:text-primary'>
          <div className='text-3xl pr-3 '><IoMdListBox /></div>
          <Appointment />
        </div> }
          
          {/* <AppointmentBook /> */}
            <DropdownMenuSeparator />
          <Link href={`/search/Neurologist`}>
              <div className='flex hover:text-primary'>
                <div className='text-3xl pr-3 '><TbCategoryPlus /></div>
                Categories
              </div>
            </Link>
          <DropdownMenuSeparator />
          <VideoCallButton/>
          <DropdownMenuSeparator />
            <button
              onClick={handleLogout}
              className='hover:text-primary flex  w-full'
            ><div className='text-3xl pr-3 '><MdLogout /></div>
              Logout
            </button>
          </PopoverContent>
        </Popover>
      ) : (
        <Popover>
          <PopoverTrigger className='flex items-center bg-primary pl-4 pt-2 pb-2 pr-4 text-white rounded-md w-fit'>
            Get Started
          </PopoverTrigger>
          <PopoverContent className='text-lg flex flex-col gap-2 w-48'>
            <Link href='/register/user'>
              <div className='flex hover:text-primary'>
                <div className='text-2xl pr-4'><FaUser /></div>
                User
              </div>
            </Link>
            <DropdownMenuSeparator />
            <Link href='/register/doctor'>
              <div className='flex hover:text-primary'>
                <div className='text-2xl pr-4'><FaUserDoctor /></div>
                Doctor
              </div>
            </Link>
          </PopoverContent>
        </Popover>
      )}
      {/* User or doctor end */}
    </div>
  );
}

export default Header;
