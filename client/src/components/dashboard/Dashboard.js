import React, { useState, useEffect } from 'react';
import Header from '../header/Header';
import { useUser } from "../../auth/UserContext";
import { fetchWithTokenRefresh } from '../../utils/apiUtils';
import './Dashboard.css';

// Hook for getting user location
const useLocation = () => {
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
    return getLocation;
};

const useClock = (userId, setIsClockedIn, setErrorMessage) => {
    const [clockEntry, setClockEntry] = useState(null);  
    const getLocation = useLocation();

    const clock = async (endpoint, userId, currentTime, location, tasks) => {
        const payload = endpoint === '/api/work_entries/clock_in' ? { userId, currentTime, location } : { userId, currentTime, location, tasks };
        console.log("clock() payload: ", payload)

        try {
            const response = await fetchWithTokenRefresh(endpoint, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            console.log("clock() data: ", data)
            setClockEntry(data.clockEntry)
            setIsClockedIn(data.isClockedIn)
        } catch (error) {
            console.log(error)
        }
    };

    const handleClockIn = async () => {
        const location = await getLocation();
        clock('/api/work_entries/clock_in', userId, new Date(), location);
    };

    const handleClockOut = async (tasks) => {
        if (!tasks.trim()) {
            setErrorMessage("Please enter the tasks you've worked on before clocking out.");
            return;
        }
        setErrorMessage('');  // Clearing error message if the input is valid
        const location = await getLocation();
        clock('/api/work_entries/clock_out', userId, new Date(), location, tasks);
    };    

    return {
        handleClockIn,
        handleClockOut, 
        clockEntry
    };
};

// Time Display component
const TimeDisplay = ({ date }) => (
    <div className='timeDisplayContainer'>
        <p className="timeDisplay">Local Date : {date.toLocaleDateString()}</p>
        <p className="timeDisplay">Local Time : {date.toLocaleTimeString()}</p>                                        
    </div>
);

// Clock Status component
const ClockStatus = ({ isClockedIn, handleClockIn, handleClockOut, tasks }) => (
    <div className={`clockStatus ${isClockedIn ? 'ClockedIn' : 'ClockedOut'}`}>
        {`${isClockedIn? "Clocked In" : "Clocked Out" }`}
        <div className="buttonGroup">
            <button className="button" onClick={handleClockIn} disabled={isClockedIn}>Clock In</button>
            <button className="button" onClick={() => handleClockOut(tasks)} disabled={!isClockedIn}>Clock Out</button>
        </div>
    </div>
);

// Clock Entry component
const ClockEntry = ({ clockEntry }) => (
    <div className="resultEntry">
        {clockEntry.clock_in_time && <p className='resultEntryLine'>{`Clocked in at: ${new Date(clockEntry.clock_in_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}`}</p>}
        {clockEntry.clock_out_time && <p className='resultEntryLine'>{`Clocked out at: ${new Date(clockEntry.clock_out_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}`}</p>}
        {clockEntry.clock_out_time && <p className='resultEntryLine'>{`Hours Worked: ${clockEntry.hours_worked}`}</p>}
    </div>
);

// Task Entry component
const TaskEntry = ({ tasks, setTasks }) => (
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
);

export const Dashboard = () => {
    const { user, setIsClockedIn } = useUser();

    // Local state for Dashboard component
    const [date, setDate] = useState(new Date());
    const [tasks, setTasks] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Utility functions for clocking in and out
    const { handleClockIn, handleClockOut, clockEntry }  = useClock(user.user_id, setIsClockedIn, setErrorMessage);

    // Update time and date each second
    useEffect(() => {
        console.log("user.isClockedIn: ", user.isClockedIn)
        const timer = setInterval(() => setDate(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className='dashboard'>
            <Header />
            <div className="dashboardContainer">
                <h1 className='userName'>{user.first_name} {user.last_name}</h1>
                <TimeDisplay date={date} />
                <ClockStatus isClockedIn={user.isClockedIn} handleClockIn={handleClockIn} handleClockOut={handleClockOut} tasks={tasks} />
                {clockEntry && <ClockEntry clockEntry={clockEntry} />}                
                {user.isClockedIn && <TaskEntry tasks={tasks} setTasks={setTasks} />}
                {errorMessage && <div className="errorMessage">{errorMessage}</div>}
            </div>
        </div>
    );
};

export default Dashboard;
