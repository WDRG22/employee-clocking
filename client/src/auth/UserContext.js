import React, { createContext, useState, useContext, useEffect } from 'react';

const ACCOUNT_ENDPOINT = "https://localhost:8080/api/account";
const UserContext = createContext();

export const useUser = () => {
    return useContext(UserContext);
}

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch userData when component mounts
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(ACCOUNT_ENDPOINT, {
                    method: 'GET',
                    mode: 'cors',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(data)
                    setUser(data.user);
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
        <UserContext.Provider value={{ user, setUser, isLoading }}>
            {children}
        </UserContext.Provider>
    );
}


