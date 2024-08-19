import React from "react";
import { FaRegMessage } from "react-icons/fa6";
import { FaCircle } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import Image from "next/image";
function UsersCard({ avatarUrl, name, latestMessage, time, type }) {
  return (
    <div className="flex items-center p-4 border-b border-gray-200 relative hover:cursor-pointer">
      {/* Avatar on the left */}
      <div className="flex-shrink-0 mr-4 relative ">
        <div className="w-12 h-12 rounded-full overflow-hidden">
          <Image
            className="w-full h-full object-cover"
            src={avatarUrl || "/user.png"}
            alt="Avatar"
            width={50}
            height={50}
          />
        </div>
      </div>

      {type == "chat" && (
        /* Name, latest message, and time on the right */
        <div className="flex-1 flex flex-col ">
          <div className="flex items-center justify-start">
            <h2 className="text-lg font-medium">{name}</h2>
          </div>
          <p className="text-gray-500 overflow-hidden whitespace-nowrap w-48 flex items-center gap-1 mr-3 pr-3 text-ellipsis">
            <span className="text-lg pt">
              <MdEmail />
            </span>
            {latestMessage}
          </p>
        </div>
      )}

      {type == "user" && (
        /* Name */
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h2 className={`text-lg font-medium text-blue-800`}>{name}</h2>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersCard;
