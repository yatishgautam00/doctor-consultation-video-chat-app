import React from "react";
import moment from "moment";
import Image from "next/image";

function MessageCard({ message, me, other }) {
  const isMessageFromMe = message.sender === me.id;

  const formatTimeAgo = (timestamp) => {
    const date = timestamp?.toDate();
    const momentDate = moment(date);
    return momentDate.fromNow();
  };

  return (
    <div className="w-full overflow-y-auto overflow-x-hidden flex flex-col">
      <div
        key={message.id}
        className={`flex 0 mb-4 ${
          isMessageFromMe ? "items-end flex-row-reverse" : "justify-start"
        }`}
      >
        {/* Avatar on the left or right based on the sender */}
        <div
          className={`w-10 h-10 flex  ${
            isMessageFromMe ? "ml-2 mr-2 flex-row-reverse items-center " : "mr-2 "
          }`}
        >
          {isMessageFromMe && (
            <Image
              className="w-full h-full mb-10 object-cover rounded-full"
              src={me.avatarUrl || me.doctorImg}
              alt="Avatar"
              width={50}
              height={50}
            />
          )}
          {!isMessageFromMe && (
            <Image
              className="w-full h-full object-cover rounded-full"
              src={other.avatarUrl || other.doctorImg}
              alt="Avatar"
              width={50}
              height={50}
            />
          )}
        </div>

        {/* Message bubble on the right or left based on the sender */}
        <div className={` text-black `}>
          <div
            className={`flex flex-col p-3   px-4  gap-1 rounded-md ${
              isMessageFromMe
                ? "bg-orange-200 self-end"
                : "bg-[#f0a684db] self-start"
            }`} 
          >
            {message.image && (
              <img src={message.image} className="max-h-60 w-60 " />
            )}
            <p className="lg:max-w-lg md:max-w-72 max-w-48">
              {message.content}
            </p>
          </div>
          <div
            className={`text-xs pt-1  flex  rounded-2xl  ${
              isMessageFromMe ? "justify-end pr-2" : " justify-start pl-2"
            }`}
          >
            {formatTimeAgo(message.time)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessageCard;
