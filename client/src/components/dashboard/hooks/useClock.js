import { useState } from 'react';
import { useLocation, encodeLocation } from './useLocation';
import { fetchWithTokenRefresh } from '../../../utils/apiUtils';

const useClock = (employee, setEmployee, setErrorMessage, isLoading, setIsLoading) => {
    const [clockEntry, setClockEntry] = useState(null);  
    const getLocation = useLocation();

    const clock = async (endpoint, employee_id, currentTime, location, coordinates, tasks) => {
        const payload = endpoint === '/api/work_entries/clock_in' ? { employee_id, currentTime, location, coordinates } : { employee_id, currentTime, location, coordinates, tasks };
        try {
            const response = await fetchWithTokenRefresh(endpoint, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            setClockEntry(data.clockEntry)
            setEmployee(data.employee);
        } catch (error) {
            console.error(error)
        }
        setIsLoading(false);
    };

    const handleClockIn = async () => {
        setIsLoading(true);
        const coordinates = await getLocation();
        const location = await encodeLocation(coordinates);
        clock('/api/work_entries/clock_in', employee.employee_id, new Date(), location, coordinates);
    };

    const handleClockOut = async (tasks) => {
        setIsLoading(true);
        if (!tasks.trim()) {
            setErrorMessage("Please enter the tasks you've worked on before clocking out.");
            return;
        }        
        setErrorMessage('');  // Clearing error message if the input is valid
        const coordinates = await getLocation();
        const location = await encodeLocation(coordinates);
        clock('/api/work_entries/clock_out', employee.employee_id, new Date(), location, coordinates, tasks);
    };    

    return {
        handleClockIn,
        handleClockOut, 
        clockEntry
    };
};

export default useClock;
