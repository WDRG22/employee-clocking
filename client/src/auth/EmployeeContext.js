import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchWithTokenRefresh } from '../utils/apiUtils';
import { TailSpin } from 'react-loading-icons';
import './LoadingSpinner.css'

const EmployeeContext = createContext();

export const useEmployee = () => {
    return useContext(EmployeeContext);
}

export const EmployeeProvider = ({ children }) => {
    const [employee, setEmployee] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch employeeData when component mounts
    useEffect(() => {
        const fetchEmployeeData = async () => {
            setIsLoading(true);
            try {
                const response = await fetchWithTokenRefresh("/api/employees/employee", {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();  
                    console.log("employeeData", data);            
                    setEmployee(data.employee);
                } else {
                    setEmployee(null);
                }

            } catch (error) {
                console.log("Error fetching employee data: ", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEmployeeData();
    }, []);

    return (
        <EmployeeContext.Provider value={{ employee, setEmployee, isLoading }}>
            {isLoading ? <TailSpin className='loadingSpinner'/> : children}
        </EmployeeContext.Provider>
    );
}