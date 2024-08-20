import puppeteer from 'puppeteer';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'; // Importar dotenv

dotenv.config(); // Cargar las variables de entorno

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());

// Habilitar CORS para todas las rutas
app.use(cors()); // Activar CORS


// async function openWebPage(){
//  const browser= await  puppeteer.launch({
//     headless: 'shell',
//  })

//  const page=await browser.newPage()

//  await page.goto('https://visortmo.com/library/manga/55644/tsuetotsuruginowistoria');

//  await page.waitForSelector('.upload-link');

// const elementos= await page.evaluate(()=>{
//     const nodos = document.querySelectorAll('.upload-link');
//     const arrayh4=Array.from(nodos);

//     const capitulos=arrayh4.map(capi=>capi.querySelector('a').innerText);

//     return capitulos;

    

//     //r Array.from(nodos).map(nodo=>nodo.textContent);
// });

// console.log({elementos});
// console.log(elementos.length);

//  //console.table(listManga);

//  await browser.close();
// }


// openWebPage();

app.post('/api/manga', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'Se requiere un enlace de manga.' });
    }

    try {
        const browser = await puppeteer.launch({ 
            args: [
                "--disable-setuid-sandbox",
                "--no-sandbox",
                "--single-process",
                "--no-zygote",
              ],
              executablePath:
                process.env.NODE_ENV === "production"
                  ? process.env.PUPPETEER_EXECUTABLE_PATH
                  : puppeteer.executablePath(),
        });
        const page = await browser.newPage();
       // const navigationPromise = page.waitForNavigation({waitUntil:"domcontentloaded"});
        
        // Navegar a la URL proporcionada
        await page.goto(url,{waitUntil:'networkidle2'});
        await page.waitForSelector('.upload-link');
        //await navigationPromise;

        const elementos = await page.evaluate(() => {
            const nodos = document.querySelectorAll('.upload-link');
            const arrayh4 = Array.from(nodos);
            const capitulos = arrayh4.map(capi => capi.querySelector('a').innerText);
            return capitulos;
        });

        await browser.close();

        // Devolver la lista de elementos y su longitud
        res.json({ elementos, length: elementos.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al procesar la solicitud.' });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
