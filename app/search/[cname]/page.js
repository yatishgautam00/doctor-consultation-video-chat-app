"use client";
import React, { useEffect, useState } from "react";
import SearchCategoryList from '../_components/SearchCategoryList'

import DoctorList from '@/app/components/DoctorList'

function Search({ params }) {
  useEffect(() => {
    console.log(params.cname);
  }, []);
  
  return (
    <div className="mt-5 md:px-14">
      <DoctorList heading={params.cname} />
      {/* <DoctorCategoryList  heading={params.cname}  /> */}
    </div>
  );
}

export default Search;
