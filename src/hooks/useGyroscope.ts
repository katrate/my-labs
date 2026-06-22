import { useState, useEffect } from 'react';

interface GyroData {
  gamma: number; // left/right tilt (-90 to 90)
  beta: number;  // front/back tilt (-180 to 180)
}

export function useGyroscope() {
  const [gyroData, setGyroData] = useState<GyroData>({ gamma: 0, beta: 0 });
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      setGyroData({
        gamma: event.gamma || 0,
        beta: event.beta || 0,
      });
    };

    if (permissionGranted === true) {
      window.addEventListener('deviceorientation', handleOrientation);
    } else if (permissionGranted === null) {
      // For non-iOS devices that don't need explicit permission
      if (typeof (DeviceOrientationEvent as any).requestPermission !== 'function') {
        window.addEventListener('deviceorientation', handleOrientation);
        setPermissionGranted(true);
      }
    }

    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [permissionGranted]);

  const requestAccess = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission();
        if (permissionState === 'granted') {
          setPermissionGranted(true);
        } else {
          setPermissionGranted(false);
        }
      } catch (error) {
        console.error("Gyroscope permission denied", error);
        setPermissionGranted(false);
      }
    }
  };

  return { gyroData, requestAccess, needsPermission: permissionGranted === null && typeof (DeviceOrientationEvent as any).requestPermission === 'function' };
}
