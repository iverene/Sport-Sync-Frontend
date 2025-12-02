import { useState, useRef, useEffect, useCallback } from "react";
import { X, Scan, ChevronDown } from "lucide-react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";

export default function Scanner({ onScan }) {
  const [isOpen, setIsOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const [videoInputDevices, setVideoInputDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");

  const videoRef = useRef(null);
  const codeReader = useRef(new BrowserMultiFormatReader());

  useEffect(() => {
    if (!isOpen) {
      // Clean up when closed
      codeReader.current.reset();
      return;
    }

    let mounted = true;

    const getDevices = async () => {
      try {
        // FIX: Explicitly ask for permission first. 
        // This ensures external/virtual cameras (like Iriun) are enumerated correctly.
        await navigator.mediaDevices.getUserMedia({ video: true });

        const devices = await codeReader.current.listVideoInputDevices();
        
        if (mounted) {
            setVideoInputDevices(devices);
            if (devices.length > 0) {
                // If we don't have a selected device yet, pick one
                if (!selectedDeviceId) {
                    const defaultDevice = devices.find(d => d.label.toLowerCase().includes('back')) || devices[0];
                    setSelectedDeviceId(defaultDevice.deviceId);
                }
            } else {
                setErrorMsg("No camera found.");
            }
        }
      } catch (err) {
        console.error("Permission Error:", err);
        if (mounted) setErrorMsg("Camera permission denied or device not found.");
      }
    };

    getDevices();

    return () => {
      mounted = false;
      // We don't reset here immediately to prevent flickering if component re-renders,
      // but we depend on isOpen to handle the major cleanup.
    };
  }, [isOpen, selectedDeviceId]); // Added selectedDeviceId to deps to ensure stability


  const startScanning = useCallback(async (deviceId) => {
    if (!deviceId || !videoRef.current) return;

    try {
      // Reset any existing stream first
      codeReader.current.reset();
      
      // Slight delay to ensure video element is ready in DOM
      setTimeout(async () => {
          if (!videoRef.current) return; 

          await codeReader.current.decodeFromVideoDevice(
            deviceId,
            videoRef.current,
            (result, err) => {
              if (result) {
                const text = result.getText();
                console.log("Scanned:", text);
                
                if (onScan) {
                   onScan(text);
                }
                
                // Stop scanning after successful scan
                codeReader.current.reset();
                setIsOpen(false);
              }
              
              if (err && !(err instanceof NotFoundException)) {
                 // console.warn(err);
              }
            }
          );
      }, 500);

    } catch (err) {
      console.error("Start Scan Error:", err);
      setErrorMsg("Failed to start video stream.");
    }
  }, [onScan]);

  // Trigger scanning when the modal is open and we have a device ID
  useEffect(() => {
    if (isOpen && selectedDeviceId) {
        startScanning(selectedDeviceId);
    }
  }, [isOpen, selectedDeviceId, startScanning]);

  return (
    <div>

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-softWhite text-deepBlue p-3 rounded-lg border border-gray-300 hover:shadow-sm transition flex items-center justify-center"
      >
        <Scan size={20} />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-charcoalBlack/40 flex items-center justify-center z-[100] px-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-4 relative space-y-4 shadow-2xl">
            
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="w-full mr-4">
                <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
                    <Scan size={18} /> Scan Barcode
                </h2>
                
                {videoInputDevices.length > 0 ? (
                    <div className="relative">
                        <select 
                            className="appearance-none w-full bg-slate-100 border border-slate-200 text-slate-700 text-xs py-2 pl-3 pr-8 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#002B50]"
                            value={selectedDeviceId}
                            onChange={(e) => {
                                setSelectedDeviceId(e.target.value);
                                // The useEffect will handle restarting the scan with the new ID
                            }}
                        >
                            {videoInputDevices.map((device) => (
                                <option key={device.deviceId} value={device.deviceId}>
                                    {device.label || `Camera ${device.deviceId.slice(0,5)}...`}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                ) : (
                    <p className="text-xs text-red-500">Searching for cameras...</p>
                )}
              </div>
              
              <button
                onClick={() => {
                    setIsOpen(false);
                    codeReader.current.reset(); // Stop camera when closing manually
                }}
                className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={22} />
              </button>
            </div>

            {/* Video Scanner Container */}
            <div className="relative flex flex-col items-center justify-center h-64 bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover opacity-80"
                muted
                autoPlay
                playsInline // FIX: Essential for iOS and some mobile browsers
              />

              {/* --- Visual Guides --- */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-32 border-2 border-green-400 rounded-lg relative shadow-[0_0_0_1000px_rgba(0,0,0,0.5)] overflow-hidden">

                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-green-500 -mt-1 -ml-1"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-green-500 -mt-1 -mr-1"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-green-500 -mb-1 -ml-1"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-green-500 -mb-1 -mr-1"></div>

                  <div className = "absolute left-0 w-full h-0.5 bg-red-500 animate-scanner-line"></div>
                </div>
              </div>
            </div>

            <p className="text-xs text-center text-slate-400 font-medium">
              Select your camera above if the image is blank
            </p>
            {errorMsg && <p className="text-xs text-center text-red-500">{errorMsg}</p>}
          </div>
        </div>
      )}
    </div>
  );
}