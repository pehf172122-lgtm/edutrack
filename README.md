# EduTrack — Monitoreo educativo y alertas tempranas de deserción

**ODS abordado:** ODS 4 — Educación de calidad (indicadores del Banco Mundial `SE.PRM.ENRR` y `SE.ADT.LITR.ZS`).

**Universidad Cooperativa de Colombia — Ingeniería de Sistemas — Desarrollo Sostenible, Momento 2.**

- **Repositorio:** `https://github.com/<usuario>/<repositorio>`  ← _completar_
- **Despliegue (Render):** `https://<tu-servicio>.onrender.com`  ← _completar_

## Integrantes

| Nombre | Rol en el equipo |
|---|---|
| _Completar_ | _Completar_ |

## Descripción de la solución

EduTrack permite a una institución educativa registrar estudiantes, matrículas y rendimiento académico, y
**calcula automáticamente** los indicadores de matrícula primaria y alfabetización, además del **riesgo de
deserción** de cada estudiante (asistencia, promedio y lectura). Todo estudiante con riesgo medio o alto aparece
en **Alertas tempranas** con sus motivos y una recomendación, y el coordinador puede descargar un reporte
institucional. Contribuye al ODS 4 al dar seguimiento oportuno a quienes están en riesgo de abandonar el sistema escolar.

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | HTML, CSS y JavaScript (sin framework), servido por el mismo backend |
| Backend | Node.js 20+ y Express 4 (API REST) |
| Base de datos | **PostgreSQL** (esquema propio en `database/schema.sql`, 3FN) |
| Seguridad | Contraseñas con scrypt, sesión en cookie HttpOnly firmada (HMAC-SHA256), validación en servidor, consultas parametrizadas, escape de HTML en el cliente |
| Despliegue | Render (servicio web + PostgreSQL), definido en `render.yaml` |

## Estructura del repositorio

```
edutrack/
├── frontend/            Interfaz (index, dashboard, estudiantes, matrícula, rendimiento, alertas, reportes)
│   ├── css/  js/        js/services = clientes de la API; js/pages = lógica de cada vista
├── backend/
│   ├── server.js        Arranque de Express, rutas y archivos estáticos
│   ├── src/             config, db, seguridad, validación, motor de riesgo, rutas (src/routes)
│   └── tests/           Pruebas unitarias (node:test)
├── database/
│   ├── schema.sql       Tablas, tipos, llaves y restricciones + vista de indicadores
│   ├── seed.sql         Datos de ejemplo (usuarios de prueba incluidos)
│   ├── edutrack_dump.sql  Copia de respaldo = esquema + datos (restaurable con psql)
│   ├── der.png / der.svg / der.dot / edutrack.dbml   Diagrama entidad-relación
│   └── generate_seed.js Regenera seed.sql y el dump
├── render.yaml          Blueprint de despliegue en Render
├── .env.example         Variables de entorno (sin valores reales)
└── package.json
```

## Instalación y ejecución local

Requisitos: **Node.js 20+** y **PostgreSQL 14+**.

```bash
git clone https://github.com/<usuario>/<repositorio>.git
cd edutrack
npm install

# 1) Crea una base vacía en PostgreSQL
createdb edutrack            # o desde pgAdmin

# 2) Variables de entorno
cp .env.example .env         # y completa DATABASE_URL y SESSION_SECRET
#   DATABASE_URL=postgresql://usuario:clave@localhost:5432/edutrack
#   SESSION_SECRET=<cadena aleatoria de 32+ caracteres>
#   (genera una con:  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# 3) Crea tablas y carga los datos de ejemplo (también ocurre solo al arrancar si AUTO_INIT_DB=true)
npm run db:init

# 4) Arranca
npm start                    # http://localhost:3000
npm test                     # pruebas unitarias
```

Alternativa para restaurar la base manualmente: `psql "$DATABASE_URL" -f database/edutrack_dump.sql`.

## Variables de entorno

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL (obligatoria) |
| `DATABASE_SSL` | `true` solo si la base remota exige SSL (p. ej. URL externa de Render) |
| `SESSION_SECRET` | Secreto para firmar sesiones, mínimo 16 caracteres (obligatoria) |
| `SESSION_HOURS` | Duración de la sesión en horas (por defecto 8) |
| `AUTO_INIT_DB` | `true` crea el esquema y los datos de ejemplo si la base está vacía |
| `PORT` | Puerto local (Render lo asigna) |
| `NODE_ENV` | `development` o `production` |

## Despliegue en Render

1. Sube el repositorio a GitHub (sin `.env`).
2. En Render: **New → Blueprint** y elige el repositorio. `render.yaml` crea la base PostgreSQL `edutrack-db` y el servicio web `edutrack`, enlaza `DATABASE_URL` automáticamente y genera `SESSION_SECRET`.
   - Si prefieres hacerlo a mano: crea un **PostgreSQL** y un **Web Service** (Build: `npm install`, Start: `npm start`) y define las variables de la tabla anterior; usa la _Internal Database URL_.
3. En el primer arranque el servidor crea las tablas y carga los datos de ejemplo.
4. Abre la URL en una ventana de incógnito, inicia sesión y registra un dato para comprobar que se guarda.

> Verifica en Render las condiciones vigentes del plan gratuito (suspensión por inactividad y vigencia de la base de datos) antes de la fecha de entrega.

## Credenciales de prueba

| Rol | Correo | Contraseña | Permisos |
|---|---|---|---|
| Administrador (coordinador) | `coordinador@edutrack.edu.co` | `demo1234` | Todo, incluido registrar matrículas y alertas manuales |
| Docente | `docente@edutrack.edu.co` | `demo1234` | Consultar, registrar estudiantes y rendimiento, descargar reportes |

Las cuentas nuevas creadas desde "Crear cuenta de docente" siempre tienen rol docente.

## API REST

Todas las rutas (salvo `/api/auth/login`, `/api/auth/register` y `/api/health`) requieren sesión.

| Método y ruta | Descripción |
|---|---|
| `POST /api/auth/login` · `/register` · `/logout` · `GET /api/auth/me` | Autenticación |
| `GET/POST /api/estudiantes` · `GET/PUT /api/estudiantes/:id` | Estudiantes (con riesgo calculado) |
| `GET /api/matriculas` · `POST /api/matriculas` (admin) | Matrículas |
| `GET /api/rendimiento` · `GET /api/rendimiento/estudiante/:id` · `POST /api/rendimiento` | Rendimiento académico |
| `GET /api/alertas` · `POST /api/alertas` (admin) | Alertas automáticas + manuales |
| `GET /api/reportes/resumen` · `GET /api/reportes/historial` · `POST /api/reportes/descargas` | Indicadores y reportes |
| `GET /api/health` | Estado del servicio y de la base de datos |

## Base de datos

Motor: **PostgreSQL**. Siete tablas (`usuarios`, `instituciones`, `estudiantes`, `matriculas`, `rendimientos`,
`alertas_manuales`, `reportes_descargas`) y la vista `v_estudiantes_indicadores`. Cumple 3FN: la institución está
en su propia tabla y el promedio y la lectura **no se almacenan** en `estudiantes`; se derivan del historial.
Ver `database/schema.sql` y el diagrama `database/der.png`.

## Cambios respecto al Momento 1 / a la maqueta

| Cambio | Justificación |
|---|---|
| `localStorage` → PostgreSQL con API REST en Express | Persistencia real y compartida; la maqueta decía que reemplazaba temporalmente a PostgreSQL |
| Usuarios en el código JS → tabla `usuarios` con contraseñas hasheadas y roles | Las credenciales en el cliente eran visibles para cualquiera |
| Matrícula enlazada al estudiante por documento (FK), antes por nombre | Integridad referencial y evitar duplicados por homónimos |
| Promedio y lectura derivados en una vista | Evita datos redundantes (3FN) |
| Escape de HTML en la interfaz | Los datos ahora son compartidos entre usuarios; se evita inyección de scripts |
| Registro de cuentas de docente | La guía pide vistas de registro e inicio de sesión |
