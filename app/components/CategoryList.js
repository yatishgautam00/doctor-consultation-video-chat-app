'use client'
import React from 'react'
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';


function CategoryList() {
    const [categories, setCategories] = useState([]);

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

  return (
    <div>
      <h1>Categories</h1>
      <ul> 
        {categories.map((category, index) => (
          <li key={index} className='flex flex-row gap-1'>
            <img src={category.url} alt={category.category} width="100" />
            <p>{category.category}</p>
          </li>
        ))}
      </ul>
    </div>

  )
}

export default CategoryList