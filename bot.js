const { Client } = require("whatsapp-web.js")
const qrcode = require("qrcode-terminal")
const fs = require("fs")

const client = new Client({
    puppeteer: {
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox"
        ]
    }
})

let data = {
    m: {},
    f: {}
}

// cargar datos
if (fs.existsSync("data.json")) {
    data = JSON.parse(fs.readFileSync("data.json"))
}

// guardar datos
function guardar() {
    fs.writeFileSync("data.json", JSON.stringify(data, null, 2))
}

// QR
client.on("qr", (qr) => {
    console.log("Escaneá el QR:")
    qrcode.generate(qr, { small: true })
})

// listo
client.on("ready", () => {
    console.log("✅ Bot listo")
})

// mensajes
client.on("message", async (msg) => {

    const texto = msg.body.toLowerCase()

    // prefijo
    if (!texto.startsWith("x")) return

    const args = texto.split(" ")

    const comando = args[1]
    const equipo = args[2]
    const partido = args[3]
    const nombre = args.slice(4).join(" ")

    // validar equipo
    if (!data[equipo]) {
        return msg.reply("❌ Equipo inválido. Usá m o f")
    }

    switch (comando) {

        // crear partido
        case "p":

            if (!partido) {
                return msg.reply("❌ Falta nombre del partido")
            }

            data[equipo][partido] = []

            guardar()

            msg.reply(`✅ Partido ${partido} creado en ${equipo}`)
            break

        // agregar jugador
        case "j":

            if (!data[equipo][partido]) {
                return msg.reply("❌ Ese partido no existe")
            }

            if (!nombre) {
                return msg.reply("❌ Falta nombre")
            }

            data[equipo][partido].push(nombre)

            guardar()

            msg.reply(`✅ ${nombre} agregado a ${partido}`)
            break

        // sacar jugador
        case "sacar":

            if (!data[equipo][partido]) {
                return msg.reply("❌ Ese partido no existe")
            }

            data[equipo][partido] =
                data[equipo][partido].filter(p => p !== nombre)

            guardar()

            msg.reply(`❌ ${nombre} eliminado de ${partido}`)
            break

        // mostrar lista
        case "lista":

            if (!data[equipo][partido]) {
                return msg.reply("❌ Ese partido no existe")
            }

            msg.reply(
                `📋 Lista ${equipo} vs ${partido}\n\n` +
                (
                    data[equipo][partido].join("\n") ||
                    "Sin jugadores"
                )
            )

            break

        // ver partidos
        case "partidos":

            const lista = Object.keys(data[equipo])

            msg.reply(
                `🏆 Partidos en ${equipo}\n\n` +
                (
                    lista.join("\n") ||
                    "Sin partidos"
                )
            )

            break

        default:
            msg.reply("❌ Comando no reconocido")
    }
})

client.initialize()