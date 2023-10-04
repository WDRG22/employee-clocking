const SignoutButton = styled.button`
    position: absolute;
    top: 10px;
    right: 10px;
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

export const LogoutButton = () => {
    const logout = () => {
        // If you're using a library like js-cookie
        // cookies.remove('token');
        document.cookie = 'token=; Max-Age=0'; // This will clear the 'token' cookie

        // Now redirect the user to login (or wherever you'd like them to go post-logout)
        window.location.href = '/login';
    }

    return (
        <Container>
            <SignoutButton onClick={logout}>Logout</SignoutButton>
            <TimeDisplay>Local Time : {date.toLocaleTimeString()}</TimeDisplay>
            <TimeDisplay>Local Date : {date.toLocaleDateString()}</TimeDisplay>
            <ButtonGroup>
                <Button onClick={clockIn}>Clock In</Button>
                <Button onClick={clockOut}>Clock Out</Button>
            </ButtonGroup>
        </Container>
    );
};

export default LogoutButton;
