"use client";

import AgoraRTC, {
  AgoraRTCProvider,
  LocalVideoTrack,
  RemoteUser,
  useJoin,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  usePublish,
  useRTCClient,
  useRemoteAudioTracks,
  useRemoteUsers,
} from "agora-rtc-react";
import React,{useState} from 'react'
import { useRouter, usePathname } from 'next/navigation';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { firestore } from '@/lib/firebase';

function Call(props) {
  const client = useRTCClient(
    AgoraRTC.createClient({ codec: "vp8", mode: "rtc" })
  );
  
  
  const router = useRouter();
  const params = usePathname();
  const docId  = params.split("/")[2]
  const endingVideoCall = async () => {
    try {
      const docRef = doc(firestore, "videoCalls", docId);
      const updateData = { calltoken: false };
      await updateDoc(docRef, updateData);
      toast.success('Call ended');
      
      if (params === "/") {
        router.replace("/");
      } else {
        router.back();
      }
    } catch (error) {
      toast.error('Error updating document: ' + error.message);
      toast.success(docId)
    }
  };


  return (
    <AgoraRTCProvider client={client}>
      <Videos channelName={props.channelName} appId={props.appId} />
      <div className="fixed z-10 bottom-0 left-0 right-0 flex justify-center pb-4">
        <button
          className="px-5 py-3 text-base font-medium text-center text-white bg-red-400 rounded-lg hover:bg-red-500 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900 w-40"
         onClick={endingVideoCall}
        >
          End Call
        </button>
      </div>
    </AgoraRTCProvider>
  );
}

function Videos(props) {
  const { appId, channelName } = props;
  const { isLoading: isLoadingMic, localMicrophoneTrack } = useLocalMicrophoneTrack();
  const { isLoading: isLoadingCam, localCameraTrack } = useLocalCameraTrack();
  const remoteUsers = useRemoteUsers();
  const { audioTracks } = useRemoteAudioTracks(remoteUsers);

  usePublish([localMicrophoneTrack, localCameraTrack]);
  useJoin({
    appid: appId,
    channel: channelName,
    token: null,
  });

  audioTracks.map((track) => track.play());
  const deviceLoading = isLoadingMic || isLoadingCam;
  if (deviceLoading)
    return (
      <div className="flex flex-col items-center pt-40">Loading devices...</div>
    );
  const unit = "minmax(0, 1fr) ";

  return (
    <div className="relative flex flex-wrap w-full h-screen p-1">
    {remoteUsers.map((user, index) => (
      <div key={index} className="flex-1 lg:px-5 px-2  py-2 w-full h-full object-cover cursor-pointer">
        <RemoteUser user={user} />
      </div>
    ))}
    <div className="absolute top-5 lg:top-12 lg:left-10 left-5 w-32 h-32 lg:w-40 lg:h-40 z-40 border-gray-100 ">
    <LocalVideoTrack
      track={localCameraTrack}
      play={true}
    
    />
    </div>
  </div>
  
  );
}

export default Call;
