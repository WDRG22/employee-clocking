import React, { useState, useEffect } from 'react';
import Header from '../header/Header';
import './Account.css';

export const Account = () => {
    const [workEntries, setWorkEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // For this example, I'm assuming you have an endpoint like /api/work_entries
        fetch('/api/work_entries/user')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                setWorkEntries(data);
                setLoading(false);
            })
            .catch((error) => {
                setError(error);
                setLoading(false);
            });
    }, []);

    return (
        <div className='account'>
            <Header />
            <h1>Account</h1>
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error.message}</p>}
            <ul>
                {workEntries.map((entry) => (
                    <li key={entry.id}>
                        {/* Replace the following with the structure of your work_entry */}
                        <p>{entry.workName}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Account;
