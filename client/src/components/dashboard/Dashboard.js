import React, { useState } from 'react';
import { useUser } from "../../auth/UserContext";
import { fetchWithTokenRefresh } from '../../utils/apiUtils';
import DateTime from '../dateTime/DateTime';
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

// Api to geocode coordinates to address
async function encodeLocation(coord) {
    const lat = coord.latitude;
    const lng = coord.longitude;
    const baseUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;

    try {
        const response = await fetch(baseUrl);
        if (!response.ok) {
            throw new Error("Error geocoding location with Nominatim.");
        }

        const data = await response.json();
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


const useClock = (user, setUser, setErrorMessage) => {
    const [clockEntry, setClockEntry] = useState(null);  
    const getLocation = useLocation();

    const clock = async (endpoint, user_id, currentTime, location, coordinates, tasks) => {
    const payload = endpoint === '/api/work_entries/clock_in' ? { user_id, currentTime, location, coordinates } : { user_id, currentTime, location, coordinates, tasks };

        try {
            const response = await fetchWithTokenRefresh(endpoint, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            setClockEntry(data.clockEntry)
            setUser(data.user);
        } catch (error) {
            console.log(error)
        }
    };

    const handleClockIn = async () => {
        const coordinates = await getLocation();
        const location = await encodeLocation(coordinates);
        clock('/api/work_entries/clock_in', user.user_id, new Date(), location, coordinates);
    };

    const handleClockOut = async (tasks) => {
        if (!tasks.trim()) {
            setErrorMessage("Please enter the tasks you've worked on before clocking out.");
            return;
        }
        setErrorMessage('');  // Clearing error message if the input is valid
        const coordinates = await getLocation();
        const location = await encodeLocation(coordinates);
        clock('/api/work_entries/clock_out', user.user_id, new Date(), location, coordinates, tasks);
    };    

    return {
        handleClockIn,
        handleClockOut, 
        clockEntry
    };
};

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
    const { user, setUser } = useUser();

    // Local state for Dashboard component
    const [tasks, setTasks] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Utility functions for clocking in and out
    const { handleClockIn, handleClockOut, clockEntry }  = useClock(user, setUser, setErrorMessage);

    return (
        <div className='dashboard'>
            <div className="dashboardContainer">
                <h1 className='userName'>{user.first_name} {user.last_name}</h1>
                <DateTime />
                <ClockStatus isClockedIn={user.is_clocked_in} handleClockIn={handleClockIn} handleClockOut={handleClockOut} tasks={tasks} />
                {clockEntry && <ClockEntry clockEntry={clockEntry} />}                
                {user.is_clocked_in && <TaskEntry tasks={tasks} setTasks={setTasks} />}
                {errorMessage && <div className="errorMessage">{errorMessage}</div>}
            </div>
        </div>
    );
};

export default Dashboard;
