import React from 'react';
import './Header.css';
import logo from '../../assets/cyntra_logo_white.png'

const Header = () => {
    const logout = () => {
        document.cookie = 'token=; Max-Age=0'; // Clear the 'token' cookie
        window.location.href = '/login';  // Redirect to login
    }

    return (
        <div className='header'>
            <div className="headerContainer">
                <div className='headerLeft'>
                    <button className="logoButton">
                        <img className='logoImage' src={logo} alt="Cyntra"/>
                    </button>
                    <div className="navigationButtons">
                        <button className="navButton" onClick={() => window.location.href = '/'}>Homepage</button>
                        <button className="navButton" onClick={() => window.location.href = '/account'}>Account</button>
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
