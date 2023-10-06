import React, { useState, useEffect } from 'react';
import Header from '../../components/header/Header';
import { useUser } from "../../auth/UserContext";
import './Dashboard.css';

const clockIn = async (employeeId, location, currentTime) => {
    try {
        const payload = {
            employeeId,
            location,
            currentTime
        };
        const response = await fetch('https://localhost:8080/api/test', {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error("Error clocking in:", error);
    }
}


const clockOut = async (employeeId, location, currentTime) => {
    try {
        const payload = {
            employeeId,
            location,
            currentTime
        };
        const response = await fetch('https://localhost:8080/api/work_entries/clock_out', {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)       
        });
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error("Error clocking out:", error);
    }
}

export const Dashboard = () => {
    const { user, isLoading } = useUser();  // Moved inside the component

    const [date, setDate] = useState(new Date());
    const employeeId = "EMP1234"; // Mocked, this should come from user's session or state.

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

    useEffect(() => {
        const timer = setInterval(() => setDate(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleClockIn = async () => {
        const location = await getLocation();
        clockIn(employeeId, location, date);
    }

    const handleClockOut = async () => {
        const location = await getLocation();
        clockOut(employeeId, location, date);
    }

    // Add a loading state if user data is still being fetched
    if (isLoading) {
        return <p>Loading...</p>;
    }

    return (
        <div className='dashboard'>
            <Header />
            <div className="dashboardContainer">
                <h1>{user.first_name} {user.last_name}</h1>
                <p>{user.email}</p>     
                <div className='timeDisplayContainer'>
                    <p className="timeDisplay">Local Time : {date.toLocaleTimeString()}</p>
                    <p className="timeDisplay">Local Date : {date.toLocaleDateString()}</p>
                </div>
                <div className="buttonGroup">
                    <button className="button" onClick={handleClockIn}>Clock In</button>
                    <button className="button" onClick={handleClockOut}>Clock Out</button>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;