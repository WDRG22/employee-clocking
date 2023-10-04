import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    background-color: #333;
`;

const Logo = styled.div`
    font-size: 24px;
    color: white;
    cursor: pointer;
`;

const NavigationButtons = styled.div`
    display: flex;
    gap: 10px;
`;

const NavButton = styled.button`
    padding: 8px 15px;
    background-color: #007BFF;
    border: none;
    border-radius: 5px;
    color: white;
    font-weight: bold;
    cursor: pointer;
    &:hover {
        background-color: #0056b3;
    }
`;

const LogoutButton = styled.button`
    padding: 8px 15px;
    background-color: #FF5733;
    border: none;
    border-radius: 5px;
    color: white;
    font-weight: bold;
    cursor: pointer;
    &:hover {
        background-color: #C43F00;
    }
`;

const Header = () => {

    const logout = () => {
        document.cookie = 'token=; Max-Age=0'; // Clear the 'token' cookie
        window.location.href = '/login';  // Redirect to login
    }

    return (
        <HeaderContainer>
            <Logo>MyAppLogo</Logo>
            <NavigationButtons>
                <NavButton onClick={() => window.location.href = '/'}>Homepage</NavButton>
                <NavButton onClick={() => window.location.href = '/account'}>Account</NavButton>
            </NavigationButtons>
            <LogoutButton onClick={logout}>Logout</LogoutButton>
        </HeaderContainer>
    );
}

export default Header;
