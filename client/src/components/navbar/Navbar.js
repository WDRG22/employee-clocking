import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployee } from '../../auth/EmployeeContext';
import { fetchWithTokenRefresh } from '../../utils/apiUtils';
import logo from '../../assets/cyntra_logo_white.png'
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const { employee, setEmployee } = useEmployee();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const logout = async () => {
        try {
            const response = await fetchWithTokenRefresh('/api/employees/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
    
            if (response.status === 200) {
                setEmployee(null);
                navigate('/login');
            } else {
                const data = await response.json();
                console.error('Logout failed:', data.message);
            }
        } catch (error) {
            console.error('An error occurred during logout:', error);
        }
    }

    return (
        <div className='navbar'>
            <div className="navbarContainer">
                <div className='navbarLeft'>
                    <div className="navigationButtons">
                        <button className="navButton" onClick={() => navigate('/')}>Dashboard</button>
                        {!employee.is_admin && 
                            <button className="navButton" onClick={() => navigate(`/attendance/${employee.employee_id}`)}>Attendance</button>
                        }
                    </div>
                </div>    
                    <img className='logoImage' src={logo} alt="Cyntra"/>
                <div className='navbarRight'>
                    <div className='navigationButtons'>
                        <button className="navButton" onClick={() => navigate('/settings')}>Settings</button>
                        <button className="logoutButton" onClick={logout}>Logout</button>
                    </div>
                </div>
            </div>
            <div className='mobileNavbarContainer'>
                <img className='logoImage' src={logo} alt="Cyntra"/>
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="menuToggle">☰</button>
                {isDropdownOpen && 
                <div className="mobileDropdown">
                    <button className="mobileNavButton" onClick={() => navigate('/')}>Dashboard</button>
                    {!employee.is_admin && 
                        <button className="mobileNavButton" onClick={() => navigate('/attendance')}>Attendance</button>
                    }
                    <button className="mobileNavButton" onClick={() => navigate('/settings')}>Settings</button>
                    <button className="mobileLogoutButton" onClick={logout}>Logout</button>
                </div>}
            </div>
        </div>
    );
}

export default Navbar;
