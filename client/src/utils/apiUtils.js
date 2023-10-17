let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

async function fetchWithTokenRefresh(input, init) {
    try {
        let response = await fetch(input, init);

        if (response.status !== 401) {
            return response;
        }

        // If a token refresh is already in progress, wait for it
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then(() => {
                return fetch(input, init);
            });
        }

        isRefreshing = true;
        const refreshResponse = await fetch("/api/refresh_tokens/refresh", {
            method: 'POST',
            credentials: 'include',
        });

        if (!refreshResponse.ok) {
            throw new Error('Token refresh failed');
        }

        isRefreshing = false;
        processQueue(null, null);
        response = await fetch(input, init);
        return response;

    } catch (error) {
        if (isRefreshing) {
            processQueue(error, null);
            isRefreshing = false;
        }
        throw error;
    }
}

export { fetchWithTokenRefresh };
