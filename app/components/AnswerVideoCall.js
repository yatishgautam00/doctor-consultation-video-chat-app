'use client'
import React,{useState, useEffect} from 'react';
import { useRouter } from 'next/navigation';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { firestore } from '@/lib/firebase';

function AnswerVideoCall({ docId, user1id }) {
  const router = useRouter();
  const [doctorImg, setDoctorImg] = useState(null);
  const [name, setName] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const docRef = doc(firestore, "users", user1id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setDoctorImg(userData.doctorImg);
          setName(userData.name);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching document: ", error);
      }
    };

    if (user1id) {
      fetchUserData();
    }
  }, [user1id]);

  const answerVideoCall = async () => {
    try {
      const docRef = doc(firestore, "videoCalls", docId);
      const updateData = { callStatus: true };
      await updateDoc(docRef, updateData);
      toast.success('Call started');
      router.push(`/channel/${docId}`);
    } catch (error) {
      toast.error('Error updating document: ' + error.message);
    }
  };

  const endingVideoCall = async () => {
    try {
      const docRef = doc(firestore, "videoCalls", docId);
      const updateData = { calltoken: false };
      await updateDoc(docRef, updateData);
      toast.success('Call ended');
      router.push("/");
    } catch (error) {
      toast.error('Error updating document: ' + error.message);
    }
  };

  return (
    <>
    <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
       
      ></div>
    <div className='fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] border-primary translate-y-[-50%] gap-4 border-2 bg-background p-2 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg '>
      <div role="alert" className="rounded-xl border border-gray-100 bg-white p-4">
        <div className="flex  items-start gap-4">
          <div className='flex flex-row gap-2'>
          <img
                      className="w-[70px] h-[70px] rounded-full"
                      width={40}
                      height={40}
                      alt='doctor'
                      src={doctorImg}
                    />
            <h2 className="block font-medium text-2xl text-gray-900">{name}</h2>
          </div>

          <div className="flex-1">
            

            <p className="mt-1 text-sm text-gray-700">You have an incoming video call.</p>

            <div className="mt-4 flex gap-2">
              <button
                onClick={answerVideoCall}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                <span className="text-sm"> Answer </span>
              </button>

              <button className="block rounded-lg px-4 py-2 text-white transition bg-red-600 hover:bg-red-700"
                onClick={endingVideoCall}>
                <span className="text-sm">Decline</span>
              </button>
            </div>
          </div>

          <button className="text-gray-500 transition hover:text-gray-600">
            <span className="sr-only">Dismiss popup</span>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    </>
  );
}

export default AnswerVideoCall;
