const { Client, LocalAuth } = require("whatsapp-web.js")
const qrcode = require("qrcode-terminal")
const fs = require("fs")

const client = new Client({
    authStrategy: new LocalAuth(),

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
    console.log("✅ BOT LISTO")
})

// mensajes
client.on("message", async (msg) => {

    const texto = msg.body.toLowerCase()

    if (!texto.startsWith("x ")) return

    const args = texto.split(" ")

    const cmd = args[1]
    const equipo = args[2]

    if (!["m", "f"].includes(equipo)) {
        return msg.reply("Equipo inválido (m/f)")
    }

    switch (cmd) {

        // crear partido
        case "p": {

            const partido = args[3]

            if (!partido) {
                return msg.reply("Falta nombre del partido")
            }

            if (data[equipo][partido]) {
                return msg.reply("⚠️ Ese partido ya existe")
            }

            data[equipo][partido] = []

            guardar()

            msg.reply(`Partido contra ${partido} creado`)
            break
        }

        // agregar jugador
        case "j": {

            const partido = args[3]
            const jugador = args.slice(4).join(" ")

            if (!data[equipo][partido]) {
                return msg.reply("Partido inexistente")
            }

            if (!jugador) {
                return msg.reply("Falta jugador")
            }

            if (data[equipo][partido].includes(jugador)) {
                return msg.reply("gil ese ya está agregado")
            }

            data[equipo][partido].push(jugador)

            guardar()

            msg.reply(`${jugador} agregado`)
            break
        }

        // sacar jugador
        case "s": {

            const partido = args[3]
            const jugador = args.slice(4).join(" ")

            if (!data[equipo][partido]) {
                return msg.reply("Partido inexistente")
            }

            data[equipo][partido] =
                data[equipo][partido].filter(j => j !== jugador)

            guardar()

            msg.reply(`${jugador} eliminado`)
            break
        }

        // cambiar jugador
        case "c": {

            const partido = args[3]
            const viejo = args[4]
            const nuevo = args.slice(5).join(" ")

            if (!data[equipo][partido]) {
                return msg.reply("Partido inexistente")
            }

            const index =
                data[equipo][partido].indexOf(viejo)

            if (index === -1) {
                return msg.reply("Jugador no encontrado")
            }

            data[equipo][partido][index] = nuevo

            guardar()

            msg.reply(`✅ ${viejo} → ${nuevo}`)
            break
        }

        // lista
        case "l": {

            const partido = args[3]

            if (!data[equipo][partido]) {
                return msg.reply("Partido inexistente")
            }

            const jugadores = data[equipo][partido]

            const listaNumerada =
                jugadores.map((j, i) => `${i + 1}. ${j}`).join("\n")

        msg.reply(`🏆 ${partido.toUpperCase()} (${equipo})\n\n` +
    (
        listaNumerada ||
        "Sin jugadores"
    )
)
            break
        }

        // partidos
        case "ps": {

            const partidos =
                Object.keys(data[equipo])

            msg.reply(
                `Partidos ${equipo}\n\n` +
                (
                    partidos.join("\n") ||
                    "Sin partidos"
                )
            )

            break
        }

        // borrar partido
        case "b": {

            const partido = args[3]

            if (!data[equipo][partido]) {
                return msg.reply("Partido inexistente")
            }

            delete data[equipo][partido]

            guardar()

            msg.reply(`Partido eliminado`)
            break
        }

        default:
            msg.reply("Comando inválido")
    }
})

client.initialize()