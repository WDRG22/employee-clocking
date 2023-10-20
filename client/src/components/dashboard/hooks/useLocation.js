import { useState } from 'react';

// Utility function for geocoding employee coordinates
export async function encodeLocation(coord) {
    const lat = coord.latitude;
    const lng = coord.longitude;
    const baseUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`;

    try {
        const response = await fetch(baseUrl);
        if (!response.ok) {
            throw new Error("Error geocoding location with Nominatim.");
        }

        const data = await response.json();
        console.log('location data', data)
        if (data.display_name) {
            return data.display_name;
        } else {
            console.warn("No address found for provided coordinates.");
            return null; // default to null if no address is found
        }
    } catch (error) {
        console.error("Error geocoding location with Nominatim:", error);
        return null; // returning null if there's an error
    }
}

// Hook for getting employee location
export const useLocation = () => {
    const getLocation = async () => {
        try {
            return await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(position => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                }, reject);
            });
        } catch (error) {
            console.error("Error getting location:", error);
            return null; // returning null if there's an error
        }
    };
    return getLocation;
};
