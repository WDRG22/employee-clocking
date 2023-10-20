import React, { useState } from 'react';
import { TailSpin } from 'react-loading-icons';
import EmployeeList from '../employeeList/EmployeeList';

export const AdminDashboard = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    return (
        <div className="adminDashboard">
            <h1>Admin Dashboard</h1>
            {isLoading && <TailSpin />}
            <EmployeeList />
        </div>
    );
};

export default AdminDashboard;
