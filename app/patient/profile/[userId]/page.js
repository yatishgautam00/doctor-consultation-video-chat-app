"use client";
import React, { useState, useEffect } from "react";
import { auth, firestore } from "@/lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import { FaUser } from "react-icons/fa6";
import { LuImagePlus } from "react-icons/lu"; 
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CategoryList from "@/app/search/_components/SearchCategoryList";
import DoctorList from "@/app/components/DoctorList";

function PatientProfile() {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("online"); // Status is always "online"
  const [role, setRole] = useState("patient"); // Role is always "patient"

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchProfile(user.uid);
      } else {
        router.push("/login"); // Redirect to login if unauthorized
      }
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, [router]);

  const fetchProfile = async (userId) => {
    try {
      const docRef = doc(firestore, "users", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setName(data.name || "");
        setAvatarUrl(data.avatarUrl || "");
        setEmail(data.email || "");
        setStatus(data.status || "online"); // Status from Firestore or default to "online"
        setRole(data.role || "patient"); // Role from Firestore or default to "patient"
      }
    } catch (error) {
      console.error("Error fetching profile:", error.message);
      toast.error("Failed to load profile data");
    }
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleSuccess = (result) => {
    setAvatarUrl(result.info.secure_url);
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(firestore, "users", user.uid);
        await updateDoc(docRef, {
          name,
          avatarUrl,
        });
        toast.success("Profile updated successfully");
        setEditMode(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error.message);
      toast.error("Failed to update profile");
    }
  };
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 md:p-10 md:py-7 p-3">
      <div className="col-span-3">
        <h2 className="font-secondary pl-3 pb-2 text-xl font-semibold ">
          User Profile
        </h2>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 shadow-xl border-2 border-slate-300 rounded-xl p-10"
        >
          <div className="flex flex-col gap-3 md:gap-5 md:flex-row items-start md:items-start space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-shrink-0 ">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Uploaded Image"
                  width={200}
                  height={200}
                  className="rounded-lg border border-slate-300 object-cover"
                />
              ) : (
                <FaUser
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
                        <LuImagePlus /> <span className="text-sm pt-1">New Image</span>
                      </Button>
                    )}
                  </CldUploadWidget>
                </div>
              )}
            </div>

            <div className=" flex-grow flex-col flex gap-4">
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

              <div className="grid grid-cols-3 gap-1 items-center ">
                <label className="label col-span-1"></label>

                {/* Edit/Save Button */}
                <div
                  className={`flex col-span-2 gap-4 ${
                    editMode ? "justify-between" : "justify-end"
                  }`}
                >
                  {editMode && email && (
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
                      role === "doctor" && router.push("/")
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
        <div  className="lg:pt-8 md:pt-7 pt-7">
        <h2 className="font-secondary pl-3 pb-2 text-xl font-semibold ">
          Popular Doctors
        </h2>
        <div className=" shadow-xl border-2 border-slate-300 rounded-xl pt-5 " >

          <DoctorList heading="" />
        </div>
        </div>
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

export default PatientProfile;
