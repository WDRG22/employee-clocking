import { Link, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { useUser } from "../auth/UserContext";
import styled from 'styled-components';
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

const LoginForm = styled.form`
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

const CreateAccountLink = styled(Link)`
    display: block;
    margin-top: 10px;
    text-align: center;
    text-decoration: none;
    color: #007BFF;
    &:hover {
        text-decoration: underline;
    }
`;

const CheckboxContainer = styled.div`
    display: flex;
    align-items: center;
    color: white;
    margin: 10px 0;
`;

const LOGIN_ENDPOINT = "https://localhost:8080/api/employees/login";

export const Login = () => {
    const [data, setData] = useState({
        email: "",
        password: "",
        showPassword: false,
    });

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

          const data = await response.json();
          
          // Successful login
          if (response.ok) {
              console.log("Login successful:", data);
              // Do other tasks after successful login: set token, redirect, etc.
              setUser(data.user);
              navigate('/');
          } else {
              console.error("Login error:", data.message);  // Assumes your server responds with an error message in case of unsuccessful login
              alert(data.message);  // Notify user of error
          }

      } catch (err) {
          console.error("An error occurred:", err);
          alert("Failed to connect to the server. Please try again.");  // Notify user of error
      }
  }


    return (
        <Container>
          <Logo src={logo} alt="Cyntra Logo" />
            <LoginForm onSubmit={submitHandler}>
                <Header>Sign In</Header>
                <Input type="email" name="email" value={email} onChange={changeHandler} placeholder="Email" />
                <Input type={showPassword ? "text" : "password"} name="password" value={password} onChange={changeHandler} placeholder="Password" />
                <CheckboxContainer>
                  <label>
                    <input type="checkbox" name="showPassword" checked={showPassword} onChange={changeHandler} />
                    <span>Show password</span>
                  </label>
                </CheckboxContainer>
                <Button type="submit">Login</Button>
                <CreateAccountLink to="/signup">Create an account</CreateAccountLink>
            </LoginForm>
        </Container>
    );
}

export default Login;
