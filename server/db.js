const mongoose = require('mongoose'); // Importa la librería Mongoose, que nos permite interactuar con MongoDB.

const connectDB = async () => { 
  try {
    // Intenta establecer una conexión con la base de datos MongoDB.
    await mongoose.connect('mongodb+srv://tatooliveto10:40462509@clustersaas.zzgui.mongodb.net/saas', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Conectado a la base de datos'); // Si la conexión es exitosa, imprime este mensaje.
  } 
  
  catch (error) {
    // Si hay un error en la conexión, muestra el mensaje de error en la consola.
    console.log(error.message);
    process.exit(1); // Finaliza el proceso en caso de error para evitar problemas posteriores.
  }
};

module.exports = connectDB; // Exporta la función para que pueda ser usada en otros archivos (como index.js).
