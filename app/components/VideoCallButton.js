"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  collection,
  onSnapshot,
  query,
  addDoc,
  serverTimestamp,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
// import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from "@/lib/firebase";
import moment from "moment";
import Link from "next/link";
import { RiVideoAddFill } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import toast from "react-hot-toast";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function VideoCallButton() {
  const [user1id, setUser1id] = useState(null);
  const [user1role, setUser1role] = useState(null);
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [user2id, setUser2id] = useState([]);
  const [user2idbool, setUser2idbool] = useState(false);
  const [docId, setDocId] = useState(null);
  const params = usePathname();
  const isPath = params.split("/");
  const isConsultation = params[0];
  const [user, setUser] = useState(null);
  const isMyAppointment = isPath[1];

  useEffect(() => {
    const tasksQuery = query(collection(firestore, "users"));

    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(users);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        // Fetch the user image from Firestore
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser1role(userData.role);
          setUser1id(user.uid);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSelectuser2id = async (userId) => {
    setUser2id(userId);
    setUser2idbool(true);
    // console.log("Selected user ID:", userId); // For debugging
  };

  const handleVideoCall = async () => {
    try {
      {
        const timestamp = moment().format(); // Capture the timestamp using moment
        const docRef = await addDoc(collection(firestore, "videoCalls"), {
          timestamp: timestamp,
          user1id: user1id,
          user2id: user2id,
          calltoken: true,
        });
        setDocId(docRef.id);

        // console.log("this is user id" + user1id);
        router.push(`/channel/${docRef.id}`);
      }
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const handleNotSelected = () => {
    toast.error("Select a contact");
  };
  return (
    <Dialog>
      <DialogTrigger className="flex hover:text-primary">
        {isMyAppointment !== "my-appointments" && (
          <>
            <div className="text-3xl pr-3 ">
              <RiVideoAddFill />
            </div>
            <span className={`${params === "/consultation" ? "hidden" : ""}`}>
              Video Call
            </span>{" "}
          </>
        )}
        {isMyAppointment === "my-appointments" && (
          <div className="flex flex-row text-lg">
            <div className="text-3xl pr-3 ">
              <RiVideoAddFill />
            </div>
            Video Call
          </div>
        )}
      </DialogTrigger>
      <DialogContent className="md:h-max sm:h-max">
        <DialogHeader>
          <DialogTitle>Choose a contact</DialogTitle>
          <DialogDescription>
            <Command className="">
              <CommandInput placeholder="Type a command or search... " />
              <CommandList className=" overflow- overflow-y-visible  max-h-96  md:max-h-[400px]">
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="" className="h-full ">
                  {users.map((user, index) =>
                    user1role === "patient"
                      ? user.role === "doctor" &&
                        !(user1id === user.id) && (
                          <CommandItem className="  " key={index}>
                            <button
                              className={`p-3 shadow-sm w-full cursor-pointer rounded-lg flex items-center gap-3 ${
                                user.id === user2id
                                  ? "bg-blue-500 text-white"
                                  : "hover:bg-slate-100"
                              }`}
                              onClick={() => handleSelectuser2id(user.id)} // Pass user ID to the handler
                            >
                              <img
                                className="w-[70px] h-[70px] rounded-full"
                                width={60}
                                height={60}
                                alt="doctor"
                                src={user.doctorImg}
                              />
                              <div className="mt flex flex-col gap-1">
                                <h2 className="text-sm font-bold">
                                  {user.name}
                                </h2>
                                <h2 className="text-[14px] text-gray-5">
                                  {user.exp}+ Years
                                </h2>
                                <h2 className="text-[10px] w-min text-center font-medium bg-blue-100 p-1 rounded-full px-2 text-primary">
                                  {user.category}
                                </h2>
                              </div>
                            </button>
                          </CommandItem>
                        )
                      : user.role === "patient" &&
                        !(user1id === user.id) && (
                          <CommandItem className="  " key={index}>
                            <button
                              className={`p-3 shadow-sm w-full cursor-pointer rounded-lg flex items-center gap-3 ${
                                user.id === user2id
                                  ? "bg-blue-500 text-white"
                                  : "hover:bg-slate-100"
                              }`}
                              onClick={() => handleSelectuser2id(user.id)} // Pass user ID to the handler
                            >
                              <img
                                className="w-[70px] h-[70px] rounded-full"
                                width={60}
                                height={60}
                                alt="doctor"
                                src={user.avatarUrl || "/user.png"}
                              />
                              <div className="mt flex flex-col gap-1">
                                <h2 className="text-sm font-bold">
                                  {user.name}
                                </h2>

                                <h2 className="text-[10px] w-min text-center font-medium bg-green-100 p-1 rounded-full px-2 text-green-700">
                                  {user.role}
                                </h2>
                              </div>
                            </button>
                          </CommandItem>
                        )
                  )}
                </CommandGroup>
              </CommandList>
            </Command>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            {user2idbool ? (
              <Button type="button" onClick={handleVideoCall}>
                Confirm
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleNotSelected}
                className="cursor-not-allowed"
              >
                Confirm
              </Button>
            )}
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
