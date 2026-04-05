import "dotenv/config"
import { readFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"
import admin from "firebase-admin"

const __dirname = dirname(fileURLToPath(import.meta.url))

const serviceAccountPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ??
  resolve(__dirname, "../../firebase-adminsdk.json")

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf-8"))
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })

admin.auth().createUser({
  email: "admin@test.com",
  password: "testat123",
  emailVerified: true,
}).then((user) => {
  console.log(`Created user: ${user.uid} (${user.email})`)
}).catch((err) => {
  console.error("Failed:", err.message)
  process.exit(1)
})
