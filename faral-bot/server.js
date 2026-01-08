import express from "express";
import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys";
import qrcode from "qrcode-terminal";
import cors from "cors";
import { db, ref, push } from "./firebase.js";
import { FirebaseError } from "firebase/app";
import  fs  from "fs";
import  path  from "path";

import { Sticker, StickerTypes } from "wa-sticker-formatter";


const app = express();

const allowedOrigins = [
  "https://faral-project-cvnz.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001"
];


app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

let sock;

const whitelist = process.env.WHITELIST
  ? process.env.WHITELIST.split(",")
  : [];

  

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth");
  sock = makeWASocket({
    auth: state
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
        const { connection, qr } = update;
        if (qr) {
          const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`;
          console.log("\n📱 Scan your WhatsApp QR here:\n", qrImageUrl);
        }


        if (connection === "close") {
            console.log("Connection closed. Reconnecting...");
            connectToWhatsApp();
        } else if (connection === "open") {
            console.log("✅ WhatsApp connected successfully!");
        }
    });
}

connectToWhatsApp();

app.post("/send", async (req, res) => {
  try {
    const { number, message } = req.body;
    if (!number || !message)
      return res.status(400).json({ error: "Number and message required" });

    if(!whitelist.includes(number)){
      
      try{
        await push(ref(db, 'denied_messageas'),{
          number,
          timestamp: Date.now()
        });
      } catch(err){
        console.error("Firebase error:", FirebaseError);
      }

      return res.json({ success: false, token: "Denied" });
    }

    const stickerpath = path.join("./images");
    const stickerfiles = fs.readdirSync(stickerpath).filter(file => file.endsWith('.webp'));

    const jid = `91${number}@s.whatsapp.net`;

    for(const stickerfile of stickerfiles) {
      const stickerBuffer = fs.readFileSync(path.join(stickerpath, stickerfile));

      const sticker = new Sticker(stickerBuffer,{
        type: StickerTypes.FULL,
        pack: "Faral",
        author: "Faral Team",
        quality: 100,
      });

      const stickermessage = await sticker.build();

      await sock.sendMessage(jid, { sticker: stickermessage });
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    await sock.sendMessage(jid, { text: message });
    res.json({ success: true, token: "Allowed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`🚀 Backend running on http://localhost:${port}`));

