import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchWithTokenRefresh } from '../utils/apiUtils';
import { TailSpin } from 'react-loading-icons';
import './LoadingSpinner.css'

const UserContext = createContext();

export const useUser = () => {
    return useContext(UserContext);
}

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const setIsClockedIn = (status) => {
        if (user) {
            setUser(user => ({
                ...user,
                isClockedIn: status
            }));
        }
    };

    // Fetch userData when component mounts
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetchWithTokenRefresh("/api/users/user", {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();          
                    setUser(data.user);
                    setIsClockedIn(data.isClockedIn)
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
    }, [setUser]);

    return (
        <UserContext.Provider value={{ user, setUser, isLoading, setIsClockedIn }}>
            {isLoading ? <TailSpin className='loadingSpinner'/> : children}
        </UserContext.Provider>
    );
}