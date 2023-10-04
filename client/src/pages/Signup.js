import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import logo from "../assets/cyntra_logo_white.png";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: start;
    align-items: center;
    height: 100vh; 
    background-color: #333;
`;

const Logo = styled.img`
    display: block;
    margin: 0;
    max-width: 100%;  // This ensures the logo won't overflow the container
    height: auto;  // Keep aspect ratio
    width: 300px;
`;

const SignupForm = styled.form`
    text-align: left;
    background: #444;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.5);
    width: 300px;
`;

const Header = styled.h2`
    color: white;
    text-align: center;
`;

const Input = styled.input`
    width: 95%;
    padding: 10px;
    margin: 10px 0;
    border: 1px solid #555;
    border-radius: 5px;
    background-color: #555;
    color: white;
    ::placeholder {
        color: #aaa;
    }
`;

const Button = styled.button`
    width: 100%;
    padding: 10px;
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

const SignInLink = styled(Link)`
    display: block;
    margin-top: 10px;
    text-align: center;
    text-decoration: none;
    color: #007BFF;
    &:hover {
        text-decoration: underline;
    }
`;

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
        <Container>
                <Logo src={logo} alt="Cyntra Logo" />
                <SignupForm onSubmit={submitHandler}>
                <Header>Sign Up</Header>
                <Input type="text" name="firstName" value={firstName} onChange={changeHandler} placeholder="First Name" />
                <Input type="text" name="lastName" value={lastName} onChange={changeHandler} placeholder="Last Name" />
                <Input 
                    type="email" 
                    name="email" 
                    value={email} 
                    onChange={changeHandler} 
                    placeholder="Email" 
                    style={emailError ? { borderColor: 'red'} : {}}
                />
                <Input type="password" name="password" value={password} onChange={changeHandler} placeholder="Password" />
                <Input type="password" name="passwordVerify" value={passwordVerify} onChange={changeHandler} placeholder="Verify Password" />
                {emailError && <p style={{ color: 'red', fontWeight: 'bold' }}>{emailError}</p>}
                <Button type="submit">Signup</Button>
                <SignInLink to="/login">Already have an account? Sign In</SignInLink>
            </SignupForm>
        </Container>
    );
}

export default Signup;