import { createGlobalStyle } from 'styled-components';
import { UserProvider } from "./auth/UserContext";
import RoutesComponent from './components/RoutesComponent';

const GlobalStyle = createGlobalStyle`
  html, body, #root {
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;  // This will remove the scroll bars
  }

  body {
    font-family: 'Arial', sans-serif;
  }
`;

function App() {
    return (
        <>
        <UserProvider>
            <GlobalStyle/>
            <RoutesComponent/>            
        </UserProvider>
        </>      
    );
  }

  export default App;