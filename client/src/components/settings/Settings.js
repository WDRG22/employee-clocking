import React, { useState } from 'react';
import { useEmployee } from '../../auth/EmployeeContext';
import { fetchWithTokenRefresh } from '../../utils/apiUtils';
import './Settings.css';

function Settings() {
    const { employee } = useEmployee();
    const [currentPassword, setCurrentPassword] = useState('');  // New state for current password
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleChangePassword = async () => {
        setSuccess(null); // Reset success message
        setError(null);   // Reset error message
    
        if (newPassword !== confirmPassword) {
            setError('Confirm password does not match');
            return;
        }
    
        try {
            const response = await fetchWithTokenRefresh('/api/employees/employee/change_password', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    oldPassword: currentPassword,
                    newPassword: newPassword,
                }),
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                throw new Error(data.message || 'Unexpected server response');
            }
    
            if (data.message === 'Password changed successfully') {
                setSuccess(data.message);
                setCurrentPassword('');  // Clear current password input
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setError('Error changing password: ' + data.message);
            }
        } catch (error) {
            console.log('error', error);
            setError(error.message);
        }
    };

    return (
        <div className='settings'>
            <h1>Settings</h1>
            <div className='accountCard'>
                <div className='accountInfo'>
                    <h2>Account Information</h2>
                    <p>{employee.first_name} {employee.last_name}</p>
                    <p>Employee ID: {employee.employee_id}</p>
                    <p>Email: {employee.email}</p>
                    <p className={employee.is_clocked_in ? 'isClockedIn' : 'isNotClockedIn'}>
                        {`Clocked In: ${employee.is_clocked_in ? 'Yes' : 'No'}`}
                    </p>
                    <p>
                    {`Admin: ${employee.is_admin ? 'Yes' : 'No'}`}
                    </p>
                </div>
                <div className='passwordChange'>
                    <h2>Change Password</h2>
                    <div className='passwordChangeInputs'>
                        <input
                            type="password"
                            placeholder="Current Password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    {error && <p className='errorMessage'>{error}</p>}
                    {success && <p className='successMessage'>{success}</p>}
                    <button onClick={handleChangePassword}>Change Password</button>
                </div>
            </div>
        </div>
    );
}

export default Settings;
