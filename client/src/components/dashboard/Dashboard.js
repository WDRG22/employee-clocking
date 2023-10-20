import React from 'react';
import { useEmployee } from '../../auth/EmployeeContext';
import DateTime from './components/dateTime/DateTime';
import Clocking from './components/clocking/Clocking';
import './Dashboard.css';

const Dashboard = () => {
    const { employee, setEmployee } = useEmployee();

    return (
        <div className='dashboard'>
            <div className="dashboardContainer">
                <h1 className='employeeName'>{employee.first_name} {employee.last_name}</h1>
                <DateTime />
                <Clocking />
            </div>
        </div>
    );
};

export default Dashboard;
