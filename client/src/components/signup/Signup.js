import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchWithTokenRefresh } from '../../utils/apiUtils';
import logo from "../../assets/cyntra_logo_white.png";
import './Signup.css';


export const Signup = () => {
    const [data, setData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        passwordVerify: ""
    });
    const [errorMessage, setErrorMessage] = useState('');
    const { firstName, lastName, email, password, passwordVerify } = data;
    const navigate = useNavigate();

    const clearErrorMessage = () => setErrorMessage('');

    const changeHandler = e => {
        setData({ ...data, [e.target.name]: e.target.value });
    }

    const isValidEmail = (email) => {
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return emailPattern.test(email);
    }

    const submitHandler = async e => {
        e.preventDefault();
        clearErrorMessage();

        if (!firstName || !lastName) {
            setErrorMessage("Please provide both first and last name.");
            return;
        }

        if (!isValidEmail(email)) {
            setErrorMessage("Please provide a valid email address.");
            return;
        }

        if (password !== passwordVerify) {
            setErrorMessage("Passwords do not match. Please try again.");
            return;
        }

        try {
            const response = await fetchWithTokenRefresh("/api/users/signup", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ firstName, lastName, email, password }),
            });

            const responseData = await response.json();

            if (response.ok) {
                navigate('/login');
            } else {
                setErrorMessage(responseData.message);
            }

        } catch (err) {
            console.error("An error occurred:", err);
            setErrorMessage("Failed to connect to the server. Please try again.");
        }
    }

    return (
        <div className='signup'>
            <img className="logo" src={logo} alt="Cyntra Logo" />
            <form className="signupForm" onSubmit={submitHandler}>
                <h2>Sign Up</h2>
                <div className='inputFields'>
                    <input className="input" type="text" name="firstName" value={firstName} onChange={changeHandler} placeholder="First Name" />
                    <input className="input" type="text" name="lastName" value={lastName} onChange={changeHandler} placeholder="Last Name" />
                    <input 
                        className={`input ${errorMessage ? 'error' : ''}`} 
                        type="email" 
                        name="email" 
                        value={email} 
                        onChange={changeHandler} 
                        placeholder="Email"
                    />
                    <input className="input" type="password" name="password" value={password} onChange={changeHandler} placeholder="Password" />
                    <input className="input" type="password" name="passwordVerify" value={passwordVerify} onChange={changeHandler} placeholder="Verify Password" />
                    {errorMessage && <p className="errorMessage">{errorMessage}</p>}
                </div>
                <button className="button" type="submit">Signup</button>
                <Link className="signInLink" to="/login">Already have an account? Sign In</Link>
            </form>
        </div>
    );
}

export default Signup;