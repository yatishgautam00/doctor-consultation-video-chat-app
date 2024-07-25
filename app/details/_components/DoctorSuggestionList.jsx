"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import Image from "next/image";


function DoctorSuggestionList({doctorList}) {

  return (
    
    <div className=" h-screen p-4 border-[1px] mt-5 md:ml-5 rounded-lg ">
      <h2 className="mb-3 font-bold">Suggestion</h2>

      <Command className='max-h-[2000px]'>

        <CommandInput placeholder="Type a command or search... " />
        <CommandList className=" overflow- overflow-y-visible   max-h-[580px]">
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="" className='h-full '>
          {/* <CommandGroup heading="Suggestions " > */}
          
          {doctorList.map((doctor, index) =>
               doctor.role === 'doctor' && (
                <CommandItem className="  " key={index}>
                  <Link
                    className=" p-3 
        shadow-sm w-full cursor-pointer 
        hover:bg-slate-100  rounded-lg flex items-center
        gap-3"
                    href={"/details/" + doctor.id}
                  >
                    <img
                      className="w-[70px] h-[70px] object-cover rounded-full"
                      width={60}
                      height={60}
                      alt='doctor'
                      src={doctor.doctorImg}
                    />
                    <div className="mt flex flex-col gap-1">
                      <h2 className="text-sm  font-bold">
                        {doctor.name}
                      </h2>
                      <h2 className="text-[14px] text-gray-5">
                        {doctor.exp}+ Years
                      </h2>

                      <h2
                        className="text-[10px] text-center font-medium bg-blue-100 p-1 rounded-full
                px-2 text-primary"
                      >
                        {
                          doctor.category
                        }
                      </h2>
                    </div>
                  </Link>
                </CommandItem>
              )
          )}
          
        </CommandGroup>
          {/* </CommandGroup> */}
          {/* <CommandSeparator /> */}
        </CommandList>
     
      </Command>
    </div>
    
    
  );
}

export default DoctorSuggestionList;