import React, { useState, useEffect } from 'react';
import { useUser } from '../../auth/UserContext';
import { fetchWithTokenRefresh } from '../../utils/apiUtils';
import Header from '../header/Header';
import WorkEntry from '../workEntry/WorkEntry';
import { TailSpin } from 'react-loading-icons';
import './Account.css';
  
function Account() {
    const ENTRIES_PER_PAGE = 5;

    const [workEntries, setWorkEntries] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useUser();

    useEffect(() => {
        const fetchUserAccountData = async () => {
            setIsLoading(true);
            try {
                const response = await fetchWithTokenRefresh(`/api/work_entries/user`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setWorkEntries(data);
                } else {
                    setWorkEntries([]);
                    setError("Unable to fetch work entries.");
                }
            } catch (error) {
                setError("Error fetching account data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserAccountData();
    }, [user]);

    const getEntriesForCurrentPage = () => {
        const start = (currentPage - 1) * ENTRIES_PER_PAGE;
        const end = start + ENTRIES_PER_PAGE;
        return workEntries.slice(start, end);
    };

    return (
        <>
            <Header />
            <div className='account'>
                <div className='account-container'>
                    <h2 className="account-title">Your Work Entries</h2>
                    
                    {isLoading && <TailSpin />}
                    {error && <p className="error-message">Error fetching work entries. Please try again later.</p>}
                    {!isLoading && !error && workEntries.length === 0 && (
                        <p className="info-message">You have no work entries.</p>
                    )}
                    {!isLoading && !error && workEntries.length > 0 && (
                        <div className="entries-list-wrapper">
                            <div className="pagination-controls">
                                <button className="previous-button"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                                <span className="page-info">Page {currentPage} of {Math.ceil(workEntries.length / ENTRIES_PER_PAGE)}</span>
                                <button className="next-button"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(workEntries.length / ENTRIES_PER_PAGE)))} 
                                    disabled={currentPage === Math.ceil(workEntries.length / ENTRIES_PER_PAGE)}
                                >
                                    Next
                                </button>
                            </div>
                            <ul className="entries-list">
                                {getEntriesForCurrentPage().map(entry => (
                                    <WorkEntry key={entry.entry_id} entry={entry} />
                                ))}
                            </ul>
                            <div className="pagination-controls">
                                <button className="previous-button"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                                <span className="page-info">Page {currentPage} of {Math.ceil(workEntries.length / ENTRIES_PER_PAGE)}</span>
                                <button className="next-button"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(workEntries.length / ENTRIES_PER_PAGE)))} 
                                    disabled={currentPage === Math.ceil(workEntries.length / ENTRIES_PER_PAGE)}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default Account;
