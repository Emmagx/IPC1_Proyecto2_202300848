import { readFile, writeFile } from 'fs/promises';
//para eliminar usuarios usamos http://localhost:3000/users/202112345
//Para agregar usuarios es subir todo el body
const archivoUsuarios = 'users/users.json'; 

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
  // Verifica si ya existe un usuario con el mismo 'carnet'
  if (usuarios.some(u => u.carnet === usuario.carnet)) {
    throw new Error(`El usuario con carnet ${usuario.carnet} ya existe.`);
  }

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
    // Crea un objeto con los datos a actualizar, excluyendo campos vacíos
    const datosParaActualizar = Object.entries(datosUsuario).reduce((acc, [key, value]) => {
      if (value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});

    // Si no hay datos válidos para actualizar, lanza un error
    if (Object.keys(datosParaActualizar).length === 0) {
      throw new Error('No hay datos válidos para actualizar.');
    }

    // Actualiza solo los campos que no están vacíos
    usuarios[index] = { ...usuarios[index], ...datosParaActualizar };
    await guardarUsuarios(usuarios);
    return usuarios[index];
  }
  throw new Error(`El usuario con carnet ${carnet} no existe.`);
}

export async function eliminarUsuario(carnet) {
  let usuarios = await cargarUsuarios();
  const usuarioExiste = usuarios.some(u => u.carnet === carnet);
  if (!usuarioExiste) {
    throw new Error(`El usuario con carnet ${carnet} no existe.`);
  }
  usuarios = usuarios.filter(u => u.carnet !== carnet);
  await guardarUsuarios(usuarios);
  return true; // Indicar éxito
}
