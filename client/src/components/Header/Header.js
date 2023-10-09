import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../auth/UserContext';
import './Header.css';
import logo from '../../assets/cyntra_logo_white.png'

const Header = () => {
    const navigate = useNavigate();
    const { setUser } = useUser();

    const logout = async () => {
        try {
            const response = await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
    
            if (response.status === 200) {
                console.log('Logged out successfully');
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
                    <button className="logoButton">
                        <img className='logoImage' src={logo} alt="Cyntra"/>
                    </button>
                    <div className="navigationButtons">
                        <button className="navButton" onClick={() => navigate('/')}>Homepage</button>
                        <button className="navButton" onClick={() => navigate('/account')}>Account</button>
                    </div>
                </div>
                <div className='headerRight'>
                    <button className="logoutButton" onClick={logout}>Logout</button>
                </div>
            </div>
        </div>
    );
}

export default Header;
