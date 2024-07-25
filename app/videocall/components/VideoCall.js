'use client'
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AgoraUIKit } from 'agora-react-uikit';

// Dynamic import to avoid SSR issues
const AgoraUIKitDynamic = dynamic(() => import('agora-react-uikit'), { ssr: false });

const VideoCall = () => {
  const [videoCall, setVideoCall] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  const rtcProps = {
    appId: '056b8e2d9ceb43179933fab6943d9d65', // replace with your Agora App ID
    channel: 'test',
    token: null,
    role: 'host',

    dualStreamMode: 2,
    dualStreamUids: [12345], // Example UID for dual stream
  };

  const callbacks = {
    EndCall: () => setVideoCall(false),
  };

  useEffect(() => {
    // Cleanup function to prevent multiple initializations
    return () => {
      setVideoCall(false);
    };
  }, []);

  return videoCall ? (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
      <div className="relative w-full h-full">
        <AgoraUIKitDynamic
          rtcProps={rtcProps}
          callbacks={callbacks}
          styleProps={{
            UIKitContainer: { width: '100%', height: '100%' },
            localBtnContainer: { display: 'none' },
          }}
        />
        <div className="absolute top-2 left-2 w-1/4">
          <AgoraUIKitDynamic
            rtcProps={rtcProps}
            callbacks={callbacks}
            styleProps={{
              UIKitContainer: { width: '100%', height: '100%' },
              localBtnContainer: { display: 'none' },
            }}
          />
        </div>
        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-4">
          <button
            onClick={() => setIsVideoMuted(!isVideoMuted)}
            className="bg-blue-500 text-white p-2 rounded"
          >
            {isVideoMuted ? 'Turn Video On' : 'Turn Video Off'}
          </button>
          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className="bg-blue-500 text-white p-2 rounded"
          >
            {isAudioMuted ? 'Turn Audio On' : 'Turn Audio Off'}
          </button>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <button onClick={() => setVideoCall(true)} className="bg-blue-500 text-white p-4 rounded">
        Start Call
      </button>
    </div>
  );
};

export default VideoCall;
