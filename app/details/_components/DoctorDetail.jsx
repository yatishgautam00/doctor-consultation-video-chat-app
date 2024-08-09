"use client";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { firestore } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  onSnapshot,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { FaUserGraduate, FaMapMarkerAlt } from "react-icons/fa";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { IoMdClose, IoMdListBox } from "react-icons/io";
import { FaChevronCircleUp } from "react-icons/fa";
import toast from "react-hot-toast";
import { MdExpandCircleDown } from "react-icons/md";
import { MdOutlineStar, MdVisibility } from "react-icons/md";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FaStar } from "react-icons/fa";
import { MdOutlineStarBorder } from "react-icons/md";
import RatingList from "./RatingList";

function DoctorDetail({ doctorList, currentUser }) {
  const [date, setDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [moreInfo, setMoreInfo] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [mode, setMode] = useState("");
  const [rating, setRating] = useState(0);
  const [ratingMsg, setRatingMsg] = useState("");
  const [ratings, setRatings] = useState([]);
  const timeSlots = [
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "01:00 PM",
    "01:30 PM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
    "05:00 PM",
    "05:30 PM",
    "06:00 PM",
    "06:30 PM",
    "07:00 PM",
  ];
  const [averageRating, setAverageRating] = useState(0);
  const [currentUserHasRated, setCurrentUserHasRated] = useState(false);
  const [currentUserMsg, setCurrentUserMsg] = useState("");
  const [currentUserRating, setCurrentUserRating] = useState(0);
  const [showRatings, setShowRatings] = useState(false);
  const params1 = usePathname();
  const doctorId = params1.split("/")[2];
  const selectedDoctor = doctorList.find(
    (doctor) => doctor.id === doctorId && doctor.role === "doctor"
  );

  const handleRating = (rate) => {
    setRating(rate);
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      if (selectedDoctor && date) {
        const appointmentsRef = collection(firestore, "appointments");
        const q = query(
          appointmentsRef,
          where("doctorEmail", "==", selectedDoctor.email),
          where("date", "==", date.toDateString())
        );
        const querySnapshot = await getDocs(q);

        let bookedTimes = new Set();

        querySnapshot.forEach((doc) => {
          const appointment = doc.data();
          if (
            appointment.status !== "Expired" &&
            appointment.status !== "Rejected"
          ) {
            bookedTimes.add(appointment.time);
          }
        });

        // Filter available times for today to exclude past times
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();
        const filteredTimes = timeSlots.filter((slot) => {
          if (bookedTimes.has(slot)) return false;
          if (!isToday) return true;
          const [hours, minutes] = slot.split(/[: ]/);
          let slotDate = new Date(today);
          slotDate.setHours((hours % 12) + (slot.includes("PM") ? 12 : 0));
          slotDate.setMinutes(parseInt(minutes, 10));
          return slotDate > today;
        });

        setAvailableTimes(filteredTimes);
      } else {
        setAvailableTimes(timeSlots);
      }
    };

    fetchAppointments();
  }, [date, selectedDoctor]);

  useEffect(() => {
    if (selectedDoctor) {
      const ratingsRef = collection(firestore, "ratings");
      const q = query(
        ratingsRef,
        where("doctorEmail", "==", selectedDoctor.email)
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const ratingsList = [];
        let totalRating = 0;
        let userHasRated = false;
        let userMsg = "";
        let userRating = 0;

        querySnapshot.forEach((doc) => {
          const ratingData = doc.data();
          ratingsList.push(ratingData);

          totalRating += ratingData.userRating;

          if (ratingData.userEmail === currentUser.email) {
            userHasRated = true;
            userMsg = ratingData.userMsg;
            userRating = ratingData.userRating;
          }
        });

        const average =
          ratingsList.length > 0 ? totalRating / ratingsList.length : 0;

        setRatings(ratingsList);
        setAverageRating(average);
        setCurrentUserHasRated(userHasRated);
        setCurrentUserMsg(userMsg);
        setCurrentUserRating(userRating);
      });

      return () => unsubscribe();
    }
  }, [selectedDoctor, currentUser.email]);

  const handleRateDoctor = async () => {
    if (!rating || !ratingMsg) {
      toast.error("All fields are required");
      return;
    }
    try {
      await addDoc(collection(firestore, "ratings"), {
        userEmail: currentUser.email,
        userName: currentUser.name,
        userImg: currentUser.avatarUrl,
        userMsg: ratingMsg,
        userRating: rating,
        doctorName: selectedDoctor.name,
        doctorEmail: selectedDoctor.email,
        doctorImg: selectedDoctor.doctorImg,
        visibility: true,
      });

      toast.success("Added successfully");
    } catch (error) {
      toast.error("Failed to create rating");
    }
  };

  const handleMakeAppointment = async () => {
    if (!date || !selectedTime || !moreInfo || !mode) {
      toast.error("All fields are required");
      return;
    }

    try {
      // Create appointment
      await addDoc(collection(firestore, "appointments"), {
        doctorName: selectedDoctor.name,
        doctorEmail: selectedDoctor.email,
        doctorImg: selectedDoctor.doctorImg,
        userName: currentUser.name,
        userImg: currentUser.avatarUrl,
        userEmail: currentUser.email,
        time: selectedTime,
        status: "Pending",
        accepted: false,
        rejected: false,
        expire: false,
        mode: mode,
        date: date.toDateString(),
        message: moreInfo,
      });

      toast.success("Appointment Created Successfully");

      // Reset form fields
      setDialogOpen(false);
      setDate(null);
      setSelectedTime(null);
      setMoreInfo("");
      setMode("");
    } catch (error) {
      console.error("Appointment creation error:", error);
      toast.error("Failed to create appointment");
    }

    // Send SMS to doctor
    try {
      const smsResponse = await fetch("/api/sendSms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctorPhone: selectedDoctor.phone,
          message: `From VaidyaPadma:- A New appointment booked by ${
            currentUser.name
          } on ${date.toDateString()} at ${selectedTime}`,
        }),
      });

      if (!smsResponse.ok) {
        console.error(
          `SMS sending failed: ${smsResponse.status} ${smsResponse.statusText}`
        );
        toast.error("Failed to send SMS to doctor");
        return;
      }

      const smsResult = await smsResponse.json();
      if (smsResult.success) {
        toast.success("SMS sent to doctor successfully");
      } else {
        console.error("SMS sending failed response:", smsResult);
        toast.error("Failed to send SMS to doctor");
      }
    } catch (smsError) {
      console.error("SMS sending error:", smsError);
      toast.error("Failed to send SMS to doctor");
    }
  };

  const handleCloseAppointment = () => {
    setSelectedTime(null);
    setMoreInfo("");
  };

  const handleTimeClick = (time) => {
    setSelectedTime(time);
  };

  const handleMoreInfoChange = (e) => {
    setMoreInfo(e.target.value);
  };
  const handleRatingMsg = (e) => {
    setRatingMsg(e.target.value);
  };

  if (!selectedDoctor) return null;

  const socialMediaList = [
    { id: 1, icon: "/youtube.png" },
    { id: 2, icon: "/linkedin.png" },
    { id: 3, icon: "/facebook.png" },
    { id: 4, icon: "/twitter.png" },
  ];

  const today = new Date();

  const handleSelectChange = (value) => {
    setMode(value);
  };

  const toggleRatings = () => {
    setShowRatings(!showRatings);
  };

  return (
    <>
      <div className="col-span-3 grid grid-cols-2 md:grid-cols-3 border-[1px] p-5 mt-5 rounded-lg">
        <div>
          <img
            src={selectedDoctor.doctorImg}
            width={200}
            height={200}
            alt="doctor image"
            className="rounded-lg h-[280px] w-full object-cover items-center"
          />
        </div>
        <div className="col-span-2 mt-5 md:px-10 flex flex-col gap-3 items-baseline">
          <h2 className="font-bold text-xl">{selectedDoctor.name}</h2>

          <h2 className="flex gap-2 items-center text-gray-5 text-md">
            <MdOutlineStar className="text-xl" />
            <span className="flex flex-row items-center gap-1 font-medium">
              {averageRating.toFixed(1)} ({ratings.length + 150} votes){" "}
            </span>
          </h2>
          <h2 className="flex gap-2 text-gray-5 text-md">
            <FaUserGraduate className="text-xl" />
            <span>{selectedDoctor.exp} Years of Experience</span>
          </h2>
          <h2 className=" text-md flex gap-2 text-gray-5">
            <FaMapMarkerAlt className="text-xl" />
            <span>{selectedDoctor.address}</span>
          </h2>
          <h2 className="text-[14px] bg-blue-100 p-1 rounded-full px-2 text-primary">
            {selectedDoctor.category}
          </h2>
          <Button
            className="mt-2 rounded-xl shadow-md bg-blue-600 shadow-slate-600 hover:bg-blue-900 hover:shadow-md hover:shadow-blue-800"
            onClick={() => setDialogOpen(true)}
            disabled={currentUser.role === "doctor"}
          >
            <div className="flex flex-row justify-center items-center gap-1">
              <div className="text-xl text-center">
                <IoMdListBox />
              </div>
              <div className="flex flex-row gap-1 text-lg">
                <span>Book</span>
                <span> Appointment</span>
              </div>
            </div>
          </Button>
          <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <AlertDialogContent className="overflow-y-scroll no-scrollbar max-h-full">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl flex flex-row justify-between">
                  <div> Book an appointment</div>
                  <AlertDialogCancel onClick={() => setDialogOpen(false)}>
                    <IoMdClose />
                  </AlertDialogCancel>
                </AlertDialogTitle>
                <AlertDialogDescription className="text-black text-lg sm:flex sm:flex-col sm:justify-start text-left md:text-left lg:text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 w-full flex items-center">
                      <Image
                        src={selectedDoctor.doctorImg}
                        alt="Doctor's image"
                        width={50}
                        height={50}
                        className="rounded-full"
                      />
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold">
                          {selectedDoctor.name}
                        </h3>
                        <p>{selectedDoctor.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="date">Preferred date</Label>
                    <Popover className="">
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={
                            "w-full justify-start text-left font-normal " +
                            (!date && "text-muted-foreground")
                          }
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? (
                            format(date, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0"
                        align="start"
                        sideOffset={2}
                      >
                        <DatePicker
                          selected={date}
                          onChange={(selectedDate) => setDate(selectedDate)}
                          inline
                          minDate={today}
                          dateFormat="MMMM d, yyyy"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="mt-4 flex flex-col space-y-4">
                    <Label htmlFor="times">Preferred Time</Label>
                    <div className="flex flex-wrap gap-2">
                      {availableTimes.map((time) => (
                        <Button
                          key={time}
                          variant={
                            selectedTime === time ? "default" : "outline"
                          }
                          onClick={() => handleTimeClick(time)}
                        >
                          {time}
                        </Button>
                      ))}
                      {availableTimes.length === 0 && (
                        <p className="text-sm text-red-500 font-medium">
                          No slot available on this day
                        </p>
                      )}
                    </div>
                    <Label htmlFor="mode">Mode</Label>
                    <Select value={mode} onValueChange={setMode}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Mode</SelectLabel>
                          <SelectItem value="Online">Online</SelectItem>
                          <SelectItem value="Offline">Offline</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <Label htmlFor="moreInfo" className="">
                      Additional Information
                    </Label>
                    <Textarea
                      id="moreInfo"
                      placeholder="Any additional information or special requests..."
                      value={moreInfo}
                      onChange={handleMoreInfoChange}
                    />
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button
                  onClick={handleMakeAppointment}
                  className="bg-blue-500 text-white hover:bg-blue-600"
                >
                  Submit
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {currentUserHasRated && currentUser.role === "patient" ? (
            <div className="flex flex-col mt-2">
              <h2 className="text-lg font-bold">Your Rating</h2>
              <div className="flex gap-1 mt-1 mb-1">
                {Array.from({ length: 5 }, (_, index) => {
                  return (
                    <span key={index}>
                      {index < currentUserRating ? (
                        <MdOutlineStar className="text-yellow-500 w-5 h-5" />
                      ) : (
                        <MdOutlineStarBorder className="text-yellow-500 w-5 h-5" />
                      )}
                    </span>
                  );
                })}
              </div>
              <div className="flex w-full flex-1  select-none cursor-not-allowed border-2 border-blue-100 px-3 py-2 bg-blue-50">
                <p className="">{currentUserMsg}</p>
              </div>
            </div>
          ) : (
            currentUser.role !== "doctor" && (
              <div className="flex flex-col mt-2 w-full">
                <h2 className="text-lg font-semibold flex flex-row items-center">
                  <span>Rate your experience?</span>
                </h2>
                <div className="flex gap-1 mt-1">
                  {Array.from({ length: 5 }, (_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleRating(index + 1)}
                      className="focus:outline-none"
                    >
                      {index < rating ? (
                        <MdOutlineStar className="text-yellow-500 w-5 h-5" />
                      ) : (
                        <MdOutlineStarBorder className="text-yellow-500 w-5 h-5" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col mt-2 w-full">
                  <textarea
                    id="ratingMsg"
                    placeholder="Describe your experience"
                    value={ratingMsg}
                    onChange={handleRatingMsg}
                    className="mt-2 w-full p-2 border rounded"
                  />
                  <Button
                    onClick={handleRateDoctor}
                    className="bg-green-600 w-min hover:bg-green-800 rounded-lg mt-2"
                  >
                    Submit
                  </Button>
                </div>
              </div>
            )
          )}
          <div>
            <h2 className="font-bold pt-2 text-[20px]">About Me</h2>
            <p className="text-gray-500 tracking-wide mt-2 text-justify">
              {selectedDoctor.about}
            </p>
          </div>
        </div>
      </div>
      <div className="text-xl font-bold pl-1 pt-4">User Experiences</div>
      <button
        className="sm:visible md:visible lg:hidden    py-2 rounded-md"
        onClick={toggleRatings}
      >
        {ratings.map(
          (rating, index) =>
            index < 1 &&
            !showRatings && (
              <div className="border-2 mb-0 border-slate-300 px-2 py-2 rounded-t-lg">
                <div className="flex items-center  justify-start space-x-4 ">
                  <img
                    src={rating.userImg}
                    alt="User"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div className="flex-1 ">
                    <h3 className="text-md flex w-full justify-start font-bold">
                      {rating.userName}
                    </h3>
                    <div className="flex">
                      {Array.from({ length: rating.userRating }, (_, i) => (
                        <MdOutlineStar key={i} className="text-yellow-500" />
                      ))}
                    </div>
                  </div>
                </div>
                {rating.userMsg && (
                  <div className="p-1 border- flex justify-start rounded h-max border-gray-300">
                    <p className="whitespace-pre-lin truncate">
                      {rating.userMsg}..{" "}
                    </p>
                  </div>
                )}
              </div>
            )
        )}
        <div
          className={` bg-slate-300 text-lg font-medium py-1 ${
            showRatings && "rounded-lg"
          }`}
        >
          {!showRatings && (
            <div className="flex flex-row items-center justify-center gap-1">
              <span>Show Ratings</span>
              <MdExpandCircleDown />
            </div>
          )}
          {showRatings && (
            <div className="flex flex-row px-14 py-1 items-center justify-center gap-1">
              <span>Hide Ratings</span>
              <FaChevronCircleUp />
            </div>
          )}
        </div>
      </button>

      {/* Conditional Rendering of RatingList */}
      {showRatings && (
        <div className="sm:block md:block lg:block">
          <RatingList ratings={ratings} currentUser={currentUser} />
        </div>
      )}
    </>
  );
}

export default DoctorDetail;
