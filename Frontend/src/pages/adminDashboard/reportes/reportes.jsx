import React, { useEffect, useState } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import HeaderAdmin from '../../../components/HeaderAdmin'; // Asegúrate que la ruta de importación sea correcta
import 'chart.js/auto';
import './reportes.css'

function Reportes() {
  const [topPosts, setTopPosts] = useState([]);
  const [postsByCategory, setPostsByCategory] = useState([]);
  const [topUsers, setTopUsers] = useState([]);

  useEffect(() => {
    fetchTopPosts();
    fetchPostsByCategory();
    fetchTopUsers();
  }, []);

  const fetchTopPosts = async () => {
    const response = await fetch('http://localhost:3000/posts');
    const posts = await response.json();
    // Asegúrate de que el array 'posts' incluya los IDs y los likes de los posts
    const sortedPosts = posts.sort((a, b) => b.likes - a.likes).slice(0, 5);
    setTopPosts(sortedPosts);
  };

  const fetchPostsByCategory = async () => {
    const response = await fetch('http://localhost:3000/posts');
    const posts = await response.json();
    const categoryCounts = posts.reduce((acc, post) => {
      acc[post.categoría] = (acc[post.categoría] || 0) + 1;
      return acc;
    }, {});
    setPostsByCategory(Object.entries(categoryCounts).map(([key, value]) => ({ category: key, count: value })));
  };

  const fetchTopUsers = async () => {
    const response = await fetch('http://localhost:3000/users');
    const users = await response.json();
    const userCounts = users.reduce((acc, user) => {
      acc[user.username] = (acc[user.username] || 0) + user.posts.length;
      return acc;
    }, {});
    const sortedUsers = Object.entries(userCounts).map(([key, value]) => ({ username: key, posts: value }))
      .sort((a, b) => b.posts - a.posts).slice(0, 10);
    setTopUsers(sortedUsers);
  };

  const pieOptions = {
    responsive: false,
    maintainAspectRatio: false, // Añade esto para mantener la relación de aspecto
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  const topPostsData = {
    labels: topPosts.map(post => `ID ${post.id}`), // Usando el ID y el título del post
    datasets: [{
      data: topPosts.map(post => post.likes),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#E7E9ED', '#4BC0C0'],
    }]
  };

  const postsByCategoryData = {
    labels: postsByCategory.map(post => post.category),
    datasets: [{
      data: postsByCategory.map(post => post.count),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#E7E9ED'],
    }]
  };

  const topUsersData = {
    labels: topUsers.map(user => user.username),
    datasets: [{
      data: topUsers.map(user => user.posts),
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1
    }]
  };

  return (
    <div className="report-container">
  <HeaderAdmin />
  <h1>Reportes de USocial</h1>
  <div className="charts-container">
    <div className="chart-box">
      <div className="chart-title">Top 5 Posts con más Likes</div>
      <Pie data={topPostsData} options={pieOptions} />
    </div>
    <div className="chart-box">
      <div className="chart-title">Posts por Categoría</div>
      <Pie data={postsByCategoryData} options={pieOptions} />
    </div>
    <div className="chart-box">
      <div className="chart-title">Top 10 Usuarios con más Publicaciones</div>
      <Bar data={topUsersData} options={pieOptions} />
    </div>
  </div>
</div>
  );
}

export default Reportes;
