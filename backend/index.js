import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import { cargarUsuarios, crearUsuario, obtenerUsuarios, actualizarUsuario, eliminarUsuario } from './users/usuarios.js';
import { cargarPosts, crearPost, obtenerPosts, actualizarPost, eliminarPost } from './posts/posts.js';

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

const fetchUserDetails = async () => {
  try {
    const response = await fetch(`http://localhost:3000/users/${username}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    setUserDetails(data);
  } catch (error) {
    console.error('Error fetching user details:', error);
  }
};  
app.get('/users/', async (req, res) => {
  try {
    const usuarios = await obtenerUsuarios();
    res.send(usuarios);
  } catch (error) {
    res.status(500).send(error);
  }
});
app.get('/users/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const usuarios = await cargarUsuarios(); // Suponiendo que esta función devuelve todos los usuarios
    const usuario = usuarios.find(u => u.username === username);
    if (usuario) {
      res.json(usuario);
    } else {
      res.status(404).json({ error: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error al buscar el usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
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
app.get('/posts/:id', async (req, res) => {
  const { id } = req.params;
  try {
      const posts = await cargarPosts(); // Asume que esta función devuelve todos los posts
      const post = posts.find(p => p.id == id); // Asegúrate de comparar correctamente según sea necesario (== o === dependiendo de si necesitas coerción de tipo)
      if (post) {
          res.json(post);
      } else {
          res.status(404).send({ error: 'Post no encontrado' });
      }
  } catch (error) {
      console.error('Error interno del servidor:', error);
      res.status(500).send({ error: 'Error interno del servidor' });
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
  console.log("Request received for posts/mass_upload");
  if (!req.file) {
    console.log("No file uploaded");
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  console.log("File uploaded:", req.file.path);

  const filePath = req.file.path;

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    console.log("File content read:", fileContent.substring(0, 100)); // muestra solo los primeros 100 caracteres para evitar desbordamiento

    const data = JSON.parse(fileContent);
    console.log("Parsed data:", data);

    if (!data.posts || !Array.isArray(data.posts)) {
      console.log("Invalid format: posts array not found");
      return res.status(400).json({ error: 'Formato de archivo incorrecto.' });
    }

    const validPosts = data.posts.filter(post => post.descripción && post.códigousuario && post.categoría && post.fechahora);
    console.log("Valid posts:", validPosts);
    const results = [];

    for (const post of validPosts) {
      try {
        const createdPost = await crearPost(post);
        console.log("Post created successfully:", createdPost);
        results.push(createdPost);
      } catch (error) {
        console.log("Error creating post:", error.message);
        results.push({ error: error.message, id: post.id });
      }
    }

    console.log("All posts processed, sending response");
    res.status(200).json({ message: 'Carga de posts exitosa.', results });
  } catch (error) {
    console.error("Error processing the file:", error);
    res.status(500).json({ error: 'Error al procesar el archivo.' });
  } finally {
    fs.unlinkSync(filePath);
    
    console.log("Temporary file deleted");
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
