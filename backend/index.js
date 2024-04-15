import express from 'express';
import { crearUsuario, obtenerUsuarios, actualizarUsuario, eliminarUsuario } from './users/usuarios.js';

const app = express();
const port = 3000;

app.use(express.json());

app.post('/users/', async (req, res) => {
  try {
    const usuario = await crearUsuario(req.body);
    res.status(201).send(usuario);
  } catch (error) {
    res.status(500).send(error);
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

app.patch('/users/:carnet', async (req, res) => {
  try {
    const usuarioActualizado = await actualizarUsuario(req.params.carnet, req.body);
    if (usuarioActualizado) {
      res.send(usuarioActualizado);
    } else {
      res.status(404).send({ error: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

app.delete('/users/:carnet', async (req, res) => {
  try {
    const result = await eliminarUsuario(req.params.carnet);
    if (result) {
      res.status(204).send();
    } else {
      res.status(404).send({ error: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
