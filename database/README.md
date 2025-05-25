# Scripts de Base de Datos

Este directorio contiene todos los scripts SQL necesarios para configurar y mantener la base de datos del sistema.

## Orden de Ejecución

1. `setup_database.sql` - Crea la estructura inicial de la base de datos
2. `crear_admin_nuevo.sql` - Crea el usuario administrador
3. `crear_moderador_nuevo.sql` - Crea el usuario moderador
4. `crear_gestor_final.sql` - Crea el usuario gestor

## Credenciales de Usuarios

### Administrador
- Usuario: `admin`
- Contraseña: `Admin123!`
- Hash: `$2b$10$W9Lu7jflYMM9y2nTZq5urOnu9g9ypteq21tQ5w3WsZ6tDAjTgurMC`

### Moderador
- Usuario: `moderador1`
- Contraseña: `Mod123!`
- Hash: `$2b$10$VBviwTfDNIREOHRNQX6xJ.equOwK13k4yapDdDOWyLjjfwexc3Axq`

### Gestor
- Usuario: `gestor1`
- Contraseña: `Gestor123!`
- Hash: `$2b$10$VBviwTfDNIREOHRNQX6xJ.equOwK13k4yapDdDOWyLjjfwexc3Axq`

## Notas Importantes

- Los hashes de contraseñas están generados con bcryptjs usando 10 rondas de salt
- La tabla `logs_roles` registra todos los cambios de roles
- Todos los usuarios se crean con `activo = TRUE` por defecto 