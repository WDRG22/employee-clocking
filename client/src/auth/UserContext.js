import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchWithTokenRefresh } from '../utils/apiUtils';

const UserContext = createContext();

export const useUser = () => {
    return useContext(UserContext);
}

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch userData when component mounts
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetchWithTokenRefresh("/api/account", {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                    setIsClockedIn(data.isClockedIn);
                    console.log('HERE')
                    console.log(data)
                } else {
                    setUser(null);
                }

            } catch (error) {
                console.log("Error fetching user data: ", error);
            } finally {
                setIsLoading(false)
            }
        };
        fetchUserData();
    }, [setUser, setIsClockedIn]);

    return (
        <UserContext.Provider value={{ user, setUser, isLoading }}>
            {children}
        </UserContext.Provider>
    );
}


