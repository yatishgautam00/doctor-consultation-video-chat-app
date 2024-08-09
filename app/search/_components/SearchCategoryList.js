"use client";
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
import Link from "next/link";
import { usePathname } from "next/navigation";
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

function CategoryList() {
    const [categories, setCategories] = useState([]);

    const params = usePathname();
    const category01 = params.split("/")[2];

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
// console.log(categories)
  return (
    <div className="h-screen mt-5 flex flex-col">
        
      <Command>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList className="overflow-visible">
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions " className='pb-8'>
            {categories &&
              categories.map((category, index) => (
                <CommandItem
                  key={index}
                  className={`${
                    category01 == category.category && "bg-blue-100 cursor-pointer "
                  }`}
                >
                  <Link
                    href={"/search/" + category.category}
                    className={`p-3 flex gap-2 text-[14px]
                  cursor-pointer text-gray-600
                  item-center rounded-md w-full `}
                  >
                    <Image
                      src={category.url}
                      alt="icon"
                      width={25}
                      height={25}
                    />
                    <label>{category.category}</label>
                  </Link>
                </CommandItem>
              ))}
          </CommandGroup>
          <CommandSeparator />
        </CommandList>
      </Command>
    </div>
  );
}

export default CategoryList;
