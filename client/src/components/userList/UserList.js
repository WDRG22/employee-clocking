import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch the list of users from your backend API
    // Update the 'users' state with the fetched data
  }, []);

  return (
    <div>
      <h1>User List</h1>
      <ul>
        {users.map((user) => (
          <li key={user.user_id}>
            <Link to={`/user/${user.user_id}`}>{user.first_name} {user.last_name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
