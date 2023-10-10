import React, { useState, useEffect } from 'react';
import Header from '../../components/header/Header';
import { useUser } from "../../auth/UserContext";
import { fetchWithTokenRefresh } from '../../utils/apiUtils';
import Loading from '../../components/loading/Loading';
import './Dashboard.css';

const useClock = (userId, setIsClockedIn) => {
    const [clockResult, setClockResult] = useState(null);
    
    const resetClockResult = () => {
        setClockResult(null);
    };

    const getLocation = () => {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(position => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            }, reject);
        });
    };

    const clock = async (endpoint, userId, currentTime, location) => {
        const payload = { userId, currentTime, location };
        try {
            const response = await fetchWithTokenRefresh(endpoint, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            setClockResult(data.message)
            setIsClockedIn(data.isClockedIn)
        } catch (error) {
            setClockResult("An error occurred. Please try again.");        }
    };

    const handleClockIn = async () => {
        const location = await getLocation();
        clock('/api/clock_in', userId, new Date(), location);
    };

    const handleClockOut = async () => {
        const location = await getLocation();
        clock('/api/clock_out', userId, new Date(), location);
    };

    return [handleClockIn, handleClockOut, clockResult, resetClockResult];
};

export const Dashboard = () => {
    const { user, isLoading, isClockedIn, setIsClockedIn } = useUser();
    const [date, setDate] = useState(new Date());
    const [handleClockIn, handleClockOut,  clockResult, resetClockResult] = useClock(user.user_id, setIsClockedIn);

    useEffect(() => {
        const timer = setInterval(() => setDate(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (isLoading) return <Loading />;

    return (
        <div className='dashboard'>
            <Header />
            <div className="dashboardContainer">
                <h1 className='userName'>{user.first_name} {user.last_name}</h1>
                <div className='timeDisplayContainer'>
                    <p className="timeDisplay">Local Date : {date.toLocaleDateString()}</p>
                    <p className="timeDisplay">Local Time : {date.toLocaleTimeString()}</p>                                        
                </div>
                <div className="buttonGroup">
                    <button
                        className="button" 
                        onClick={handleClockIn}
                        disabled={isClockedIn ? true : null}
                    >
                        Clock In
                    </button>
                    <button
                        className="button" 
                        onClick={handleClockOut}
                        disabled={!isClockedIn ? true : null}
                    >
                        Clock Out
                    </button>
                </div>
                <div className={`clockStatus ${isClockedIn ? 'ClockedIn' : 'ClockedOut'}`}>
                        {isClockedIn ? 'Clocked In' : 'Clocked Out'}
                    </div>
            </div>
        </div>
    );
};

export default Dashboard;
