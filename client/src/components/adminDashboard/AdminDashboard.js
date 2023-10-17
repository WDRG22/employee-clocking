import React, { useState } from 'react';
import { TailSpin } from 'react-loading-icons';

export const AdminDashboard = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    return (
        <div className="adminDashboard">
            <h1>Admin Dashboard</h1>
            {isLoading && <TailSpin />}
            {error && <p className="error-message">{error}</p>}
        </div>
    );
};

export default AdminDashboard;
