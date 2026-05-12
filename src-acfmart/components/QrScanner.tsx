import React, { useState, useEffect, useRef } from 'react';
import { Camera, CameraOff, Scan, X, RotateCcw } from 'lucide-react';

interface QrScannerProps {
  onScanSuccess: (result: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

export function QrScanner({ onScanSuccess, onError, onCancel }: QrScannerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const workerRef = useRef<Worker | null>(null);

  // Initialize QR scanner
  useEffect(() => {
    initCamera();
    initQrWorker();

    return () => {
      cleanup();
    };
  }, []);

  const initQrWorker = () => {
    // In a real implementation, we would use a QR code scanning library like jsQR
    // For now, we'll simulate it with a timeout to mimic scanning
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  };

  const initCamera = async () => {
    try {
      // Get available devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length === 0) {
        setError('Không tìm thấy camera nào trên thiết bị này');
        setHasPermission(false);
        return;
      }

      setDevices(videoDevices);
      
      // Try to use the first camera
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment', // Prefer back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setHasPermission(true);
      setIsLoading(false);
    } catch (err) {
      console.error('Camera initialization error:', err);
      setError('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.');
      setHasPermission(false);
    }
  };

  const switchCamera = async () => {
    if (!devices || devices.length <= 1) return;

    // Find next camera device
    const currentIndex = devices.findIndex(d => d.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    const nextDeviceId = devices[nextIndex].deviceId;

    setSelectedDeviceId(nextDeviceId);

    // Restart camera with new device
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: nextDeviceId,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error switching camera:', err);
      setError('Không thể chuyển đổi camera');
    }
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  };

  // Simulate scanning process - in a real implementation, this would use a QR library
  useEffect(() => {
    if (!isLoading && hasPermission) {
      // Simulate finding a QR code after a delay
      const scanTimer = setTimeout(() => {
        // In a real app, this would be the result from the QR scanning library
        onScanSuccess('ACF_PRODUCT_123456789'); // Simulated QR code result
      }, 3000);
      
      return () => clearTimeout(scanTimer);
    }
  }, [isLoading, hasPermission]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      <div className="p-4 flex justify-between items-center bg-gray-900">
        <h2 className="text-white text-lg font-bold">Quét mã QR xác minh sản phẩm</h2>
        <button 
          onClick={onCancel}
          className="text-white p-2 hover:bg-gray-700 rounded-full"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 relative">
        {hasPermission ? (
          <div className="w-full h-full flex items-center justify-center">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className="w-full h-full object-contain"
            />
            
            {/* Scanning overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-64 h-64 border-2 border-red-500">
                <div className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-red-500"></div>
                <div className="absolute -top-1 -right-1 w-8 h-8 border-t-2 border-r-2 border-red-500"></div>
                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-2 border-l-2 border-red-500"></div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-red-500"></div>
                
                <div className="absolute inset-0 border-2 border-dashed border-red-500 animate-pulse"></div>
              </div>
            </div>
            
            {/* Scanning indicator */}
            {isLoading && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-70 p-4 rounded-lg">
                <div className="flex flex-col items-center">
                  <Scan className="w-8 h-8 text-white animate-pulse mb-2" />
                  <span className="text-white">Đang khởi tạo camera...</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <CameraOff className="w-16 h-16 text-red-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Không thể truy cập camera</h3>
            <p className="text-gray-300 mb-4">
              Vui lòng kiểm tra lại quyền truy cập camera trong cài đặt trình duyệt hoặc thiết bị của bạn.
            </p>
            {error && <p className="text-red-400 mb-4">{error}</p>}
            <button 
              onClick={initCamera}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Thử lại
            </button>
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-900 flex justify-center space-x-4">
        {hasPermission && devices.length > 1 && (
          <button
            onClick={switchCamera}
            className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full text-white"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}