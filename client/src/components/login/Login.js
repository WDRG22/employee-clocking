import { Link, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { useEmployee } from "../../auth/EmployeeContext";
import { fetchWithTokenRefresh } from '../../utils/apiUtils';
import logo from "../../assets/cyntra_logo_white.png";
import './Login.css';

export const Login = () => {
    const [data, setData] = useState({
        email: "",
        password: "",
        showPassword: false,
    });
    const [incorrectDetailsError, setIncorrectDetailsError] = useState('')
    const { setEmployee } = useEmployee();
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
            const response = await fetchWithTokenRefresh("/api/employees/login", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            
            const data = await response.json();
            if (response.ok) {
                setEmployee(data.employee);
                navigate('/');
            } else {
                setIncorrectDetailsError(data.message);
            }
        } catch (err) {
            console.error("An error occurred:", err);
            setIncorrectDetailsError("Failed to connect to the server. Please try again.");
        }
    }

    return (
        <div className='login'>
            <img className="logo" src={logo} alt="Cyntra Logo" />
            <form className="loginForm" onSubmit={submitHandler}>
                <h2>Sign In</h2>
                <div className='inputFields'>
                    <input className="input" type="email" name="email" value={email} onChange={changeHandler} placeholder="Email" />
                    <input className="input" type={showPassword ? "text" : "password"} name="password" value={password} onChange={changeHandler} placeholder="Password" />
                </div>
                <div className="checkboxContainer">
                    <label>
                        <input type="checkbox" name="showPassword" checked={showPassword} onChange={changeHandler} />
                        <span>Show password</span>
                    </label>
                </div>
                {incorrectDetailsError && <p style={{ color: 'red' }}>{incorrectDetailsError}</p>}
                <button className="button" type="submit">Login</button>
                <Link className="createAccountLink" to="/signup">Create an account</Link>
            </form>
        </div>
    );
}

export default Login;
