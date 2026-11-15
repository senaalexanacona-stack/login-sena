// API de registro e inicio de sesión

const express = require("express");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, "usuarios.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


function leerUsuarios() {
  if (!fs.existsSync(DB_FILE)) return [];
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}

function guardarUsuarios(usuarios) {
  fs.writeFileSync(DB_FILE, JSON.stringify(usuarios, null, 2));
}


function crearUsuarioPrueba() {
  const usuarios = leerUsuarios();
  if (!usuarios.find((u) => u.usuario === "becerra")) {
    usuarios.push({ usuario: "becerra", password: bcrypt.hashSync("instru123", 10) });
    guardarUsuarios(usuarios);
  }
}
crearUsuarioPrueba();


app.post("/api/registro", (req, res) => {
  const { usuario, password } = req.body || {};

  if (!usuario || !password) {
    return res.status(400).json({ exito: false, mensaje: "Error: usuario y contraseña son obligatorios" });
  }
  if (password.length < 6) {
    return res.status(400).json({ exito: false, mensaje: "Error: la contraseña debe tener mínimo 6 caracteres" });
  }

  const usuarios = leerUsuarios();
  if (usuarios.find((u) => u.usuario === usuario)) {
    return res.status(409).json({ exito: false, mensaje: "Error: el usuario ya existe" });
  }

  usuarios.push({ usuario, password: bcrypt.hashSync(password, 10) });
  guardarUsuarios(usuarios);

  return res.status(201).json({ exito: true, mensaje: "Usuario registrado con éxito" });
});


app.post("/api/login", (req, res) => {
  const { usuario, password } = req.body || {};

  if (!usuario || !password) {
    return res.status(400).json({ exito: false, mensaje: "Error: usuario y contraseña son obligatorios" });
  }

  const encontrado = leerUsuarios().find((u) => u.usuario === usuario);
  if (!encontrado || !bcrypt.compareSync(password, encontrado.password)) {
    return res.status(401).json({ exito: false, mensaje: "Error en la autenticación: usuario o contraseña incorrectos" });
  }

  return res.status(200).json({ exito: true, mensaje: "Autenticación satisfactoria. Bienvenido " + usuario });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
