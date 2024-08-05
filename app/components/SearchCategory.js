'use client'
import React from 'react'
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IoIosSearch } from "react-icons/io";
import Link from 'next/link';
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
  } from "@/components/ui/command"

function CategoryList() {
    const [categories, setCategories] = useState([]);
    const [getsearch, setGetsearch] = useState([]);
    const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'categorylist'));
        const categoriesList = querySnapshot.docs.map(doc => doc.data());
        setCategories(categoriesList);
      } catch (error) {
        console.error("Error fetching categories: ", error);
      }
    };
    fetchCategories();
}, []);


const toggleShowAll = () => {
    setShowAll(prevShowAll => !prevShowAll);
  };

  const categoriesToShow = showAll ? categories : categories.slice(0, 5);


  return (
    <Command>
    <div className="mb-10 mt-4 items-center flex flex-col gap-2">
        
    <h2 className="font-bold text-4xl tracking-wide">
      Search <span className="text-primary">Doctors</span>
    </h2>
    <h2 className="text-gray-400 text-xl px-5">
      Search Your Doctors and Book an Appointment in one click
    </h2>
   
    <div className="flex w-full mt-3 max-w-sm items-center space-x-2">
    <CommandInput placeholder="Type a command or search..." />
      <Button type="submit">
        <IoIosSearch className="h-4 w-4 mr-2" />
        Search
      </Button>
    </div>
   
    <CommandList className='max-h-full'>
    <CommandEmpty>No results found.</CommandEmpty>

    <CommandGroup >
        
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 m-5">
  
   
      {categoriesToShow.length > 0 ? (
        
        categoriesToShow.map((category, index) => (
            
            <CommandItem href={"/"+category.category} className='flex text-wrap flex-col  gap- items-center 
        bg-blue-50 m-3 rounded-lg  hover:scale-110 transition-all ease-in-out cursor-pointer'>
          <Link
            href={"/search/"+category.category}
            key={index}
           
            className="flex flex-col mx-1  gap-3 text-center mt-2 items-center  "
          > 
            <Image
              src={category.url}
              alt={category.category}
              width={70}
              height={90}
              className='lg:w-[70px] lg:h-[90px] '
            />
            <h3 className="text-blue-600 w-[100px] px-1 md:px-2  overflow-hidden lg:w-full md:w-full text-wrap h-full   text-sm text-balance	">
              {category.category}
            </h3>
            
          </Link>
          </CommandItem>
         
        ))
      ) : 
      
      (
        [1, 2, 3, 4, 5, 6].map((item, index) => (
          <div
            className="flex flex-col text-center gap-2 items-center p-5 
        m-3 space-between animate-pulse rounded-lg w-[90px] h-[80px] bg-slate-100 "
            key={index}
          >
            <label className="animate-pulse rounded-lg bg-slate-200 w-[70px] h-[70px]"></label>
            <label className="animate-pulse rounded-lg  bg-slate-400 w-[50px] h-[10px] text-sm"></label>
          </div>
        ))
      )}
       
      
      {!showAll && categories.length > 5 && (
        <div
          onClick={toggleShowAll}
          className="flex flex-col text-center gap-2 items-center p-5 
        bg-blue-50 m-3 rounded-lg hover:scale-110 transition-all ease-in-out cursor-pointer justify-center"
        >
          <label className="text-blue-600 lg:text-xl md:text-sm text-sm text-center p-6 rounded-md ">See All</label>
        </div>
      )}
  
  
    </div>
        </CommandGroup >
        </CommandList>
  </div>
  </Command>
  )
}

export default CategoryList