import { readFile, writeFile } from 'fs/promises';

const archivoUsuarios = '/users.json'; 

async function cargarUsuarios() {
  try {
    const data = await readFile(archivoUsuarios, 'utf8');
    return JSON.parse(data).users;
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
    return [];
  }
}

async function guardarUsuarios(usuarios) {
  try {
    const data = JSON.stringify({ users: usuarios }, null, 2);
    await writeFile(archivoUsuarios, data, 'utf8');
    console.log('Usuarios guardados exitosamente:', data);  // Ver los datos guardados
  } catch (error) {
    console.error('Error al guardar usuarios:', error);
    throw error;  // Volver a lanzar el error para que el controlador de Express pueda capturarlo.
  }
}



export async function crearUsuario(usuario) {
  const usuarios = await cargarUsuarios();
  usuarios.push(usuario);
  await guardarUsuarios(usuarios);
  return usuario;
}

export async function obtenerUsuarios() {
  return cargarUsuarios();
}

export async function actualizarUsuario(carnet, datosUsuario) {
  let usuarios = await cargarUsuarios();
  const index = usuarios.findIndex(u => u.carnet === carnet);
  if (index !== -1) {
    usuarios[index] = {...usuarios[index], ...datosUsuario};
    await guardarUsuarios(usuarios);
    return usuarios[index];
  }
  return null;
}

export async function eliminarUsuario(carnet) {
  let usuarios = await cargarUsuarios();
  const index = usuarios.findIndex(u => u.carnet === carnet);
  if (index !== -1) {
    usuarios = usuarios.filter(u => u.carnet !== carnet);
    await guardarUsuarios(usuarios);
    return true;
  }
  return false;
}
