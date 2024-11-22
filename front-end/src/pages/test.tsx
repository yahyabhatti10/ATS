import React, { useEffect, useRef } from 'react';

interface CameraFeedProps {
    isMuted: boolean;
    isVideoEnabled: boolean;
}

const CameraFeed: React.FC<CameraFeedProps> = ({ isMuted, isVideoEnabled }) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error('Error accessing camera: ', err);
            }
        };

        startCamera();

        // Cleanup function to stop the camera when the component is unmounted
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                const tracks = stream.getTracks();

                tracks.forEach((track) => track.stop());
            }
        };
    }, []);

    // Effect for handling toggling of audio and video streams
    useEffect(() => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            const videoTracks = stream.getVideoTracks();
            const audioTracks = stream.getAudioTracks();

            // Toggle video tracks
            videoTracks.forEach((track) => {
                track.enabled = isVideoEnabled;
            });

            // Toggle audio tracks
            audioTracks.forEach((track) => {
                track.enabled = !isMuted;
            });
        }
    }, [isMuted, isVideoEnabled]);

    return (
        <div>
            <h1>Camera Feed</h1>
            <video ref={videoRef} autoPlay playsInline width="640" height="480" />
        </div>
    );
};

export default CameraFeed;
