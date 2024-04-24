// PostsView.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderAdmin from '../../../components/HeaderAdmin';
import './postview.css'; // Asegúrate que el path del CSS es correcto

function PostsView() {
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch('http://localhost:3000/posts');
                const data = await response.json();
                setPosts(data);
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };

        fetchPosts();
    }, []);

    const handleDeletePost = async (id) => {
        try {
            await fetch(`http://localhost:3000/posts/${id}`, { method: 'DELETE' });
            setPosts(posts.filter(post => post.id !== id)); // Actualizar el estado para reflejar el post eliminado
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const handleViewPost = (id) => {
        navigate(`/admin/posts/post/${id}`); 
    };

    return (
        <div>
            <HeaderAdmin />
            <h1>Lista de Posts</h1>
            <table className="posts-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Descripción</th>
                        <th>Usuario</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {posts.map(post => (
                        <tr key={post.id}>
                            <td>{post.id}</td>
                            <td>{post.descripción}</td>
                            <td>{post.códigousuario}</td>
                            <td>
                                <button onClick={() => handleViewPost(post.id)}>Ver</button>
                                <button onClick={() => handleDeletePost(post.id)}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default PostsView;
