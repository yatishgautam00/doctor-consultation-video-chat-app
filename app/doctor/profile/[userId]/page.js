"use client";
import React, { useState, useEffect } from "react";
import { auth, firestore } from "@/lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import { FaUserDoctor } from "react-icons/fa6";
import { LuImagePlus } from "react-icons/lu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import CategoryList from "@/app/search/_components/SearchCategoryList";

function DoctorProfile() {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [doctorImg, setDoctorImg] = useState("");
  const [exp, setExp] = useState("");
  const [address, setAddress] = useState("");
  const [numpatients, setNumpatients] = useState("");
  const [about, setAbout] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const docRef = doc(firestore, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setName(data.name || "");
            setDoctorImg(data.doctorImg || "");
            setExp(data.exp || "");
            setAddress(data.address || "");
            setNumpatients(data.numpatients || "");
            setAbout(data.about || "");
            setPhone(data.phone || "");
            setCategory(data.category || "");
            setEmail(data.email || "");
            setRole(data.role);
          } else {
            toast.error("No such document!");
          }
        } catch (error) {
          console.error("Error fetching profile:", error.message);
          toast.error("Failed to fetch profile data");
        }
      } else {
        router.push("/login"); // Redirect to login if not authenticated
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleSuccess = (result) => {
    setDoctorImg(result.info.secure_url);
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(firestore, "users", user.uid);
        await updateDoc(docRef, {
          name,
          doctorImg,
          exp,
          about,
          address,
          phone,
          numpatients,
        });
        toast.success("Profile updated successfully");
        setEditMode(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error.message);
      toast.error(error.message);
    }
  };


  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 md:p-10 md:py-7 p-3">
      <div className="col-span-3">
        <h2 className="font-secondary pl-3 pb-2 text-xl font-semibold ">
          Doctor Profile
        </h2>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 shadow-xl border-2 border-slate-300 rounded-xl p-10"
        >
          <div className="flex flex-col gap-3 md:gap-5 md:flex-row items-start md:items-start space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-shrink-0 ">
              {doctorImg ? (
                <img
                  src={doctorImg}
                  alt="Uploaded Image"
                  width={200}
                  height={200}
                  className="rounded-lg border border-slate-300 object-cover"
                />
              ) : (
                <FaUserDoctor
                  className="rounded-lg border-2 border-slate-200 w-48 h-48"
                  size={50}
                />
              )}
              {editMode && (
                <div className="flex flex-row items-center justify-center w-full">
                  <CldUploadWidget
                    uploadPreset="ml_default"
                    onSuccess={handleSuccess}
                    onError={(err) => toast.error("Image upload failed")}
                  >
                    {({ open }) => (
                      <Button
                        type="button"
                        onClick={() => open()}
                        className="btn btn-outline w-full bg-slate-600 hover:bg-slate-400 flex flex-row items-center justify-center text-xl gap-2"
                      >
                        <LuImagePlus />{" "}
                        <span className="text-sm pt-1">New Image</span>
                      </Button>
                    )}
                  </CldUploadWidget>
                </div>
              )}
            </div>

            <div className="flex-grow flex-col flex gap-4">
              {/* Email */}
              <div className="grid grid-cols-3 items-center ">
                <label className="label">
                  <span className="text-base col-span-1 label-text">
                    Email:
                  </span>
                </label>
                <p className="px-3 py-1 truncate bg-slate-100 col-span-2 border-[1px] border-slate-200 rounded-md">
                  {email}
                </p>
              </div>

              {/* category */}
              <div className="grid grid-cols-3 items-center ">
                <label className="label">
                  <span className="text-base col-span-1 label-text">
                    Category:
                  </span>
                </label>
                <p className="px-3 py-1 truncate bg-slate-100 col-span-2 border-[1px] border-slate-200 rounded-md">
                  {category}
                </p>
              </div>

              {/* Name */}
              <div className="grid grid-cols-3 items-center ">
                <label className="label">
                  <span className="text-base col-span-1 label-text">Name:</span>
                </label>
                {editMode ? (
                  <Input
                    type="text"
                    placeholder="Name"
                    className="w-full input col-span-2 input-bordered"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                ) : (
                  <p className="px-3 py-1 bg-slate-100 col-span-2 border-[1px] border-slate-200 rounded-md">
                    {name}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="grid grid-cols-3 gap-1 items-center ">
                <label className="label">
                  <span className="text-base col-span-1 label-text">
                    Phone:
                  </span>
                </label>
                {editMode ? (
                  <Input
                    type="text"
                    placeholder="Phone"
                    className="w-full input col-span-2 input-bordered"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                ) : (
                  <p className="px-3 py-1 bg-slate-100 col-span-2 border-[1px] border-slate-200 rounded-md">
                    {phone}
                  </p>
                )}
              </div>

              {/* Experience */}
              <div className="grid grid-cols-3 gap-1 items-center ">
                <label className="label">
                  <span className="text-base col-span-1 label-text">
                    Years of Experience:
                  </span>
                </label>
                {editMode ? (
                  <Input
                    type="number"
                    placeholder="Experience"
                    className="w-full input col-span-2 input-bordered"
                    value={exp}
                    onChange={(e) => setExp(e.target.value)}
                  />
                ) : (
                  <p className="px-3 py-1 bg-slate-100 col-span-2 border-[1px] border-slate-200 rounded-md">
                    {exp}
                  </p>
                )}
              </div>

              {/* Number of Patients */}
              <div className="grid grid-cols-3 gap-1 items-center ">
                <label className="label col-span-1">
                  <span className="text-base label-text">
                    Number of Patients:
                  </span>
                </label>
                {editMode ? (
                  <Input
                    type="text"
                    placeholder="Number of Patients"
                    className="w-full col-span-2 input input-bordered"
                    value={numpatients}
                    onChange={(e) => setNumpatients(e.target.value)}
                  />
                ) : (
                  <p className="px-3 py-1 bg-slate-100 border-[1px] col-span-2 justify-center border-slate-200 rounded-md">
                    {numpatients}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="grid grid-cols-3 gap-1 items-center ">
                <label className="label col-span-1">
                  <span className="text-base label-text">Address:</span>
                </label>
                {editMode ? (
                  <Input
                    type="text"
                    placeholder="Address"
                    className="w-full input col-span-2 input-bordered"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                ) : (
                  <p className="px-3 py-1 bg-slate-100 col-span-2 border-[1px] border-slate-200 rounded-md">
                    {address}
                  </p>
                )}
              </div>

              {/* About */}
              <div className="grid grid-cols-3 gap-1">
                <label className="label col-span-1">
                  <span className="text-base label-text">About:</span>
                </label>
                {editMode ? (
                  <Textarea
                    type="text"
                    placeholder="About"
                    className="w-full input col-span-2 input-bordered"
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                  />
                ) : (
                  <p className="px-3 py-1 bg-slate-100 col-span-2 border-[1px] border-slate-200 rounded-md">
                    {about}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-1 items-center ">
                <label className="label col-span-1"></label>

                {/* Edit/Save Button */}
                <div
                  className={`flex col-span-2  gap-4 ${
                    editMode ? "justify-between  " : "justify-end "
                  }`}
                >
                  {editMode && (
                    <Button
                      type="submit"
                      className="btn hover:scale-105 bg-green-700 hover:bg-green-500 w-full"
                    >
                      Save
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={handleEditToggle}
                    className={`w-full hover:scale-105 ease-in-out ${
                      role === "patient" && router.push("/")
                    } ${
                      editMode
                        ? "border border-red-500 text-red-500 hover:bg-red-50 bg-white"
                        : "bg-blue-900 hover:bg-blue-700 w-max "
                    }`}
                  >
                    {editMode ? "Cancel" : "Edit"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
      <div className="col-span-3 md:col-span-3 lg:col-span-2 ">
        <h2 className="font-secondary pl-3 pb-2 text-xl font-semibold ">
          Category Suggestions
        </h2>
        <div className="shadow-xl border-2 border-slate-300 rounded-xl  px-5 sm:px-8">
          <CategoryList />
        </div>
      </div>
    </div>
  );
}

export default DoctorProfile;
