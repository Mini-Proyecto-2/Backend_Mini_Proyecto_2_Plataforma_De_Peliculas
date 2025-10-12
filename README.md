# 🎬 Plataforma de Películas – Backend

Este repositorio contiene el **backend** del proyecto **“Plataforma de Películas”**, desarrollado como parte del curso **Proyecto Integrador I (2025-2)**.  
El objetivo es proveer la lógica del servidor, la gestión de usuarios, la comunicación con la base de datos y la integración con servicios externos para la plataforma web de streaming.

---

## ⚙️ Tecnologías utilizadas
- **Node.js + Express** – entorno de ejecución y framework para la API REST.  
- **TypeScript** – tipado estático y estructura modular del código.  
- **MongoDB Atlas + Mongoose** – base de datos NoSQL y modelado de colecciones.  
- **Cloudinary / API Pexels** – gestión de contenidos multimedia.  
- **Render** – despliegue del backend en la nube.  

---

## 🧩 Funcionalidades por Sprint

### 🏁 Sprint 1 – Gestión de usuarios y películas
- Endpoints REST para registro, login, logout, edición y eliminación de usuarios.  
- CRUD de películas (GET, POST, PUT, DELETE).  
- Autenticación y autorización con tokens.  

### ⭐ Sprint 2 – Favoritos y calificaciones
- Rutas CRUD para favoritos y valoraciones (1–5 estrellas).  
- Validación de datos y relaciones entre colecciones (users–movies–ratings).  

### 💬 Sprint 3 – Comentarios y subtítulos
- Endpoints para crear, leer, actualizar y eliminar comentarios.  
- Gestión de subtítulos en español e inglés (activación/desactivación).  

---

## 🧠 Buenas prácticas
- Código en **inglés**, documentado con **JSDoc**.  
- Variables de entorno seguras (.env).  
- Estructura modular por controladores, modelos y rutas.  
- Middleware para manejo de errores y autenticación.  

---

## 🔗 Integraciones
- **Frontend:** React + Vite (Vercel).  
- **Base de datos:** MongoDB Atlas.  
- **Multimedia:** Cloudinary / Pexels API.  

---

## 🧩 Gestión y control de versiones
- Metodología **SCRUM** gestionada en **Taiga**.  
- Control de versiones en **GitHub**, con ramas por integrante.  
- Pull Requests etiquetadas como `sprint-X-release`.  

---

## 🌐 Despliegue
- **Backend (Render):** [URL de la API](https://api-en-render.onrender.com)  
- Variables de entorno configuradas para conexión con la base de datos y servicios externos.  

---

## 👥 Equipo
Desarrollado por un equipo multidisciplinario de cinco integrantes bajo la guía del profesor del curso.  
Cada rol fue asignado según las responsabilidades definidas: frontend, backend, base de datos, pruebas y gestión de proyectos.
