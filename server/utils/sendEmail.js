const sgMail = require('@sendgrid/mail'); // Importa la librería de SendGrid para el envío de correos

// Configura la API Key de SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY); // Usa la API Key almacenada en las variables de entorno

// Función para enviar una alerta de stock bajo
const sendStockAlert = async (productName, recipientEmail) => {
  const msg = {
    to: recipientEmail, // Correo del destinatario
    from: 'tatooliveto10@gmail.com', // Tu correo verificado en SendGrid
    subject: `Alerta de stock bajo para ${productName}`, // Asunto del correo
    text: `El stock del producto ${productName} está por debajo del nivel crítico. Es momento de reabastecer.`, // Mensaje del correo
  };

  try {
    await sgMail.send(msg); // Envía el correo
    console.log('Correo enviado con éxito'); // Mensaje de éxito en la consola
  } catch (error) {
    console.error('Error al enviar el correo:', error.message); // Mensaje de error si falla el envío
  }
};

module.exports = sendStockAlert; // Exporta la función para usarla en otras partes del proyecto

