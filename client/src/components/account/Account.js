import React, { useState, useEffect } from 'react';
import Header from '../header/Header';
import './Account.css';
import { fetchWithTokenRefresh } from '../../utils/apiUtils';



export const Account = () => {
    const [workEntries, setWorkEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
