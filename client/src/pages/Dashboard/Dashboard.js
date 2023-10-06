import React, { useState, useEffect } from 'react';
import Header from '../../components/header/Header';
import './Dashboard.css';

const clockIn = async () => {
    try {
        const response = await fetch('http://localhost:8080/api/attendance/clockin', {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error("Error clocking in:", error);
    }
}

const clockOut = async () => {
    try {
        const response = await fetch('http://localhost:8080/api/attendance/clockout', {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }        
        });
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error("Error clocking out:", error);
    }
}

export const Dashboard = () => {
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setDate(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className='dashboard'>
            <Header />
            <div className="dashboardContainer">                
                <div className='timeDisplayContainer'>
                    <p className="timeDisplay">Local Time : {date.toLocaleTimeString()}</p>
                    <p className="timeDisplay">Local Date : {date.toLocaleDateString()}</p>
                </div>
                <div className="buttonGroup">
                    <button className="button" onClick={clockIn}>Clock In</button>
                    <button className="button" onClick={clockOut}>Clock Out</button>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
