async function fetchWithTokenRefresh(input, init) {
    let response = await fetch(input, init);
    
    if (response.status === 401) {
        // Attempt to refresh token
        const refreshResponse = await fetch("/api/refresh_tokens/refresh", {
            method: 'POST',
            credentials: 'include', 
        });
        
        if (refreshResponse.ok) {
            // Retry the original request
            response = await fetch(input, init);
        }
    }
    
    return response;
}

export { fetchWithTokenRefresh };
