import React, { useEffect, useState } from 'react';
import HeaderAdmin from '../../../components/HeaderAdmin'; // Asegúrate de que la ruta sea correcta
import './viewuser.css'; // Asegúrate de que la ruta sea correcta
import { useNavigate } from 'react-router-dom'; // Importa useNavigate

function ViewUser() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:3000/users');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = async (username) => {
    try {
      await fetch(`http://localhost:3000/users/${username}`, { method: 'DELETE' });
      setUsers(users.filter(user => user.username !== username));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  // Función para el botón Ver, que todavía no está implementada.
  const handleViewUser = (username) => {
    navigate(`/admin/userview/user/${username}`); // Asegúrate de que la ruta coincida con tu configuración en AppRouter
  };

  return (
    <div>
      <HeaderAdmin />
      <div className="user-container">
        <h1>Usuarios de USocial</h1>
        <table className="user-table">
          <thead>
            <tr>
              <th>Código/Carnet</th>
              <th>Nombres</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.username}>
                <td>{user.username}</td>
                <td>{user.nombres}</td>
                <td>
                  <button onClick={() => handleViewUser(user.username)}>Ver</button>
                  <button onClick={() => handleDeleteUser(user.username)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ViewUser;
