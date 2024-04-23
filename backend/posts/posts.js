// posts.js
let posts = [];
let postIdCounter = 1;

// Función para crear un nuevo post
const crearPost = async (postData) => {
  const newPost = {
    id: postIdCounter,
    descripcion: postData.descripcion,
    codigoUsuario: postData.codigoUsuario,
    categoria: postData.categoria,
    fechaHora: postData.fechaHora,
    anonimo: postData.anonimo,
    imagen: postData.imagen || null,  // Agrega una imagen si está disponible
  };
  posts.push(newPost);
  postIdCounter++;  // Incrementa el contador de ID para el próximo post
  return newPost;
};

// Función para obtener todos los posts
const obtenerPosts = async () => {
  return posts;
};

// Función para actualizar un post existente
const actualizarPost = async (id, updateData) => {
  const postIndex = posts.findIndex(post => post.id === id);
  if (postIndex === -1) {
    throw new Error('Post no encontrado');
  }
  const existingPost = posts[postIndex];
  const updatedPost = { ...existingPost, ...updateData };
  posts[postIndex] = updatedPost;
  return updatedPost;
};

// Función para eliminar un post
const eliminarPost = async (id) => {
  const postIndex = posts.findIndex(post => post.id === id);
  if (postIndex === -1) {
    throw new Error('Post no encontrado');
  }
  posts.splice(postIndex, 1);
};

export { crearPost, obtenerPosts, actualizarPost, eliminarPost };
