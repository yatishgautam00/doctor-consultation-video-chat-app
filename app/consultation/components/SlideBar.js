"use client";
import React, { useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { MdOutlineVideoChat } from "react-icons/md";
import { FaHome } from "react-icons/fa";
import { SiImessage } from "react-icons/si";
import Link from "next/link";
import { BiSolidCategory } from "react-icons/bi";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { FaCalendarAlt } from "react-icons/fa";
import { auth, firestore } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { FaCalendarPlus } from "react-icons/fa";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FiLogOut } from "react-icons/fi";
import { FaThList } from "react-icons/fa";
function SlideBar({ showSidebar, handleSidebarToggle }) {
  const [userImage, setUserImage] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [id1, setId1] = useState(null);

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
          if (userData.role === "patient") {
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
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={` ${
          showSidebar
            ? "block bg-gray-500 bg-opacity-40 fixed inset-0  z-40"
            : "hidden lg:hidden"
        }`}
        onClick={handleSidebarToggle}
      ></div>

      {/* Sidebar */}
      <div
        className={` lg:relative lg:flex flex-col 
          w-16 h-full bg-gray-200 rounded-l-md lg:w-20
           border-r-[1px] border-slate-300
            text-white z-50 ${
              showSidebar ? "flex  flex-col w-16 h-full" : "hidden lg:block"
            }`}
      >
        <div className="mt-4 flex flex-col h-full ">
          <div className="text-4xl text-black mb-4 border-b-[1px] flex justify-center pt-2 pb-5">
            <MdOutlineVideoChat />
          </div>
          <div className="flex flex-col justify-between w-full pt-4 h-full gap-3">
            <TooltipProvider>
              <div className="flex gap-2 flex-col">
                <div className="text-3xl rounded-lg text-black flex justify-center p-5 hover:bg-blue-300">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href={`/`}>
                        <FaHome />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent className="border-2 border-primary">
                      <p className="text-primary">Home</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="text-3xl rounded-lg text-black flex justify-center p-5 hover:bg-blue-300">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href={`/my-appointments/${user?.uid}`}>
                      <FaCalendarAlt />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent className="border-2 border-primary">
                      <p className="text-primary">My Appointments</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="text-3xl rounded-lg text-black flex justify-center p-5 hover:bg-blue-300">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href={`/details/Search_and_Book_Appointment`}>
                      <FaCalendarPlus />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent className="border-2 border-primary">
                      <p className="text-primary">Book Appointment</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="text-3xl rounded-lg text-black flex justify-center p-5 bg-blue-300">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href={``}>
                        <SiImessage />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent className="border-2 border-primary">
                      <p className="text-primary">Chat</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
            
              </div>
              <div className="flex gap-2 flex-col">

              <div className="text-3xl w-full  rounded-lg text-black flex justify-center p-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <img
                      src={userImage || "/user.png"} // Fallback to a default image if user image is not available
                      alt="User"
                      width={60}
                      height={60}
                      className="w-full h-full object-cover rounded-full cursor-pointer "
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-primary">My Profile</p>
                  </TooltipContent>
                </Tooltip>
                </div>

                
                <div className="text-3xl rounded-lg text-black flex justify-center p-5">
                <Tooltip className=" hover:bg-blue-100">
                  <TooltipTrigger asChild>
                    <button onClick={handleLogout}>
                      <FiLogOut />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="border-2 border-primary">
                    <p className="text-primary">Logout</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              </div>

            </TooltipProvider>
          </div>
        </div>
      </div>
    </>
  );
}

export default SlideBar;
