import React, { useState, useEffect } from 'react';

const DateTime = () => {
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setDate(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className='timeDisplayContainer'>
            <p className="timeDisplay">Local Date: {date.toLocaleDateString()}</p>
            <p className="timeDisplay">Local Time: {date.toLocaleTimeString()}</p>                                        
        </div>
    );
};

export default DateTime;
