import React from 'react';
import './WorkEntry.css';

const WorkEntry = ({ entry }) => {
    return (
        <div className="work-entry">
            <h3>{new Date(entry.clock_in_time).toLocaleDateString()}</h3>
            <p><strong>User ID:</strong> {entry.user_id}</p>
            <p><strong>Tasks:</strong> {entry.tasks || 'N/A'}</p>
            <p><strong>Hours Worked:</strong> {entry.hours_worked}</p>
            
            <p><strong>Clock In Time:</strong> {new Date(entry.clock_in_time).toLocaleString()}</p>
            <p><strong>Clock In Location:</strong> {entry.clock_in_location}</p>
            
            <p><strong>Clock Out Time:</strong> {entry.clock_out_time ? new Date(entry.clock_out_time).toLocaleString() : 'N/A'}</p>
            <p><strong>Clock Out Location:</strong> {entry.clock_out_location || 'N/A'}</p>
        </div>
    );
}

export default WorkEntry;
