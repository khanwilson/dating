import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

export interface LocationState {
  coords: Coordinates | null;
  error: string | null;
  loading: boolean;
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({ coords: null, error: null, loading: true });
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function startTracking() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (!cancelled) {
          setState({ coords: null, error: 'Location permission denied', loading: false });
        }
        return;
      }

      subscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 30_000,
          distanceInterval: 50,
        },
        (loc) => {
          if (!cancelled) {
            setState({
              coords: {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                accuracy: loc.coords.accuracy,
              },
              error: null,
              loading: false,
            });
          }
        },
      );
    }

    startTracking();

    return () => {
      cancelled = true;
      subscriptionRef.current?.remove();
    };
  }, []);

  return state;
}
