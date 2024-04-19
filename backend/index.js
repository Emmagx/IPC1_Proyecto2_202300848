import express from 'express';
import { crearUsuario, obtenerUsuarios, actualizarUsuario, eliminarUsuario } from './users/usuarios.js';

const app = express();
const port = 3000;

app.use(express.json());

app.post('/users/', async (req, res) => {
  const { carnet, nombres, apellidos, genero, facultad, carrera, mail, contraseña, isAdmin } = req.body;

  // Comprobar que todos los campos requeridos estén presentes y no sean vacíos
  if (!carnet || !nombres || !apellidos || !genero || !facultad || !carrera || !mail || !contraseña) {
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
//Usar carnet en la solicitud que vamos a realizar
app.patch('/users/:carnet', async (req, res) => {
  try {
    const usuarioActualizado = await actualizarUsuario(req.params.carnet, req.body);
    res.send(usuarioActualizado);
  } catch (error) {
    if (error.message === 'No hay datos válidos para actualizar.') {
      res.status(400).send({ error: error.message });
    } else if (error.message.startsWith("El usuario con carnet")) {
      res.status(404).send({ error: error.message }); // Usuario no encontrado
    } else {
      res.status(500).send({ error: 'Error al procesar la solicitud' });
    }
  }
});



app.delete('/users/:carnet', async (req, res) => {
  try {
    const result = await eliminarUsuario(req.params.carnet);
    res.status(204).send(); // No content
  } catch (error) {
    if (error.message.startsWith("El usuario con carnet")) {
      res.status(404).send({ error: error.message }); // Not Found
    } else {
      res.status(500).send({ error: 'Error al procesar la solicitud' });
    }
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
