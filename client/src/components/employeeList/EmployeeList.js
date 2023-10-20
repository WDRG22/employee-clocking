import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TailSpin } from 'react-loading-icons';
import "./EmployeeList.css";
import { fetchWithTokenRefresh } from '../../utils/apiUtils';

const EmployeeList = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [filteredData, setFilteredData] = useState([]);

  const handleRowClick = (employeeId) => {
    navigate(`/attendance/${employeeId}`);
  };  

  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoading(true);
      try {
        const response = await fetchWithTokenRefresh('/api/employees');
        const data = await response.json();
        setEmployees(data);
      } catch (error) {
        setError('Error fetching employees:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    setFilteredData(employees);
  }, [employees]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredData]);

  const lastRowIndex = currentPage * rowsPerPage;
  const firstRowIndex = lastRowIndex - rowsPerPage;
  const currentData = filteredData.slice(firstRowIndex, lastRowIndex);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const numPagesToShow = 1;
  const startPage = Math.max(1, currentPage - numPagesToShow);
  const endPage = Math.min(totalPages, currentPage + numPagesToShow);

  return (
    <div className='employeeListContainer'>
      <h1>Employee List</h1>

      {isLoading && <TailSpin className='loadingSpinner'/>}

      <div className='tableControls'>
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
            <th>ID</th>
            <th>Full Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((employee) => (
            <tr key={employee.employee_id} onClick={() => handleRowClick(employee.employee_id)}>
              <td>{employee.employee_id}</td>
              <td>{employee.first_name} {employee.last_name}</td>
              <td>{employee.email}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
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
};

export default EmployeeList;
