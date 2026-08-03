import { dialog } from 'electron'
import fs from 'fs'

export async function exportDatabase(dbPath: string): Promise<string> {
  const result = await dialog.showSaveDialog({
    title: 'Exportar Base de Datos TEQUITL',
    defaultPath: 'tequitl_backup.db',
    filters: [{ name: 'SQLite Database', extensions: ['db'] }],
  })

  if (!result.canceled && result.filePath) {
    fs.copyFileSync(dbPath, result.filePath)
    return result.filePath
  }
  return ''
}

export async function importDatabase(dbPath: string): Promise<string> {
  const result = await dialog.showOpenDialog({
    title: 'Importar Base de Datos TEQUITL',
    filters: [{ name: 'SQLite Database', extensions: ['db'] }],
    properties: ['openFile'],
  })

  if (!result.canceled && result.filePaths.length > 0) {
    const sourcePath = result.filePaths[0]
    // Validate it's a valid SQLite file (starts with 'SQLite format 3\0')
    const buffer = Buffer.alloc(16)
    const fd = fs.openSync(sourcePath, 'r')
    fs.readSync(fd, buffer, 0, 16, 0)
    fs.closeSync(fd)
    if (buffer.toString('utf8', 0, 15) === 'SQLite format 3') {
      fs.copyFileSync(sourcePath, dbPath)
      return result.filePaths[0]
    }
    throw new Error('Archivo no válido: no es una base de datos SQLite')
  }
  return ''
}
