import React, { useEffect, useState } from 'react';

const UserMetaList = () => {
  const [userMeta, setUserMeta] = useState([]);

  useEffect(() => {
    fetch('/catalogue/api/user-meta/')
      .then((response) => response.json())
      .then((data) => setUserMeta(data))
      .catch((error) => console.error('Error fetching user meta:', error));
  }, []);

  return (
    <div>
      <h1>User Meta List</h1>
      <ul>
        {userMeta.map((meta) => (
          <li key={meta.id}>
            {meta.user__username} - {meta.langue}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserMetaList;