"use client";
import React, { useState, useEffect } from "react";
import { firestore } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
  getDocs,
} from "firebase/firestore";
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
import { addMinutes, isAfter, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { FaRegEnvelope } from "react-icons/fa"; // Import message icon from react-icons
import VideoCallButton from "./VideoCallButton";

function AppointmentList({ userId }) {
  const [appointments, setAppointments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [popupContent, setPopupContent] = useState(""); // State for popup content
  const [showPopup, setShowPopup] = useState(false); // State for popup visibility

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current user data
        const userDoc = doc(firestore, "users", userId);
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
          const user = userSnapshot.data();
          setCurrentUser(user);

          // Set up a real-time listener for appointments based on user role
          const appointmentsRef = collection(firestore, "appointments");
          let appointmentsQuery;

          if (user.role === "doctor") {
            appointmentsQuery = query(
              appointmentsRef,
              where("doctorEmail", "==", user.email)
            );
          } else if (user.role === "patient") {
            appointmentsQuery = query(
              appointmentsRef,
              where("userEmail", "==", user.email)
            );
          }

          if (appointmentsQuery) {
            // Fetch initial data
            const initialSnapshot = await getDocs(appointmentsQuery);
            const initialAppointmentsList = initialSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            // Check and update expired appointments
            const now = new Date();
            for (let appointment of initialAppointmentsList) {
              // Parse the appointment date and time to a Date object
              const [appointmentTime, period] = appointment.time.split(" ");
              const [hours, minutes] = appointmentTime.split(":").map(Number);
              const appointmentDateTime = new Date(appointment.date);

              // Adjust the hours for AM/PM format
              let appointmentHours = hours;
              if (period === "PM" && hours < 12) {
                appointmentHours += 12;
              } else if (period === "AM" && hours === 12) {
                appointmentHours = 0; // Midnight case
              }

              // Set the appointment time
              appointmentDateTime.setHours(appointmentHours, minutes);

              // Determine the expiry time
              const expiryTime = addMinutes(appointmentDateTime, 29);

              // Check if the appointment is expired
              if (
                isAfter(now, expiryTime) &&
                appointment.status !== "Expired"
              ) {
                try {
                  const appointmentDoc = doc(
                    firestore,
                    "appointments",
                    appointment.id
                  );
                  await updateDoc(appointmentDoc, {
                    status: "Expired",
                    expired: true,
                    rejected: false,
                    accepted: false,
                  });
                  appointment.status = "Expired"; // Update local state to reflect the change
                } catch (error) {
                  console.error(
                    "Error updating appointment to expired: ",
                    error
                  );
                }
              }
            }

            // Sort appointments by status, date, and time
            const sortedAppointmentsList = initialAppointmentsList.sort(
              (a, b) => {
                const statusPriority = {
                  Pending: 1,
                  Accepted: 2,
                  Rejected: 3,
                  Expired: 4,
                };

                // Compare by status priority
                const statusComparison =
                  statusPriority[a.status] - statusPriority[b.status];
                if (statusComparison !== 0) return statusComparison;

                // If statuses are the same, sort by date and time
                const dateTimeA = new Date(`${a.date}T${a.time}`);
                const dateTimeB = new Date(`${b.date}T${b.time}`);
                return dateTimeA - dateTimeB;
              }
            );

            setAppointments(sortedAppointmentsList);

            // Set up real-time updates
            const unsubscribe = onSnapshot(
              appointmentsQuery,
              (querySnapshot) => {
                const updatedAppointmentsList = querySnapshot.docs.map(
                  (doc) => ({ id: doc.id, ...doc.data() })
                );

                // Sort appointments by status, date, and time
                const sortedUpdatedAppointmentsList =
                  updatedAppointmentsList.sort((a, b) => {
                    const statusPriority = {
                      Pending: 1,
                      Accepted: 2,
                      Rejected: 3,
                      Expired: 4,
                    };

                    // Compare by status priority
                    const statusComparison =
                      statusPriority[a.status] - statusPriority[b.status];
                    if (statusComparison !== 0) return statusComparison;

                    // If statuses are the same, sort by date and time
                    const dateTimeA = new Date(`${a.date}T${a.time}`);
                    const dateTimeB = new Date(`${b.date}T${b.time}`);
                    return dateTimeA - dateTimeB;
                  });

                setAppointments(sortedUpdatedAppointmentsList);
              }
            );

            // Cleanup the listener on component unmount
            return () => unsubscribe();
          }
        } else {
          console.error("No user data found in Firestore");
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, [userId]);

  const handleAccept = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const appointmentDoc = doc(firestore, "appointments", id);
      await updateDoc(appointmentDoc, {
        accepted: true,
        status: "Accepted",
        rejected: false,
      });
    } catch (error) {
      console.error("Error updating appointment: ", error);
      setError("Failed to update appointment.");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const appointmentDoc = doc(firestore, "appointments", id);
      await updateDoc(appointmentDoc, {
        rejected: true,
        status: "Rejected",
        accepted: false,
      });
    } catch (error) {
      console.error("Error updating appointment: ", error);
      setError("Failed to update appointment.");
    } finally {
      setLoading(false);
    }
  };

  const handleShowMessage = (message) => {
    setPopupContent(message);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setPopupContent("");
  };

  return (
    <div className="p-4">
      {error && <p className="text-red-600">{error}</p>}
      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : currentUser.role === "doctor" ? (
        <ul className="space-y-4">
          {appointments.map((appointment) => (
            <li
              key={appointment.id}
              className="flex gap-3 justify-between items-start lg:items-center md:items-center flex-col md:flex-row lg:flex-row border p-4 rounded-lg shadow-md"
            >
              <div className="flex flex-row gap-2 lg:w-72 md:w-64 w-full justify-start items-start">
                <div className="flex-shrink-0">
                  <img
                    src={appointment.userImg}
                    alt="Profile Image"
                    width={50}
                    height={50}
                    className="rounded-full w-16 h-16 object-contain"
                  />
                </div>
                <div className="flex gap-0 pt-1 flex-col truncate flex-grow">
                  <h3 className="font-semibold flex flex-row gap-2 text-lg overflow-hidden whitespace-nowrap text-ellipsis">
                    {appointment.userName}{" "}
                    <FaRegEnvelope
                      className="text-2xl pt-1 text-green-500 cursor-pointer"
                      onClick={() => handleShowMessage(appointment.message)}
                    />
                  </h3>
                  <p className="text-gray-600 overflow-hidden whitespace-nowrap text-ellipsis">
                    {appointment.userEmail}
                  </p>
                </div>
              </div>
              <div className="flex flex-row mt-2 gap-2">
                <p className="text-black font-medium py-1">Status:</p>
                <p
                  className={`text-md px-3 py-1 font-semibold rounded-lg ${
                    appointment.status === "Accepted"
                      ? "bg-green-300"
                      : appointment.status === "Expired"
                      ? "bg-slate-300"
                      : appointment.status === "Rejected"
                      ? "bg-red-300"
                      : "bg-yellow-300" // Default case, e.g., Pending
                  }`}
                >
                  {appointment.status}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-900 font-medium">
                  {format(new Date(appointment.date), "dd MMMM yyyy")}
                </p>
                <p className="text-sm text-gray-900 font-medium">
                  {appointment.time}
                </p>
                <p className="text-sm text-gray-900 font-medium">
                  {appointment.mode}
                </p>
                {appointment.status === "Accepted" &&
                  appointment.mode === "Online" && (
                    <p className="text-xl">
                      <VideoCallButton />
                    </p>
                  )}
              </div>
              {appointment.status === "Pending" && (
                <div className="flex gap-2 lg:w-48 md:w-48 w-full mt-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full bg-green-700 text-white hover:bg-green-500 hover:text-white lg:w-1/2 md:w-1/2"
                      >
                        Accept
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you sure that you{" "}
                          <span className="text-green-700">Accept</span> the
                          appointment?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          accept your appointment.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-2 border-slate-500">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-green-700 hover:bg-green-500"
                          onClick={() => handleAccept(appointment.id)}
                          disabled={appointment.status !== "Pending"}
                        >
                          Accept
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="w-full lg:w-1/2 md:w-1/2"
                      >
                        Reject
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you sure that you{" "}
                          <span className="text-red-700">Reject</span> the
                          appointment?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          reject your appointment.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-2 border-slate-500">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-700 hover:bg-red-500"
                          onClick={() => handleReject(appointment.id)}
                          disabled={appointment.status !== "Pending"}
                        >
                          Reject
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <ul className="space-y-4">
          {appointments.map((appointment) => (
            <li
              key={appointment.id}
              className="flex gap-3 justify-between items-start lg:items-center md:items-center flex-col md:flex-row lg:flex-row border p-4 rounded-lg shadow-md"
            >
              <div className="flex gap-2 lg:w-72 md:w-64 w-full justify-start items-start">
                <div className="flex-shrink-0">
                  <img
                    src={appointment.doctorImg}
                    alt="Profile Image"
                    width={50}
                    height={50}
                    className="rounded-full w-16 h-16 object-contain"
                  />
                </div>
                <div className="flex gap-0 pt-1 flex-col truncate flex-grow">
                  <h3 className="font-semibold flex flex-row gap-2 text-lg overflow-hidden whitespace-nowrap text-ellipsis">
                    {appointment.doctorName}{" "}
                    <FaRegEnvelope
                      className="text-2xl pt-1 text-green-500 cursor-pointer"
                      onClick={() => handleShowMessage(appointment.message)}
                    />
                  </h3>
                  <p className="text-gray-600 overflow-hidden whitespace-nowrap text-ellipsis">
                    {appointment.doctorEmail}
                  </p>
                </div>
              </div>
              <div className="flex flex-row mt-2 gap-2">
                <p className="text-black font-medium py-1">Status:</p>
                <p
                  className={`text-md px-3 py-1 font-semibold rounded-lg ${
                    appointment.status === "Accepted"
                      ? "bg-green-300"
                      : appointment.status === "Expired"
                      ? "bg-slate-300"
                      : appointment.status === "Rejected"
                      ? "bg-red-300"
                      : "bg-yellow-300" // Default case, e.g., Pending
                  }`}
                >
                  {appointment.status}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-900 font-medium">
                  {format(new Date(appointment.date), "dd MMMM yyyy")}
                </p>
                <p className="text-sm text-gray-900 font-medium">
                  {appointment.time}
                </p>
                <p className="text-sm text-gray-900 font-medium">
                  {appointment.mode}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showPopup && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-lg shadow-md max-w-lg w-full">
            <h2 className="text-xl font-semibold mb-4">Additional Message</h2>
            <p>{popupContent}</p>
            <Button className="mt-4" onClick={closePopup}>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppointmentList;
