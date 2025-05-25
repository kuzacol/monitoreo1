# Sistema de Monitoreo

Sistema de gestión de programadas con roles de usuario y autenticación.

## Estructura del Proyecto

```
monitoreo/
├── backend/           # Servidor Node.js + Express + TypeScript
│   ├── src/
│   │   ├── config/   # Configuración de base de datos
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── utils/
│   └── package.json
└── frontend/         # Cliente React + TypeScript
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   └── types/
    └── package.json
```

## Requisitos

- Node.js >= 14
- MySQL >= 8.0
- XAMPP (para desarrollo local)

## Configuración

### Base de Datos

1. Crear una base de datos llamada `monitoreo` en MySQL
2. Ejecutar los scripts SQL en el siguiente orden:
   - `setup_database.sql` (estructura inicial)
   - `crear_admin_nuevo.sql` (usuario administrador)
   - `crear_moderador_nuevo.sql` (usuario moderador)
   - `crear_gestor_final.sql` (usuario gestor)

### Backend

1. Navegar al directorio backend:
```bash
cd backend
```

2. Instalar dependencias:
```bash
npm install
```

3. Crear archivo `.env`:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=monitoreo
JWT_SECRET=tu_secreto_aqui
```

4. Iniciar el servidor:
```bash
npm run dev
```

### Frontend

1. Navegar al directorio frontend:
```bash
cd frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Iniciar la aplicación:
```bash
npm start
```

## Usuarios por Defecto

### Administrador
- Usuario: `admin`
- Contraseña: `Admin123!`
- Permisos: Crear/gestionar todos los tipos de usuarios

### Moderador
- Usuario: `moderador1`
- Contraseña: `Mod123!`
- Permisos: Crear usuarios gestores

### Gestor
- Usuario: `gestor1`
- Contraseña: `Gestor123!`
- Permisos: Gestionar programadas

## Funcionalidades

- Sistema de autenticación con JWT
- Gestión de roles (admin, moderador, gestor)
- CRUD de programadas
- Registro de cambios de roles
- Interfaz moderna y responsiva

## Seguridad

- Contraseñas hasheadas con bcrypt
- Validación de tokens JWT
- Protección de rutas por rol
- Sanitización de entradas
- Logging de cambios de roles 