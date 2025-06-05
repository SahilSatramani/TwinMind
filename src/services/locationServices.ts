import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { GOOGLE_MAPS_API_KEY } from '@env';

export async function fetchLocation(): Promise<string | null> {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) return null;
  }

  return new Promise((resolve) => {
    Geolocation.getCurrentPosition(
      async ({ coords }) => {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=${GOOGLE_MAPS_API_KEY}`;
        try {
          const res = await fetch(url);
          const data = await res.json();
          const components = data.results?.[0]?.address_components || [];

          const city = components.find((c: any) =>
            c.types.includes('locality') || c.types.includes('administrative_area_level_2')
          )?.long_name || 'Unknown';

          const state = components.find((c: any) =>
            c.types.includes('administrative_area_level_1')
          )?.short_name || 'Unknown';

          resolve(`${city}, ${state}`);
        } catch {
          resolve(null);
        }
      },
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  });
}