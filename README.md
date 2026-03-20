
# Proyecto EAG - Panel de gestión

## Descripción del Proyecto
El proyecto que hemos elaborado es una aplicación web diseñada para gestionar la cartera de clientes, los servicios ofrecidos por la empresa (como fibra, paquetes móviles, etc) y los contratos.

El sistema cuenta con un acceso seguro a la aplicación con el login de usuarios.

## Funciones Principales

El usuario trabajador, una vez se haya logueado, podrá gestionar a los clientes, servicios y contratos con su CRUD completo (podrá crear, listar, modificar y eliminar datos).

## Modelo de Datos (Diagrama Entidad-Relación)
Para poder ver las entidades principales del proyecto haz click en el siguiente enlace:
[Diagrama Entidad-Relación](diagrama_Entidad-Relacion.png)

## Como acceder al sistema
(Aqui ya ponemos las credenciales, comandos, dependencias y cosas shulas)

## Tecnologías Utilizadas

**Frontend (Interfaz de usuario):**
- **React** con **TypeScript** (utilizando Vite como empaquetador).
- **Tailwind CSS** para un diseño responsive.
- **React Router DOM** para la navegación y enrutamiento entre las distintas vistas.
- **Axios** para conectar y realizar las peticiones HTTP a la API.

**Backend (Lógica de servidor y API):**
- **PHP** robusto con el framework **Symfony**.
- **Doctrine ORM** para la gestión orientada a objetos de la Base de Datos.
- **LexikJWTAuthenticationBundle** para seguridad de la API mediante tokens JWT.
- **Docker & Docker Compose** para levantar y virtualizar la base de datos de manera uniforme usando los contenedores.

## Vistas y Rutas
Una vez levantado el entorno de desarrollo y logueado, estas son las principales vistas que componen el proyecto:

- **Autenticación**
  - `/login`: Pantalla de inicio de sesión de usuario, requiriendo credenciales válidas y proporcionando un token JWT.
  
- **Clientes**
  - `/clientes`: Panel general (*mis clientes*) que lista la información de la cartera de clientes de un usuario y los servicios que han contratado.
  - `/nuevo-cliente`: Formulario validado para registrar de alta a un nuevo cliente en la cuenta del user que está logueado.
  - `/editar-cliente/:id`: Vista de actualización y eliminación de un cliente específico.

- **Servicios**
  - `/servicios`: Catálogo personal con los servicios ofrecidos, con la información de precios y su estado activo/inactivo.
  - `/nuevo-servicio`: Formulario para dar de alta un nuevo tipo de servicio.
  - `/editar-servicio/:id`: Vista de actualización y eliminación de un servicio.

**Contrato**
  - `/editar-contrato/:id`: Vista de actualización y eliminación de un contrato.
  - Para `crear un contrato` se hace con un componente modal en `/clientes` mediante el botón `Añadir servicio a cliente`.

  ## Cómo acceder al sistema
  - Se necesita tener las dependencias actualizadas: ejecutar `composer install` y `npm install`. 
  - Migrar la base de datos y cargar las fixtures (Aquí se encuentran lsa credenciales de acceso de prueba).
  - Levantar contenedor de Docker.Para Windows el comando es `docker-compose up`, para Linux `docker compose up`. (Hacerlo en la carpeta raíz del proyecto)
  - Levantar servidor de Symfony con `symfony serve` o `symfony server:start`para Linyx y MacOs (Hacerlo en la carpeta raíz del proyecto).
  - En la carpeta frontend ejecutar el comando `npm run dev`.
  - Acceder a la ruta `http://localhost:5173/login` en el navegador.
  - Introducir las credenciales de acceso.

