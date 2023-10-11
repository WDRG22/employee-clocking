import React, { useState, useEffect } from 'react';
import Header from '../header/Header';
import { useUser } from "../../auth/UserContext";
import { fetchWithTokenRefresh } from '../../utils/apiUtils';
import './Dashboard.css';

const useClock = (userId, setIsClockedIn, setErrorMessage) => {
    const [clockEntry, setClockEntry] = useState(null);  

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

    const clock = async (endpoint, userId, currentTime, location, tasks) => {
        const payload = endpoint === '/api/clock_in' ? { userId, currentTime, location } : { userId, currentTime, location, tasks };
        console.log("payload: ", payload)
        try {
            const response = await fetchWithTokenRefresh(endpoint, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            setClockEntry(data.clockEntry)
            setIsClockedIn(data.isClockedIn)
        } catch (error) {
            console.log(error)
        }
    };

    const handleClockIn = async () => {
        const location = await getLocation();
        clock('/api/clock_in', userId, new Date(), location);
    };

    const handleClockOut = async (tasks) => {
        if (!tasks.trim()) {
            setErrorMessage("Please enter the tasks you've worked on before clocking out.");
            return;
        }
        setErrorMessage('');  // Clearing error message if the input is valid
        const location = await getLocation();
        clock('/api/clock_out', userId, new Date(), location, tasks);
    };    

    return [handleClockIn, handleClockOut, clockEntry];
};

export const Dashboard = () => {
    const { user, isClockedIn, setIsClockedIn } = useUser();
    const [date, setDate] = useState(new Date());
    const [tasks, setTasks] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [handleClockIn, handleClockOut, clockEntry, ] = useClock(user.user_id, setIsClockedIn, setErrorMessage);


    useEffect(() => {
        const timer = setInterval(() => setDate(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className='dashboard'>
            <Header />
            <div className="dashboardContainer">
                <h1 className='userName'>{user.first_name} {user.last_name}</h1>
                <div className='timeDisplayContainer'>
                    <p className="timeDisplay">Local Date : {date.toLocaleDateString()}</p>
                    <p className="timeDisplay">Local Time : {date.toLocaleTimeString()}</p>                                        
                </div>
                <div className={`clockStatus ${isClockedIn ? 'ClockedIn' : 'ClockedOut'}`}>
                    {`${isClockedIn? "Clocked In" : "Clocked Out" }`}
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
                            onClick={() => handleClockOut(tasks)}
                            disabled={!isClockedIn ? true : null}
                        >
                            Clock Out
                        </button>
                    </div>
                </div>
                {
                    clockEntry && (
                        <div className="resultEntry">
                            {clockEntry.clock_in_time && <p className='resultEntryLine'>{`Clocked in at : ${new Date(clockEntry.clock_in_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}`}</p>}
                            {clockEntry.clock_out_time && <p className='resultEntryLine'>{`Clocked out at : ${new Date(clockEntry.clock_out_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}`}</p>}
                            {clockEntry.clock_out_time && <p className='resultEntryLine'>{`Hours Worked : ${clockEntry.hours_worked}`}</p>}
                        </div>
                    )
                }                
                {isClockedIn && (
                    <div className="taskEntry">
                        <textarea
                            id="tasks"
                            value={tasks}
                            onChange={e => setTasks(e.target.value)}
                            rows="4"
                            cols="50"
                            placeholder="Describe the tasks you've worked on today before clocking out..."
                        />
                    </div>
                )}
                {errorMessage && <div className="error-message">{errorMessage}</div>}
            </div>
        </div>
    );
};

export default Dashboard;
