const mercadopago = require('mercadopago');

// Configura el Access Token directamente
mercadopago.accessToken = 'TEST-3283031777355230-111620-3eaf3b51db24710ce10c8bf84e60234b-813720144';

async function testPreference() {
  try {
    const preference = {
      items: [
        {
          title: "Camiseta",
          unit_price: 1000,
          quantity: 1,
        },
      ],
    };

    const response = await mercadopago.preferences.create(preference);
    console.log('Preference created:', response.body);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testPreference();
