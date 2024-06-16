const fs = require('fs');
const readline = require('readline');
const path = require('path');

const directoryPath = __dirname; // Directorio actual

(async () => {
  try {
    const chalk = await import('chalk'); // Importación dinámica de chalk
    await menu(chalk.default); // Llamar al menú principal
  } catch (error) {
    console.error(error);
  }
})();

const menu = async (chalk) => {
  console.log('\n\x1b[1;32mMenu Principal\x1b[0;m'); // Verde para el título del menú
  console.log('1. ' + chalk.blue('Borrar el contenido del archivo')); // Azul para la opción 1
  console.log('2. ' + chalk.magenta('Renombrar el archivo')); // Magenta para la opción 2
  console.log('3. ' + chalk.red('Eliminar el archivo')); // Rojo para la opción 3
  console.log('4. ' + chalk.green('Mostrar los archivos de texto')); // Verde para la opción 4
  console.log('5. ' + chalk.white('Agregar nuevo archivo de texto')); // Blanco para la opción 5
  console.log('6. ' + chalk.gray('Salir')); // Gris para la opción de salir

  const choice = await readUserInput('Ingrese su elección (1-6): ');

  switch (choice) {
    case '1':
      await selectFileAction(clearFile, chalk, 'Borrar el contenido del archivo');
      break;
    case '2':
      await selectFileAction(renameFilePrompt, chalk, 'Renombrar el archivo');
      break;
    case '3':
      await selectFileAction(deleteFile, chalk, 'Eliminar el archivo');
      break;
    case '4':
      await listTextFiles(chalk);
      break;
    case '5':
      const newFile = await readUserInput('Ingrese el nombre del nuevo archivo (sin .txt): ');
      await createNewFile(newFile);
      break;
    case '6':
      console.log(chalk.magenta('Saliendo...')); // Magenta para el mensaje de salida
      return;
    default:
      console.log('\x1b[0;31mOpción inválida.\x1b[0;m'); // Rojo para el mensaje de error
  }

  await menu(chalk); // Llamar recursivamente al menú
};

const readFile = async (fileName) => {
  try {
    const data = await fs.promises.readFile(fileName, 'utf8');
    console.log('\n\x1b[0;34mContenido del archivo:\x1b[0;m');
    console.log(data);
  } catch (error) {
    console.error('\x1b[0;31mError: No se pudo leer el archivo.\x1b[0;m');
  }
};

const appendToFile = async (fileName, text) => {
  try {
    await fs.promises.appendFile(fileName, text + '\n', 'utf8');
    console.log('\x1b[0;32mTexto agregado al archivo con éxito.\x1b[0;m');
  } catch (error) {
    console.error('\x1b[0;31mError: No se pudo agregar el texto al archivo.\x1b[0;m');
  }
};

const clearFile = async (fileName) => {
  try {
    await fs.promises.writeFile(fileName, '', 'utf8');
    console.log('\x1b[0;32mContenido del archivo borrado con éxito.\x1b[0;m');
  } catch (error) {
    console.error('\x1b[0;31mError: No se pudo borrar el contenido del archivo.\x1b[0;m');
  }
};

const renameFile = async (oldFileName, newFileName) => {
  try {
    await fs.promises.rename(oldFileName, newFileName);
    console.log('\x1b[0;32mArchivo renombrado con éxito.\x1b[0;m');
  } catch (error) {
    console.error('\x1b[0;31mError: No se pudo renombrar el archivo.\x1b[0;m');
  }
};

const deleteFile = async (fileName) => {
  try {
    await fs.promises.unlink(fileName);
    console.log('\x1b[0;32mArchivo eliminado con éxito.\x1b[0;m');
  } catch (error) {
    console.error('\x1b[0;31mError: No se pudo eliminar el archivo.\x1b[0;m');
  }
};

const listTextFiles = async (chalk) => {
  try {
    const files = await fs.promises.readdir(directoryPath);
    const textFiles = files.filter(file => path.extname(file) === '.txt');

    if (textFiles.length === 0) {
      console.log('\x1b[0;31mNo hay archivos de texto en el directorio.\x1b[0;m');
      return;
    }

    console.log('\n\x1b[0;34mArchivos de texto:\x1b[0;m');
    textFiles.forEach((file, index) => {
      console.log(`${index + 1}. ${file}`);
    });

    const fileChoice = await readUserInput('Ingrese el número del archivo que desea ver o modificar: ');
    const selectedFileIndex = parseInt(fileChoice, 10) - 1;

    if (selectedFileIndex >= 0 && selectedFileIndex < textFiles.length) {
      await fileActionsMenu(textFiles[selectedFileIndex], chalk);
    } else {
      console.log('\x1b[0;31mOpción inválida.\x1b[0;m');
    }
  } catch (error) {
    console.error('\x1b[0;31mError: No se pudieron listar los archivos de texto.\x1b[0;m');
  }
};

const createNewFile = async (fileName) => {
  const completeFileName = `${fileName}.txt`; // Asegura que el nombre del archivo tenga la extensión .txt
  try {
    await fs.promises.writeFile(completeFileName, '', 'utf8');
    console.log('\x1b[0;32mArchivo creado con éxito.\x1b[0;m');
  } catch (error) {
    console.error('\x1b[0;31mError: No se pudo crear el archivo.\x1b[0;m');
  }
};

const readUserInput = async (prompt) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const input = await new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
  return input;
};

const selectFileAction = async (action, chalk, actionName) => {
  const files = await fs.promises.readdir(directoryPath);
  const textFiles = files.filter(file => path.extname(file) === '.txt');

  if (textFiles.length === 0) {
    console.log('\x1b[0;31mNo hay archivos de texto en el directorio.\x1b[0;m');
    return;
  }

  console.log('\n\x1b[0;34mArchivos de texto:\x1b[0;m');
  textFiles.forEach((file, index) => {
    console.log(`${index + 1}. ${file}`);
  });

  const fileChoice = await readUserInput(`Ingrese el número del archivo que desea ${actionName.toLowerCase()}: `);
  const selectedFileIndex = parseInt(fileChoice, 10) - 1;

  if (selectedFileIndex >= 0 && selectedFileIndex < textFiles.length) {
    await action(textFiles[selectedFileIndex]);
  } else {
    console.log('\x1b[0;31mOpción inválida.\x1b[0;m');
  }
};

const renameFilePrompt = async (fileName) => {
  const newFileName = await readUserInput('Ingrese el nuevo nombre del archivo (sin .txt): ');
  const completeNewFileName = `${newFileName}.txt`;
  await renameFile(fileName, completeNewFileName);
};

const fileActionsMenu = async (fileName, chalk) => {
  console.log(`\n\x1b[1;32mAcciones para el archivo ${fileName}\x1b[0;m`);
  console.log('1. ' + chalk.cyan('Ver contenido del archivo'));
  console.log('2. ' + chalk.yellow('Agregar texto al archivo'));
  console.log('3. ' + chalk.gray('Regresar al menú principal'));

  const choice = await readUserInput('Ingrese su elección (1-3): ');

  switch (choice) {
    case '1':
      await readFile(fileName);
      break;
    case '2':
      const textToAdd = await readUserInput('Ingrese el texto que desea agregar: ');
      await appendToFile(fileName, textToAdd);
      break;
    case '3':
      return;
    default:
      console.log('\x1b[0;31mOpción inválida.\x1b[0;m');
  }

  await fileActionsMenu(fileName, chalk); // Llamar recursivamente al menú de acciones del archivo
};
