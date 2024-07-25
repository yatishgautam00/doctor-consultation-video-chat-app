"use client";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { format, set } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { IoMdClose } from "react-icons/io";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import React from "react";
import { IoMdListBox } from "react-icons/io";
import { now } from "moment";
import toast from "react-hot-toast";
import { useRouter,usePathname } from "next/navigation";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

function Appointment() {
  const router = useRouter();
  const params = usePathname();
  const [date, setDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [moreInfo, setMoreInfo] = useState("");
  const timeSlots = [
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

  const isDateDisabled = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Ensure we are comparing only the date part
    const maxDate = new Date("2050-01-01");
    return date < today || date > maxDate;
  };

  const handleMakeAppointment = () => {
    if (!date || !selectedTime || !phoneNumber || !moreInfo) {
      toast.error("Data Required");
    } else {
      toast.success("Appointment Created");
      router.replace(`${params}`)
    }
  };
  const handleCloseAppointment = () => {
    setSelectedTime(null);
    setMoreInfo(null);
    setPhoneNumber(null);
  };
  const handleDateChange = (date) => {
    setSelectedTime(null); // Reset selected time when date changes
  };
  const handleTimeClick = (time) => {
    setSelectedTime(time);
  };
  const handleMoreInfo = (time) => {
    setMoreInfo(time);
  };
  const handlePhoneChange = (e) => {
    setPhoneNumber(e.target.value);
  };
  return (
    <form>
      
      <AlertDialog className='p-6'>
        <AlertDialogTrigger asChild>
          <button
            title="Appointment"
            variant="outline"
            className="flex hover:text-primary"
          >
            <div className="text-3xl pr-3 ">
              <IoMdListBox />
            </div>
            Appointment
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent className=" overflow-y-scroll no-scrollbar max-h-full">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl flex flex-row justify-between  ">
             <div className=""> Book an appointment</div>
              <AlertDialogCancel onChange={handleCloseAppointment}>
              <IoMdClose />
            </AlertDialogCancel>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-black text-lg sm:flex sm:flex-col sm:justify-start text-left md:text-left lg:text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 w-full ">
                  <Label htmlFor="name" className="items-start justify-start">
                    Full name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="Enter your email"
                    type="email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="Enter your phone number"
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="date" className="block text-sm   mb-2">
                    Preferred date
                  </label>
                  <Popover className="">
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={isDateDisabled}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <Label htmlFor="time">Preferred time</Label>
                <div className="flex flex-wrap gap-2">
                  {timeSlots.map((slot, index) => (
                    <Button
                      key={index}
                      onClick={() => handleTimeClick(slot)}
                      variant={selectedTime === slot ? "outline" : "outline"}
                      required
                      className={`${
                        selectedTime === slot
                          ? "border-2 border-blue-600 text-blue-500" // Blue outline for selected
                          : "border-2 "
                      }`}
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <Label htmlFor="comments">More Information About Problem</Label>
                <Textarea
                  id="text"
                  placeholder="Enter any additional comments"
                  className="min-h-[100px]"
                  onChange={handleMoreInfo}
                
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onChange={handleCloseAppointment}>
              Cancel
            </AlertDialogCancel>
            <Button onClick={handleMakeAppointment} type="submit">
              Confirm
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}

export default Appointment;
