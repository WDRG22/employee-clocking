import React, { useState, useEffect } from 'react';
import { useUser } from '../../auth/UserContext';
import DatePicker from 'react-datepicker';
import { fetchWithTokenRefresh } from '../../utils/apiUtils';
import {TailSpin} from 'react-loading-icons';
import './Attendance.css'
import 'react-datepicker/dist/react-datepicker.css';

const filterByDateRange = (data, startDate, endDate) => {
    if (!data) return [];
    if (!startDate && !endDate) return data; // No filters applied

    return data.filter(entry => {
        const entryDate = new Date(entry.clock_in_time);
        if (startDate && entryDate < startDate) return false;
        if (endDate && entryDate > endDate) return false;
        return true;
    });
};

const Attendance = () => {
    const { user } = useUser();
    const [ isLoading, setIsLoading ] = useState(false);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [attendanceData, setAttendanceData] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const [filteredData, setFilteredData] = useState(null);

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
                    setAttendanceData(data);
                    console.log("Attendance data: ", data)
                } else {
                    setAttendanceData([]);
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

    useEffect(() => {
        setFilteredData(filterByDateRange(attendanceData, startDate, endDate));
    }, [attendanceData, startDate, endDate]);    

    useEffect(() => {
        setCurrentPage(1);
    }, [filteredData]);

    const lastRowIndex = currentPage * rowsPerPage;
    const firstRowIndex = lastRowIndex - rowsPerPage;
    const currentData = filteredData?.slice(firstRowIndex, lastRowIndex);        
    const totalPages = filteredData ? Math.ceil(filteredData.length / rowsPerPage) : 0;
    const numPagesToShow = 2;
    const startPage = Math.max(1, currentPage - numPagesToShow);
    const endPage = Math.min(totalPages, currentPage + numPagesToShow);

    return (
        <div className='attendanceContainer'>
            <h2>Recent Attendance</h2>
            {isLoading && <TailSpin className='loadingSpinner'/>}
    
            <div className='tableControls'>
                <div className="dateRange">
                    From: 
                    <DatePicker selected={startDate} onChange={date => setStartDate(date)} placeholderText="Select Date" />
                    To: 
                    <DatePicker selected={endDate} onChange={date => setEndDate(date)} placeholderText="Select Date" />
                </div>
                
                {/* Previous and Next page buttons */}
                <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>
                    Previous
                </button>
                <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>
                    Next
                </button>
            </div>
    
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Clock In</th>
                        <th>Clock Out</th>
                        <th>Hours Worked</th>
                        <th>Tasks</th>
                    </tr>
                </thead>
                <tbody>
                    {currentData && currentData.map((entry, index) => (
                        <tr key={index}>
                            <td>{new Date(entry.clock_in_time).toLocaleDateString()}</td>
                            <td>{new Date(entry.clock_in_time).toLocaleTimeString()}</td>
                            <td>{new Date(entry.clock_out_time).toLocaleTimeString()}</td>
                            <td>{entry.hours_worked}</td>
                            <td>{entry.tasks}</td>
                        </tr>
                    ))}
                </tbody>
            </table> 
    
            <div className="pagination">
                {/* Pagination controls */}
                {startPage > 1 && (
                    <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                        1
                    </button>
                )}
                {startPage > 2 && <span>...</span>}
                {Array.from({ length: endPage - startPage + 1 }, (_, index) => {
                    const pageNum = startPage + index;
                    return (
                        <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={currentPage === pageNum ? 'active' : ''}
                        >
                            {pageNum}
                        </button>
                    );
                })}
                {endPage < totalPages - 1 && <span>...</span>}
                {endPage < totalPages && (
                    <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
                        {totalPages}
                    </button>
                )}
            </div>
            {error && <p className="error-message">{error}</p>}
        </div>
    );   
}

export default Attendance;