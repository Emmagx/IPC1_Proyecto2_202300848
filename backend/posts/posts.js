// posts.js
let posts = [];
let postIdCounter = 1;

// Función para crear un nuevo post
const crearPost = async (postData) => {
  const newId = postData.id || postIdCounter;
  const newPost = {
    id: newId,
    descripción: postData.descripción,
    códigousuario: postData.códigousuario,
    categoría: postData.categoría,
    fechahora: postData.fechahora,
    anónimo: postData.anónimo,
    imagen: postData.imagen || null,
  };
  posts.push(newPost);
  // Asegurarse de que el contador siempre esté adelante de los IDs usados
  postIdCounter = Math.max(postIdCounter, newId + 1);
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
