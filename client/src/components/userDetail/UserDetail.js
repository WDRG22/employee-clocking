import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const UserDetail = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [workEntries, setWorkEntries] = useState([]);

  useEffect(() => {
    // Fetch user details and work_entries data for the specified 'userId' from your backend API
    // Update the 'user' and 'workEntries' state with the fetched data
  }, [userId]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{user.first_name} {user.last_name}'s Work Entries</h1>
      <ul>
        {workEntries.map((entry) => (
          <li key={entry.entry_id}>
            {/* Display work_entries details here */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserDetail;
