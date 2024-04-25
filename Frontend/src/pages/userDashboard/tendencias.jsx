// Trending.jsx
import React, { useEffect, useState } from 'react';
import UserNavbar from '../../components/NavBar'; 
import './tendencias.css'; // Asegúrate de que el path del CSS es correcto

function Trending() {
    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState({});

    useEffect(() => {
        const fetchUsersAndPosts = async () => {
            try {
                const usersResponse = await fetch('http://localhost:3000/users');
                const postsResponse = await fetch('http://localhost:3000/posts');
                if (!usersResponse.ok || !postsResponse.ok) {
                    throw new Error('Error fetching data');
                }
                const usersData = await usersResponse.json();
                const postsData = await postsResponse.json();

                const usersObj = usersData.reduce((acc, user) => {
                    acc[user.username] = user;
                    return acc;
                }, {});

                setUsers(usersObj);
                // Ordenar los posts por likes de mayor a menor antes de actualizar el estado
                setPosts(postsData.sort((a, b) => b.likes - a.likes));
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };
        fetchUsersAndPosts();
    }, []);

    const getUserName = (userId) => {
        return users[userId]?.nombres || 'Anónimo';
    };

    return (
        <div>
            <UserNavbar />
            <div className="posts-container">
                {posts.map(post => (
                    <div key={post.id} className="post">
                        <div className="post-header">
                            <h5 className="user-name">{getUserName(post.códigousuario)}</h5>
                            <span className="post-category">{post.categoría}</span>
                        </div>
                        <p className="post-description">{post.descripción}</p>
                        <div className="post-actions">
                            <button className="like-button">{post.likes} Me gusta</button>
                            <button className="comment-button">Comentar</button>
                        </div>
                    </div>
                ))}
            </div>
            
        </div>
    );
}

export default Trending;
