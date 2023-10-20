import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { useEmployee } from '../../auth/EmployeeContext';
import { fetchWithTokenRefresh } from '../../utils/apiUtils';
import {TailSpin} from 'react-loading-icons';
import './EmployeeAttendance.css';
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

const EmployeeAttendance = () => {
    const { employee_id: routeEmployeeId } = useParams();  // Extract employee_id from the route
    const { employee } = useEmployee();
    const [ isLoading, setIsLoading ] = useState(false);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [attendanceData, setAttendanceData] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const [filteredData, setFilteredData] = useState(null);

    useEffect(() => {
        const fetchEmployeeAccountData = async () => {
            setIsLoading(true);
            try {
                
                // If user is an admin and a valid employee_id is provided in the route, use that.
                // Otherwise, default to the logged-in user's employee_id.
                const empId = (employee.is_admin && routeEmployeeId) ? routeEmployeeId : employee.employee_id;

                const response = await fetchWithTokenRefresh(`/api/work_entries/${empId}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setAttendanceData(data);
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

        fetchEmployeeAccountData();
    }, [employee]);

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
    const numPagesToShow = 1;
    const startPage = Math.max(1, currentPage - numPagesToShow);
    const endPage = Math.min(totalPages, currentPage + numPagesToShow);

    return (
        <div className='attendance'>
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
                    
                    <div className='nextPrevButtons'>
                        <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>
                            Previous
                        </button>
                        <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>
                            Next
                        </button>
                    </div>
                </div>
        
                <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Clock In</th>
                        <th>Clock Out</th>
                        <th>Hours Worked</th>
                        <th>Location</th>
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
                            <td>{entry.clock_in_location}</td> {/* Added this line */}
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
        </div>
    );   
}

export default EmployeeAttendance;