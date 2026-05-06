const { Client } = require("whatsapp-web.js")
const qrcode = require("qrcode-terminal")
const QRCode = require('qrcode')
const fs = require("fs")

const client = new Client({
  puppeteer: {
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  }
})

let data = {
    masculino: {},
    femenino: {}
}

// cargar datos si existen
if (fs.existsSync("data.json")) {
    data = JSON.parse(fs.readFileSync("data.json"))
}

// guardar datos
function guardar() {
    fs.writeFileSync("data.json", JSON.stringify(data, null, 2))
}



client.on('qr', async (qr) => {
  await QRCode.toFile('qr.png', qr)
  console.log('QR guardado como qr.png')
  qrcode.generate(qr, { small: true })
})


client.on("ready", () => {
    console.log("✅ Bot listo 24/7")
})

client.on("message", async (msg) => {
    const texto = msg.body.toLowerCase()

    if (!texto.startsWith("X")) return

    const args = texto.split(" ")
    const comando = args[1]
    const equipo = args[2] // m o f
    const partido = args[3]
    const nombre = args.slice(4).join(" ")

    if (!data[equipo]) {
        return msg.reply("Equipo inválido (m / f)")
    }

    switch (comando) {

        case "p":
            data[equipo][partido] = []
            guardar()
            msg.reply(`Partido contra ${partido} creado en ${equipo}`)
            break

        case "j":
            if (!data[equipo][partido]) return
            data[equipo][partido].push(nombre)
            guardar()
            msg.reply(`+ ${nombre} agregado al partido contra ${partido}`)
            break

        case "sacar":
            if (!data[equipo][partido]) return
            data[equipo][partido] =
                data[equipo][partido].filter(p => p !== nombre)
            guardar()
            msg.reply(`X ${nombre} eliminado del partido contra ${partido}`)
            break

        case "lista":
            if (!data[equipo][partido]) return
            msg.reply(
            `- ${equipo} partido contra:\n ${partido}\n\n` +
                (data[equipo][partido].join("\n") || "Sin jugadores")
            )
            break

        case "partidos":
            const lista = Object.keys(data[equipo])
            msg.reply(
                ` Partidos en ${equipo}:\n` +
                (lista.join("\n") || "Ninguno")
            )
            break
    }
})

client.initialize()