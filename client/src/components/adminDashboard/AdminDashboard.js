import React, { useState, useEffect } from 'react';
import { fetchWithTokenRefresh } from '../../utils/apiUtils';
import { TailSpin } from 'react-loading-icons';

export const AdminDashboard = () => {
    const [workEntries, setWorkEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchWorkEntries = async () => {
            setIsLoading(true);
            try {
                const response = await fetchWithTokenRefresh('/api/admin/work_entries');

                if (response.ok) {
                    const data = await response.json();
                    console.log(data)
                    setWorkEntries(data);
                } else {
                    setError("Unable to fetch work entries.");
                }
            } catch (error) {
                setError("Error fetching work entries.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchWorkEntries();
    }, []);

    const deleteWorkEntry = async (entryId) => {
        try {
            const response = await fetchWithTokenRefresh(`/api/admin/work_entries/${entryId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Remove the entry from the state after successful deletion
                setWorkEntries(prev => prev.filter(entry => entry.entry_id !== entryId));
            } else {
                setError("Failed to delete work entry.");
            }
        } catch (error) {
            setError("Error deleting work entry.");
        }
    };

    return (
        <div className="adminDashboard">
            <h1>Admin Dashboard</h1>
            {isLoading && <TailSpin />}
            {error && <p className="error-message">{error}</p>}
            {/* {!isLoading && !error && (
                <div className="entries-list-wrapper">
                    <ul className="entries-list">
                        {workEntries.map(entry => (
                            <WorkEntry key={entry.entry_id} entry={entry} onDelete={() => deleteWorkEntry(entry.entry_id)} />
                        ))}
                    </ul>
                </div>
            )} */}
        </div>
    );
};

export default AdminDashboard;
