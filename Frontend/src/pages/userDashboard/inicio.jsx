import React, { useEffect, useState } from 'react';
import UserNavbar from '../../components/NavBar'; 
import './inicio.css';

function UserHome() {
    const [posts, setPosts] = useState([]);
    const [likedPosts, setLikedPosts] = useState({});
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
            let postsData = await postsResponse.json();
      
            // Sort posts by date from most recent to oldest
            postsData = postsData.sort((a, b) => new Date(b.fechahora) - new Date(a.fechahora));
      
            const usersObj = usersData.reduce((acc, user) => {
              acc[user.username] = user;
              return acc;
            }, {});
      
            setUsers(usersObj);
            setPosts(postsData);
          } catch (error) {
            console.error('Failed to fetch data:', error);
          }
        };
      
        fetchUsersAndPosts();
      }, []);

    const handleLike = async (postId) => {
        if (likedPosts[postId]) {
            console.log('Ya diste like a este post');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/posts/like/${postId}`, {
                method: 'PATCH',
            });
            if (response.ok) {
                const updatedPost = await response.json();
                setPosts(posts.map(p => p.id === postId ? updatedPost : p));
                setLikedPosts({...likedPosts, [postId]: true});
            } else {
                console.error('No se pudo dar like al post');
            }
        } catch (error) {
            console.error('Error al dar like:', error);
        }
    };

    const getUserName = (userId, anonimo) => {
        if (anonimo) {
            return 'Anónimo';
        }
        return users[userId]?.nombres || 'Usuario Desconocido';
    };

    return (
        <div>
            <UserNavbar />
            <h1 className='titulo-tendencias'>Inicio</h1>
            <div className="posts-container">
                {posts.map(post => (
                    <div key={post.id} className="post">
                        <div className="post-header">
                            <h5 className="user-name">{getUserName(post.códigousuario, post.anónimo)}</h5>
                            <div className="post-metadata">
                                <span className="post-fechaHora">{post.fechahora}</span>
                                <span className="post-category">{post.categoría}</span>
                            </div>
                        </div>
                        <p className="post-description">{post.descripción}</p>
                        <div className="post-actions">
                            <button
                                className="like-button"
                                onClick={() => handleLike(post.id)}
                                disabled={likedPosts[post.id]} // botón deshabilitado si el post ya fue 'likeado'
                            >
                                {post.likes} Me gusta
                            </button>
                            <button className="comment-button">Comentar</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default UserHome;
