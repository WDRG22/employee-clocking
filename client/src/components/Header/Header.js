import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../auth/UserContext';
import { fetchWithTokenRefresh } from '../../utils/apiUtils';
import logo from '../../assets/cyntra_logo_white.png'
import './Header.css';

const Header = () => {
    const navigate = useNavigate();
    const { setUser } = useUser();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const logout = async () => {
        try {
            const response = await fetchWithTokenRefresh('/api/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
    
            if (response.status === 200) {
                setUser(null);
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
        <div className='header'>
            <div className="headerContainer">
                <div className='headerLeft'>
                    <img className='logoImage' src={logo} alt="Cyntra"/>
                    <div className="navigationButtons">
                        <button className="navButton" onClick={() => navigate('/')}>Dashboard</button>
                        <button className="navButton" onClick={() => navigate('/account')}>Account</button>
                    </div>
                </div>    
                <div className='headerRight'>
                    <div className='navigationButtons'>
                        <button className="logoutButton" onClick={logout}>Logout</button>
                    </div>
                </div>
            </div>
            <div className='mobileHeaderContainer'>
                <img className='logoImage' src={logo} alt="Cyntra"/>
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="menuToggle">☰</button>
                {isDropdownOpen && 
                <div className="mobileDropdown">
                    <button className="mobileNavButton" onClick={() => navigate('/')}>Dashboard</button>
                    <button className="mobileNavButton" onClick={() => navigate('/account')}>Account</button>
                    <button className="mobileLogoutButton" onClick={logout}>Logout</button>
                </div>}
            </div>
        </div>
    );
}

export default Header;
