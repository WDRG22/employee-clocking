import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from "../../assets/cyntra_logo_white.png";
import './Signup.css';

const SIGNUP_ENDPOINT = "https://localhost:8080/api/employees/signup";

export const Signup = () => {
    const [data, setData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        passwordVerify: ""
    });
    const [emailError, setEmailError] = useState('');
    const { firstName, lastName, email, password, passwordVerify } = data;
    const navigate = useNavigate();

    const changeHandler = e => {
        setData({ ...data, [e.target.name]: e.target.value });
    }

    const isValidEmail = (email) => {
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return emailPattern.test(email);
    }

    const submitHandler = async e => {
        e.preventDefault();

        if (!firstName || !lastName) {
            alert("Please provide both first and last name.");
            return;
        }

        if (!isValidEmail(email)) {
            alert("Please provide a valid email address.");
            return;
        }

        if (password !== passwordVerify) {
            alert("Passwords do not match. Please try again.");
            return;
        }

        try {
            const response = await fetch(SIGNUP_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ firstName, lastName, email, password }),
            });

            const responseData = await response.json();

            if (response.ok) {
                console.log("Signup successful:", responseData);
                navigate('/login');
            } else {
                setEmailError(responseData.message);
            }

        } catch (err) {
            console.error("An error occurred:", err);
            alert("Failed to connect to the server. Please try again.");
        }
    }

    return (
        <div className='signup'>
            <img className="logo" src={logo} alt="Cyntra Logo" />
            <form className="signupForm" onSubmit={submitHandler}>
                <h2 className="header">Sign Up</h2>
                <input className="input" type="text" name="firstName" value={firstName} onChange={changeHandler} placeholder="First Name" />
                <input className="input" type="text" name="lastName" value={lastName} onChange={changeHandler} placeholder="Last Name" />
                <input 
                    className={`input ${emailError ? 'error' : ''}`} 
                    type="email" 
                    name="email" 
                    value={email} 
                    onChange={changeHandler} 
                    placeholder="Email"
                />
                <input className="input" type="password" name="password" value={password} onChange={changeHandler} placeholder="Password" />
                <input className="input" type="password" name="passwordVerify" value={passwordVerify} onChange={changeHandler} placeholder="Verify Password" />
                {emailError && <p style={{ color: 'red', fontWeight: 'bold' }}>{emailError}</p>}
                <button className="button" type="submit">Signup</button>
                <Link className="signInLink" to="/login">Already have an account? Sign In</Link>
            </form>
        </div>
    );
}

export default Signup;