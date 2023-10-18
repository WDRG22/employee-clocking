import React from 'react';
import { useUser } from '../../auth/UserContext';
import DateTime from './components/DateTime';
import Clocking from './components/Clocking';
import './Dashboard.css';

const Dashboard = () => {
    const { user, setUser } = useUser();

    return (
        <div className='dashboard'>
            <div className="dashboardContainer">
                <h1 className='userName'>{user.first_name} {user.last_name}</h1>
                <DateTime />
                <Clocking />
            </div>
        </div>
    );
};

export default Dashboard;
