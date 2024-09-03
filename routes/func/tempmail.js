const fetch = require("node-fetch");

async function generarCorreoAleatorio() {
    const enlace = "https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1";

    try {
        let respuesta = await fetch(enlace);
        if (!respuesta.ok) {
            throw new Error(`Error HTTP! estado: ${respuesta.status}`);
        }
        let datos = await respuesta.json();
        return {
            status: true,
            correo: datos[0]
        };
    } catch (error) {
        console.log(error);
        return {
            status: false,
            error: "حدث خطأ أثناء إنشاء البريد الإلكتروني العشوائي."
        };
    }
}

async function obtenerCorreos(correoCompleto) {
    const [id, dominio] = correoCompleto.split('@');
    const link = `https://www.1secmail.com/api/v1/?action=getMessages&login=${id}&domain=${dominio}`;

    try {
        let respuesta = await fetch(link);
        if (!respuesta.ok) {
            throw new Error(`Error HTTP! estado: ${respuesta.status}`);
        }
        let datos = await respuesta.json();

        if (datos.length === 0) {
            return {
                status: true,
                correos: 'لم يتم تلقي أي رسائل بريد إلكتروني حتى الآن.'
            };
        }

        return {
            status: true,
            correos: datos
        };
    } catch (error) {
        console.log(error);
        return {
            status: false,
            error: "حدث خطأ أثناء جلب الرسائل."
        };
    }
}

module.exports = { generarCorreoAleatorio, obtenerCorreos };
