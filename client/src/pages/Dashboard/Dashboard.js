import React, { useState, useEffect } from 'react';
import Header from '../../components/header/Header';
import { useUser } from "../../auth/UserContext";
import { fetchWithTokenRefresh } from '../../utils/apiUtils';
import Loading from '../../components/loading/Loading';
import './Dashboard.css';

const useClock = (employeeId) => {
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

    const clock = async (endpoint, employeeId, currentTime, location) => {
        const payload = { employeeId, currentTime, location };
        try {
            const response = await fetchWithTokenRefresh(endpoint, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.error(`Error during ${endpoint === '/api/clock_in' ? "clock-in" : "clock-out"}:`, error);
        }
    };

    const handleClockIn = async () => {
        const location = await getLocation();
        clock('/api/clock_in', employeeId, new Date(), location);
    };

    const handleClockOut = async () => {
        const location = await getLocation();
        clock('/api/clock_out', employeeId, new Date(), location);
    };

    return [handleClockIn, handleClockOut];
};

export const Dashboard = () => {
    const { user, isClockedIn, isLoading } = useUser();
    const [date, setDate] = useState(new Date());
    const [handleClockIn, handleClockOut] = useClock(user.employee_id);

    useEffect(() => {
        const timer = setInterval(() => setDate(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (isLoading) return <Loading />;

    return (
        <div className='dashboard'>
            <Header />
            <div className="dashboardContainer">
                <h1>{user.first_name} {user.last_name}</h1>
                <div className='timeDisplayContainer'>
                    <p className="timeDisplay">Local Time : {date.toLocaleTimeString()}</p>
                    <p className="timeDisplay">Local Date : {date.toLocaleDateString()}</p>
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
                        // disabled={!isClockedIn ? true : null}
                    >
                        Clock Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
