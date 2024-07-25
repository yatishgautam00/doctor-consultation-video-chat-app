"use client";
import React from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Info, Phone, Video } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import UsersCard from "@/app/components/UsersCard";
import { IoMdClose } from "react-icons/io";
import { FaChevronCircleLeft } from "react-icons/fa";
import VideoCallButton from "@/app/components/VideoCallButton";
const TopbarIcons = [{ icon: Phone }, { icon: Video }];

export default function ChatTopbar({ user, handleChatSectionToggle, other }) {
  return (
    <div className="w-full h-20 flex p-4 bg-slate-200 justify-between items-center border-b">
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex flex-row items-center justify-center lg:pl-5 pl-2 gap-3">
          <div className="w-12 h-12  rounded-full overflow-hidden">
            <img
              className="w-full h-full object-cover"
              src={other.avatarUrl || other.doctorImg || "/user.png"}
              alt="Avatar"
            />
          </div>
          <div className="flex flex-col ">
            <span className="text-lg font-medium">{other.name}</span>
            <span
              className={`text-[10px]  p-1 w-max rounded-full px-2 py-0  ${
                other.role === "doctor"
                  ? "bg-blue-200 text-blue-600"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {other.role}
            </span>
          </div>
        </div>
        <div className="flex flex-row items-center">
          <button
            className={
              "h-9 w-9 flex flex-row align-middle justify-center items-center dark:bg-muted text-xl w-full text-slate-700 dark:text-muted-foreground  "
            }
          >
            <VideoCallButton />
          </button>
          <button
            onClick={handleChatSectionToggle}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "h-9 w-9",
              "dark:bg-muted text-3xl  text-slate-700 lg:hidden bg-white px-1 hover:text-primary"
            )}
          >
            <IoMdClose />
          </button>
        </div>
      </div>
    </div>
  );
}
