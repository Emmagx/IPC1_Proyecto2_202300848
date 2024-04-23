import React, { useState, useEffect } from 'react';
import './adminDashboard.css';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loadData, setLoadData] = useState({ users: [], posts: [] });

  useEffect(() => {
    // Carga inicial de usuarios
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3000/users/');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert('No file selected!');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
      setLoadData(result);
      // Clear the selected file
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await fetch(`http://localhost:3000/users/${userId}`, {
        method: 'DELETE'
      });
      // Re-fetch users after deletion
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>Administrador USocial</h1>
      
      <div className="users-list">
        <h2>Usuarios de USocial</h2>
        <button onClick={() => fetchUsers()}>Actualizar Lista</button>
        <table>
          <thead>
            <tr>
              <th>Código/Carnet</th>
              <th>Nombres</th>
              {/* Add more headers if needed */}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.username}>
                <td>{user.username}</td>
                <td>{user.nombres}</td>
                {/* Add more data cells if needed */}
                <td>
                  <button onClick={() => handleDeleteUser(user.username)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mass-upload">
        <h2>Carga Masiva</h2>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleFileUpload}>Cargar Archivo</button>
        {/* Display the loaded data in a table or another format */}
      </div>
    </div>
  );
}

export default AdminDashboard;
