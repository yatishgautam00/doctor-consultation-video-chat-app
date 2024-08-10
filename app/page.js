import React from "react";
import Hero from "./components/Hero";
import CategoryList from "./components/CategoryList";
import SearchCategory from "./components/SearchCategory";
import DoctorList from "./components/DoctorList";

function page() {
  return (
    <div className="">
      <Hero />

      <SearchCategory />
      <div className="md:px-14 px-0">
        <DoctorList />
      </div>
    </div>
  );
}

export default page;
