import React, { useState } from 'react';
import { TailSpin } from 'react-loading-icons';
import EmployeeList from '../employeeList/EmployeeList';
import './AdminDashboard.css';

export const AdminDashboard = () => {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <div className="adminDashboard">
            <h1 className='adminDashHeader'>Admin Dashboard</h1>
            {isLoading && <TailSpin />}
            <EmployeeList />
        </div>
    );
};

export default AdminDashboard;
