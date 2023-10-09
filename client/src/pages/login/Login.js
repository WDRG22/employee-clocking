import { Link, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { useUser } from "../../auth/UserContext";
import logo from "../../assets/cyntra_logo_white.png";
import './Login.css';

const LOGIN_ENDPOINT = "/api/login";

export const Login = () => {
    const [data, setData] = useState({
        email: "test@test.com",
        password: "test123",
        showPassword: false,
    });
    const [incorrectDetailsError, setIncorrectDetailsError] = useState('')

    const { setUser } = useUser();
    const { email, password, showPassword } = data;
    const navigate = useNavigate();

    const changeHandler = e => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setData({ ...data, [e.target.name]: value });
    }

    // Submit login info to server
    const submitHandler = async e => {
        e.preventDefault();
    
        try {
            const response = await fetch(LOGIN_ENDPOINT, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log("User data after successful login:", data.user);
                setUser(data.user);
                navigate('/');
            } else {
                const data = await response.json();
                setIncorrectDetailsError(data.message);
            }
        } catch (err) {
            console.error("An error occurred:", err);
            alert("Failed to connect to the server. Please try again.");
        }
    }

    return (
        <div className='login'>
            <img className="logo" src={logo} alt="Cyntra Logo" />
            <form className="loginForm" onSubmit={submitHandler}>
                <h2 className="header">Sign In</h2>
                <input className="input" type="email" name="email" value={email} onChange={changeHandler} placeholder="Email" />
                <input className="input" type={showPassword ? "text" : "password"} name="password" value={password} onChange={changeHandler} placeholder="Password" />
                <div className="checkboxContainer">
                    <label>
                        <input type="checkbox" name="showPassword" checked={showPassword} onChange={changeHandler} />
                        <span>Show password</span>
                    </label>
                </div>
                {incorrectDetailsError && <p style={{ color: 'red', fontWeight: 'bold' }}>{incorrectDetailsError}</p>}
                <button className="button" type="submit">Login</button>
                <Link className="createAccountLink" to="/signup">Create an account</Link>
            </form>
        </div>
    );
}

export default Login;
