import { readFile, writeFile } from 'fs/promises';

const archivoComentarios = 'data/comentarios.json';

export async function cargarComentarios() {
    try {
        const data = await readFile(archivoComentarios, 'utf8');
        return JSON.parse(data).comments;
    } catch (error) {
        console.error('Error al cargar comentarios:', error);
        return [];
    }
}

export async function guardarComentarios(comments) {
    try {
        const data = JSON.stringify({ comments }, null, 2);
        await writeFile(archivoComentarios, data, 'utf8');
        console.log('Comentarios guardados exitosamente');
    } catch (error) {
        console.error('Error al guardar comentarios:', error);
        throw error;
    }
}

export async function crearComentario(comentarioData) {
    const comments = await cargarComentarios();
    const newId = `c${comments.length + 1}`; 
    comentarioData.id = newId;
    comments.push(comentarioData);
    await guardarComentarios(comments);
    return comentarioData;
}

export async function obtenerComentariosPorPost(postId) {
    const comments = await cargarComentarios();
    return comments.filter(comment => comment.postId === postId);
}
