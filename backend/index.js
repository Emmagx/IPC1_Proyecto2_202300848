import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import { cargarUsuarios, crearUsuario, obtenerUsuarios, actualizarUsuario, eliminarUsuario } from './users/usuarios.js';
import { crearPost, obtenerPosts, actualizarPost, eliminarPost } from './posts/posts.js';

const upload = multer({ dest: 'uploads/' });
const app = express();
const port = 3000;

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true
}));

app.use(express.json());

app.post('/users/', async (req, res) => {
  const { username, nombres, apellidos, genero, facultad, carrera, mail, contraseña, isAdmin } = req.body;

  if (!username || !nombres || !apellidos || !genero || !facultad || !carrera || !mail || !contraseña) {
    return res.status(400).send({ error: 'Todos los campos son requeridos y deben ser válidos.' });
  }
  try {
    const usuario = await crearUsuario(req.body);
    res.status(201).send(usuario);
  } catch (error) {
    res.status(500).send({ error: 'Error al procesar la solicitud' });
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

app.patch('/users/:username', async (req, res) => {
  try {
    const usuarioActualizado = await actualizarUsuario(req.params.username, req.body);
    res.send(usuarioActualizado);
  } catch (error) {
    res.status(500).send({ error: 'Error al procesar la solicitud' });
  }
});

app.delete('/users/:username', async (req, res) => {
  try {
    await eliminarUsuario(req.params.username);
    res.status(204).send();
  } catch (error) {
    res.status(500).send({ error: 'Error al procesar la solicitud' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const usuarios = await cargarUsuarios();
  const user = usuarios.find(u => u.username === username && u.contraseña === password);
  
  if (user) {
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
    const updatedPost = await actualizarPost(parseInt(req.params.id), req.body);
    res.send(updatedPost);
  } catch (error) {
    res.status(404).send({ error: 'Post no encontrado' });
  }
});

app.delete('/posts/:id', async (req, res) => {
  try {
    await eliminarPost(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(404).send({ error: 'Post no encontrado' });
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

app.post('/posts/mass_upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const filePath = req.file.path;

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);

    if (!data.posts || !Array.isArray(data.posts)) {
      return res.status(400).json({ error: 'Formato de archivo incorrecto.' });
    }

    // Filtrar posts válidos
    const validPosts = data.posts.filter(post => post.descripción && post.códigousuario && post.categoría && post.fechahora);
    const results = [];

    for (const post of validPosts) {
      try {
        const createdPost = await crearPost(post);
        results.push(createdPost);
      } catch (error) {
        results.push({ error: error.message, id: post.id });
      }
    }

    res.status(200).json({ message: 'Carga de posts exitosa.', results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al procesar el archivo.' });
  } finally {
    fs.unlinkSync(filePath); // Asegurarse de eliminar el archivo después del proceso
  }
});

app.post('/users/mass_upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'sin archivo.' });
  }

  const filePath = req.file.path;

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);

    if (!data.users || !Array.isArray(data.users)) {
      return res.status(400).json({ error: 'Formato de archivo incorrecto.' });
    }

    const results = [];
    for (const user of data.users) {
      try {
        const createdUser = await crearUsuario(user);
        results.push(createdUser);
      } catch (error) {
        // Aquí se maneja el error de usuario existente, continuando con los siguientes
        if (error.message.startsWith("El usuario con username")) {
          console.error(`Error: ${error.message}`); // Logear el error para auditoría interna pero continuar con el proceso
          results.push({ error: error.message, username: user.username });
        } else {
          throw error; // Lanzar cualquier otro error desconocido para ser manejado más abajo
        }
      }
    }

    res.status(200).json({ message: 'Proceso de carga completado, con algunos errores.', results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process the file.' });
  } finally {
    fs.unlinkSync(filePath); // Eliminar el archivo después de procesarlo o en caso de error
  }
});
