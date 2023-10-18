import React, { useState } from "react";
import useClock from '../hooks/useClock';
import { useUser } from "../../../auth/UserContext";
import { TailSpin } from 'react-loading-icons';

const Clocking = () => {
    const {user, setUser} = useUser();
    const [tasks, setTasks] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const { handleClockIn, handleClockOut, clockOutInfo }  = useClock(user, setUser, setErrorMessage, isLoading, setIsLoading);

    return (
        <div>
            {/* ClockStatus Section */}
            <div className={`clockStatus ${user.is_clocked_in ? 'ClockedIn' : 'ClockedOut'}`}>
                {`${user.is_clocked_in? "Clocked In" : "Clocked Out" }`}
                <div className="buttonGroup">
                    <button className="button" onClick={handleClockIn} disabled={user.is_clocked_in || isLoading}>
                        {isLoading && !user.is_clocked_in ? <TailSpin/> : 'Clock In'}
                    </button> 
                    <button className="button" onClick={() => handleClockOut(tasks)} disabled={!user.is_clocked_in || isLoading}>
                        {isLoading && user.is_clocked_in ? <TailSpin/> : 'Clock Out'}
                    </button>
                </div>
            </div>

            {/* Clock out Info */}
            {clockOutInfo &&
                <div className="resultEntry">
                    {clockOutInfo.clock_in_time && <p className='resultEntryLine'>{`Clocked in at: ${new Date(clockOutInfo.clock_in_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}`}</p>}
                    {clockOutInfo.clock_out_time && <p className='resultEntryLine'>{`Clocked out at: ${new Date(clockOutInfo.clock_out_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}`}</p>}
                    {clockOutInfo.clock_out_time && <p className='resultEntryLine'>{`Hours Worked: ${clockOutInfo.hours_worked}`}</p>}
                </div>
            }

            {/* Clock out task entry */}
            {user.is_clocked_in &&
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
            }
            {errorMessage && <div className="errorMessage">{errorMessage}</div>}
        </div>  
    );
};

export default Clocking;
