import express from 'express';
import cors from 'cors';

import {cargarUsuarios, crearUsuario, obtenerUsuarios, actualizarUsuario, eliminarUsuario } from './users/usuarios.js';
import { crearPost, obtenerPosts, actualizarPost, eliminarPost } from './posts/posts.js';
const app = express();
app.use(cors());
const port = 3000;
app.use(cors({
  origin: 'http://localhost:5173', // Asegúrate de que este sea el puerto correcto para tu aplicación React
  methods: ['GET', 'POST', 'PATCH', 'DELETE'], // Métodos permitidos
  credentials: true // Permite cookies de sesión
}));

app.use(express.json());

app.post('/users/', async (req, res) => {
  const { username, nombres, apellidos, genero, facultad, carrera, mail, contraseña, isAdmin } = req.body;

  // Comprobar que todos los campos requeridos estén presentes y no sean vacíos
  if (!username || !nombres || !apellidos || !genero || !facultad || !carrera || !mail || !contraseña) {
    return res.status(400).send({ error: 'Todos los campos son requeridos y deben ser válidos.' });
  }
  try {
    const usuario = await crearUsuario(req.body);
    res.status(201).send(usuario);
  } catch (error) {
    if (error.message.startsWith("El usuario con carnet")) {
      res.status(400).send({ error: error.message });
    } else {
      res.status(500).send({ error: 'Error al procesar la solicitud' });
    }
  }
});


app.get('/users/', async (req, res) => {
  try {
    const usuarios = await obtenerUsuarios();
    res.send(usuarios);
  } catch (error) {
    res.status(500).send(error);
  }
});
//Usar username en la solicitud que vamos a realizar
app.patch('/users/:username', async (req, res) => {
  try {
    const usuarioActualizado = await actualizarUsuario(req.params.username, req.body);
    res.send(usuarioActualizado);
  } catch (error) {
    if (error.message === 'No hay datos válidos para actualizar.') {
      res.status(400).send({ error: error.message });
    } else if (error.message.startsWith("El usuario con username")) {
      res.status(404).send({ error: error.message }); // Usuario no encontrado
    } else {
      res.status(500).send({ error: 'Error al procesar la solicitud' });
    }
  }
});



app.delete('/users/:username', async (req, res) => {
  try {
    const result = await eliminarUsuario(req.params.username);
    res.status(204).send(); // No content
  } catch (error) {
    if (error.message.startsWith("El usuario con username")) {
      res.status(404).send({ error: error.message }); // Not Found
    } else {
      res.status(500).send({ error: 'Error al procesar la solicitud' });
    }
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const usuarios = await cargarUsuarios();

  const user = usuarios.find(u => u.username === username);
  if (user && user.contraseña === password) {
    // Asegúrate de devolver también el estado isAdmin
    res.status(200).json({ message: 'Inicio de sesión exitoso', isAdmin: user.isAdmin });
  } else {
    res.status(401).json({ error: 'Inicio de sesión fallido. Usuario o contraseña incorrectos.' });
  }
});


app.post('/posts/', async (req, res) => {
  try {
    const post = await crearPost(req.body);
    res.status(201).send(post);
  } catch (error) {
    res.status(500).send({ error: 'Error al crear el post' });
  }
});

app.get('/posts/', async (req, res) => {
  try {
    const posts = await obtenerPosts();
    res.send(posts);
  } catch (error) {
    res.status(500).send({ error: 'Error al obtener los posts' });
  }
});

app.patch('/posts/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updatedPost = await actualizarPost(id, req.body);
    res.send(updatedPost);
  } catch (error) {
    res.status(404).send({ error: 'Post no encontrado' });
  }
});

app.delete('/posts/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await eliminarPost(id);
    res.status(204).send();
  } catch (error) {
    res.status(404).send({ error: 'Post no encontrado' });
  }
});