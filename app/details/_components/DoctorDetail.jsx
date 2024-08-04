  "use client";
  import { usePathname } from "next/navigation";
  import React, { useState, useEffect } from "react";
  import Image from "next/image";
  import { firestore } from "@/lib/firebase";
  import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
  import { Button } from "@/components/ui/button";
  import { FaUserGraduate, FaMapMarkerAlt } from "react-icons/fa";
  import { Label } from "@/components/ui/label";
  import { Calendar as CalendarIcon } from "lucide-react";
  import { Textarea } from "@/components/ui/textarea";
  import { addMinutes, isAfter, format } from "date-fns";
  import DatePicker from "react-datepicker";
  import "react-datepicker/dist/react-datepicker.css";
  import { IoMdClose, IoMdListBox } from "react-icons/io";
  import toast from "react-hot-toast";
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

  function DoctorDetail({ doctorList, currentUser }) {
    const [date, setDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [moreInfo, setMoreInfo] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [mode, setMode] = useState("");
    const timeSlots = [
      "09:30 AM",
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
    ];

    const params1 = usePathname();
    const doctorId = params1.split("/")[2];
    const selectedDoctor = doctorList.find(
      (doctor) => doctor.id === doctorId && doctor.role === "doctor"
    );

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

          setAvailableTimes(timeSlots.filter((slot) => !bookedTimes.has(slot)));
        } else {
          setAvailableTimes(timeSlots);
        }
      };

      fetchAppointments();
    }, [date, selectedDoctor]);

    const handleMakeAppointment = async () => {
      if (!date || !selectedTime || !moreInfo) {
        toast.error("All fields are required");
        return;
      }

      try {
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
        });

        toast.success("Appointment Created Successfully");

        setDialogOpen(false);
        setDate(null);
        setSelectedTime(null);
        setMoreInfo("");
        setMode("")
      } catch (error) {
        toast.error("Failed to create appointment");
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

    if (!selectedDoctor) return null;

    const socialMediaList = [
      { id: 1, icon: "/youtube.png" },
      { id: 2, icon: "/linkedin.png" },
      { id: 3, icon: "/facebook.png" },
      { id: 4, icon: "/twitter.png" },
    ];

    // Disable past dates
    const today = new Date();
    const handleSelectChange = (value) => {
      setMode(value); // Update state with the selected value
    };
    return (
      <>
        <div className="col-span-3 grid grid-cols-1 md:grid-cols-3 border-[1px] p-5 mt-5 rounded-lg">
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
            <h2 className="flex gap-2 text-gray-5 text-md">
              <FaUserGraduate className="text-xl" />
              <span>{selectedDoctor.exp} Years of Experience</span>
            </h2>
            <h2 className=" text-md flex gap-2 text-gray-5">
              <FaMapMarkerAlt className="text-xl" />
              <span>{selectedDoctor.address}</span>
            </h2>
            <h2
              className="text-[14px] bg-blue-100 p-1 rounded-full
              px-2 text-primary"
            >
              {selectedDoctor.category}
            </h2>
            {/* <div className="flex gap-3">
              {socialMediaList.map((item, index) => (
                <Image src={item.icon} key={index} width={30} height={30} />
              ))}
            </div> */}
            <Button
              className="mt-2 rounded-xl shadow-md shadow-slate-600 hover:bg-blue-900 hover:shadow-md hover:shadow-blue-800"
              onClick={() => setDialogOpen(true)}
              disabled={currentUser.role === "doctor"}
            >
              <div className="flex flex-row justify-center items-center gap-1">
                <div className="text-xl  text-center">
                  <IoMdListBox />
                </div>
                <div className="flex flex-row gap-1 text-lg ">
                  <span>Book</span>
                  <span> Appointment</span>
                </div>
              </div>
            </Button>
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <AlertDialogContent className="overflow-y-scroll no-scrollbar max-h-full">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-2xl flex flex-row justify-between">
                    <div className=""> Book an appointment</div>
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
                        <PopoverContent className="w-auto p-0">
                          <DatePicker
                            selected={date}
                            onChange={(date) => setDate(date)}
                            minDate={today}
                            dateFormat="MMMM d, yyyy"
                            className="p-2 border rounded-md absolute top-0 left-0 w-full h-full opacity-0 pointer-events-none"
                          />
                        </PopoverContent>
                      </Popover>
                      <Label htmlFor="time">Preferred Time</Label>
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
                      </div>
                      <Label htmlFor="moreInfo">Select Mode</Label>
                      <Select onValueChange={handleSelectChange} value={mode}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a Mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                          <SelectItem value="Online">Online</SelectItem>
                            <SelectItem value="Offline">Offline</SelectItem>
                        
                            
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <Label htmlFor="moreInfo" className="">Additional Information</Label>
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
                  <Button type="submit" onClick={handleMakeAppointment}>
                    Make Appointment
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <div>
              <h2 className="font-bold pt-2 text-[20px]">About Me</h2>
              <p className="text-gray-500 tracking-wide mt-2 text-justify">
                {selectedDoctor.about}
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  export default DoctorDetail;
