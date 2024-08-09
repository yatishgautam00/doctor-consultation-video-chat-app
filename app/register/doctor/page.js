"use client";
import React, { useState, useEffect } from "react";
import { auth, firestore } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import { FaUserDoctor } from "react-icons/fa6";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LuImagePlus } from "react-icons/lu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

function page() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [doctorImg, setDoctorImg] = useState("");
  const [exp, setExp] = useState("");
  const [address, setAddress] = useState("");
  const [numpatients, setNumpatients] = useState("");
  const [about, setAbout] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("");
  const [moreinfo, setMoreinfo] = useState("");
  const [categories, setCategories] = useState([]);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // If the user is not authenticated, redirect to the login page
        router.replace("/");
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(firestore, "categorylist")
        );
        const categoriesList = querySnapshot.docs.map((doc) => doc.data());
        setCategories(categoriesList);
      } catch (error) {
        console.error("Error fetching categories: ", error);
      }
    };
    fetchCategories();
  }, []);

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const newErrors = {};
    if (!doctorImg.trim()) {
      newErrors.doctorImg = "Image is required";
    }

    console.log(category);
    if (!(phone.length === 10) || isNaN(Number(phone))) {
      newErrors.phone = "Number is required";
    }
    if (!category.trim()) {
      newErrors.category = "required";
    }
    if (!address.trim()) {
      newErrors.address = "required";
    }
    if (!about.trim()) {
      newErrors.about = "Additional details are required";
    }
    if (!exp.trim() || isNaN(Number(exp))) {
      newErrors.exp = "required";
    }
    if (!numpatients.trim() || isNaN(Number(numpatients))) {
      newErrors.numpatients = "required";
    }
    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!email.trim() || !emailRegex.test(email)) {
      newErrors.email = "Invalid email address";
    }
    if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setLoading(true);
    try {
      if (validateForm()) {
        // Register user with Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        // Now you can use the user's UID as the document ID
        const docRef = doc(firestore, "users", user.uid);
        await setDoc(docRef, {
          name,
          email: email,
          doctorImg,
          status: "online",
          role: "doctor",
          exp,
          about,
          address,
          phone,
          numpatients,
          category,
        });
        const notificationDocRef = doc(firestore, "notifications", user.uid);
        await setDoc(notificationDocRef, {});

        router.push("/");
        setErrors({});
      }
    } catch (error) {
      // Handle registration errors
      console.error("Error registering user:", error.message);
      toast.error(error.message);
      setErrors({});
    }
    setLoading(false);
  };

  const handleSuccess = (result) => {
    setDoctorImg(result.info.secure_url);
    console.log("Uploaded image URL:", result.info.secure_url);
  };

  return (
    <div className="flex justify-center items-center h-screen font-primary md:p-10 p-3 md:pt-0 pt-0">
      {/*form*/}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 w-full max-w-2xl border border-slate-300 rounded-lg shadow-xl lg:p-10 md:p-10 p-5"
      >
        <h1 className="font-secondary text-xl text-center font-semibold text-primary">
          <span className="text-black font-normal text-md">
            Sign-Up as Doctor to
          </span>{" "}
          <span className="font-bold text-2xl">VaidyaPadma</span>
        </h1>

        {/* Display the avatar and refresh button */}
        <div className="flex items-center space-y-2 justify-between border border-gray-200 p-2">
          {/* <img src={avatarUrl} alt="Avatar" className=" rounded-full h-20 w-20" />
          <button type="button" className="btn btn-outline" onClick={handleRefreshAvatar}>
            New Avatar
          </button> */}
          {doctorImg && (
            <div className="md:pl-4">
              <img
                src={doctorImg}
                alt="Uploaded Image"
                width="45"
                className="rounded-full border-1 border-slate-200"
              />
            </div>
          )}
          {!doctorImg && (
            <div className="md:pl-4">
              <FaUserDoctor
                className="rounded-full border-2 border-slate-200"
                size={50}
              />
            </div>
          )}

          <div className=" px-6 py-4">
            <CldUploadWidget
              uploadPreset="ml_default"
              onSuccess={handleSuccess}
              value={doctorImg}
            >
              {({ open }) => {
                return (
                  <Button onClick={() => open()} variant='outline' className="btn border-2 border-slate-600 btn-outline w-min  text-xl ">
                    <LuImagePlus /> <span className="text-sm pt-1 pl-2">Upload</span>
                  </Button>
                );
              }}
            </CldUploadWidget>
          </div>
        </div>
        {errors.doctorImg && (
          <span className="text-red-500">{errors.doctorImg}</span>
        )}

        {/*name*/}
        <div>
          <label className="label">
            <span className="text-base label-text">Name</span>
          </label>
          <Input
            type="text"
            placeholder="Name"
            className="w-full input input-bordered"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && <span className="text-red-500">{errors.name}</span>}
        </div>

        {/*email*/}
        <div>
          <label className="label">
            <span className="text-base label-text">Email</span>
          </label>
          <Input
            type="text"
            placeholder="Email"
            className="w-full input input-bordered"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <span className="text-red-500">{errors.email}</span>}
        </div>

        {/*password*/}
        <div className="flex lg:flex-row w-full justify-between flex-col gap-3 md:flex-row lg:gap-5">
          <div className="w-full">
            <label className="label">
              <span className="text-base label-text">Password</span>
            </label>
            <Input
              type="password"
              placeholder="Enter Password"
              className="w-full input input-bordered"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && (
              <span className="text-red-500">{errors.password}</span>
            )}
          </div>

          {/*confirm password*/}
          <div className="w-full">
            <label className="label">
              <span className="text-base label-text">Confirm Password</span>
            </label>
            <Input
              type="password"
              placeholder="Confirm Password"
              className="w-full input input-bordered"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {errors.confirmPassword && (
              <span className="text-red-500">{errors.confirmPassword}</span>
            )}
          </div>
        </div>

        <div>
          <AlertDialog>
            <AlertDialogTrigger value={about}>
              {" "}
              <div className="flex flex-col">
                <span className="bg-sky-800 px-3 py-1 text-white text-md rounded-lg">
                  Add more details
                </span>
                {errors.about && (
                  <span className="text-red-500">{errors.about}</span>
                )}
              </div>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Details.</AlertDialogTitle>
                <AlertDialogDescription className="flex flex-col gap-5">
                  {/*phone*/}
                  <div className="flex flex-row gap-4">
                    <div>
                      <label className="label">
                        <span className="text-base text-slate-950  label-text">
                          Phone
                        </span>
                      </label>
                      <Input
                        type="text"
                        placeholder="Phone number"
                        className="w-full input  "
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                      {errors.phone && (
                        <span className="text-red-500">{errors.phone}</span>
                      )}
                    </div>
                    {/* experience */}
                    <div>
                      <label className="label">
                        <span className="text-base text-slate-950 label-text">
                          Years of Experience
                        </span>
                      </label>
                      <Input
                        type="number"
                        placeholder="Experience"
                        className="w-full input"
                        value={exp}
                        onChange={(e) => setExp(e.target.value)}
                      />
                      {errors.exp && (
                        <span className="text-red-500">{errors.exp}</span>
                      )}
                    </div>
                  </div>
                  {/* specialization */}
                  <div className="flex flex-row gap-4">
                    <div>
                      <label className="label">
                        <span className="text-base text-slate-950 label-text">
                          Specialization
                        </span>
                      </label>
                      {/* <Input 
            type="text"
            placeholder="category"
            className="w-full input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          /> */}
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="category" />
                        </SelectTrigger>
                        <SelectContent className="pb-10">
                          {categories.map((category, index) => (
                            <SelectItem value={category.category} key={index}>
                              {category.category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {errors.category && (
                        <span className="text-red-500">{errors.category}</span>
                      )}
                    </div>
                    {/* number of patients */}
                    <div>
                      <label className="label">
                        <span className="text-base text-slate-950 label-text">
                          Number of Patients
                        </span>
                      </label>
                      <Input
                        type="text"
                        placeholder="Total Patients"
                        className="w-full input"
                        value={numpatients}
                        onChange={(e) => setNumpatients(e.target.value)}
                      />
                      {errors.numpatients && (
                        <span className="text-red-500">
                          {errors.numpatients}
                        </span>
                      )}
                    </div>
                  </div>
                  {/*address*/}
                  <div>
                    <label className="label">
                      <span className="text-base text-slate-950 label-text">
                        Address
                      </span>
                    </label>
                    <Input
                      type="text"
                      placeholder="Current Address"
                      className="w-full input"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                    {errors.address && (
                      <span className="text-red-500">{errors.address}</span>
                    )}
                  </div>
                  {/*about*/}
                  <div>
                    <label className="label">
                      <span className="text-base text-slate-950 label-text">
                        About
                      </span>
                    </label>

                    <Textarea
                      type="text"
                      placeholder="About"
                      className="w-full input"
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                    />
                    {errors.about && (
                      <span className="text-red-500">{errors.about}</span>
                    )}
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div>
          <Button type="submit" className="btn btn-block  text-white">
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Sign Up"
            )}
          </Button>
        </div>

        <span>
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            Login
          </Link>
        </span>
      </form>
    </div>
  );
}

export default page;
