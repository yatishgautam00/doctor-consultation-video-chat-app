import React from 'react'
import { MdOutlineStar, MdVisibility } from "react-icons/md";

function RatingList({ratings , currentUser}) {
  return (
    <div className="col-span-2 mt-5 grid grid-cols-1  sm:grid-cols-2 gap-6">
        {ratings.map((rating, index) => rating.userEmail !== currentUser.email && (
          <div
            key={index}
            className="flex flex-col p-4 shadow-lg  border rounded-lg border-gray-300"
          >
            <div className="flex items-center  space-x-4 mb-2">
              <img
                src={rating.userImg}
                alt="User"
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="flex-1 ">
                <h3 className="text-md font-bold">{rating.userName}</h3>
                <div className="flex">
                  {Array.from({ length: rating.userRating }, (_, i) => (
                    <MdOutlineStar key={i} className="text-yellow-500" />
                  ))}
                </div>
              </div>
            </div>
            {rating.userMsg && (
              <div className="p-1 border- rounded h-max border-gray-300">
                <p className="whitespace-pre-line">{rating.userMsg}</p>
              </div>
            )}
          </div>
        ))}
      </div>
  )
}

export default RatingList