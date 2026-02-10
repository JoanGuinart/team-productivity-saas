# Como empieza y evoluciona la app (solo codigo)

Este documento esta pensado para alguien con poca experiencia en backend y frontend. Explica el flujo real del codigo: donde entra la app, como pasa de una pantalla a otra y que APIs se llaman. No entra en estilos ni UI.

## 1) Punto de entrada (arranque de la app)

1. Next.js carga el layout global en [app/layout.tsx](app/layout.tsx).
2. El layout envuelve toda la app con `SessionProvider` en [app/providers.tsx](app/providers.tsx).
3. La pagina principal es [app/page.tsx](app/page.tsx) y solo renderiza `HomeClient`.

Lectura sugerida en este orden:
- [app/layout.tsx](app/layout.tsx)
- [app/providers.tsx](app/providers.tsx)
- [app/page.tsx](app/page.tsx)
- [app/dashboard/components/HomeClient.tsx](app/dashboard/components/HomeClient.tsx)

## 2) Decidir que ve el usuario (sesion)

Archivo clave: [app/dashboard/components/HomeClient.tsx](app/dashboard/components/HomeClient.tsx)

Aqui pasa esto:
1. `useSession()` lee el estado de login.
2. Si no hay sesion (`unauthenticated`), se muestran los formularios de registro y login.
3. Si hay sesion (`authenticated`), se muestra el dashboard (`DashboardClient`).

## 3) Registro (backend) y login (backend)

### Registro (API)
Archivo: [app/api/auth/register/route.ts](app/api/auth/register/route.ts)

Flujo:
1. Llega un `POST` con `email`, `name`, `password` y `adminPassword`.
2. Si `adminPassword` no coincide con `ADMIN_PASSWORD`, devuelve 403.
3. Si el email ya existe, devuelve 409.
4. Si todo esta bien, guarda el usuario con password encriptada (`bcrypt`).

### Login (NextAuth)
Archivo: [app/api/auth/[...nextauth]/route.ts](app/api/auth/[...nextauth]/route.ts)

Flujo:
1. `CredentialsProvider` recibe `email` y `password`.
2. Busca el usuario en Prisma.
3. Compara password con `bcrypt.compare`.
4. Si es valido, crea JWT y lo guarda en sesion.

## 4) Registro y login (frontend)

### Registro
Archivo: [app/components/TestRegister.tsx](app/components/TestRegister.tsx)

Flujo:
1. El usuario rellena el formulario.
2. Se hace `fetch('/api/auth/register')`.
3. Se muestra el resultado.

### Login
Archivo: [app/components/TestLogin.tsx](app/components/TestLogin.tsx)

Flujo:
1. El usuario rellena email y password.
2. `signIn('credentials')` llama al backend de NextAuth.
3. Si va bien, se refresca la pagina y cambia el estado de sesion.

## 5) Dashboard (cliente) y carga de datos

Archivo clave: [app/dashboard/components/DashboardClient.tsx](app/dashboard/components/DashboardClient.tsx)

Flujo:
1. Cuando hay sesion, el componente llama a `GET /api/dashboard`.
2. Esa API devuelve equipos, miembros y proyectos ya formateados.
3. El dashboard muestra distintas tabs usando esos datos.

API: [app/api/dashboard/route.ts](app/api/dashboard/route.ts)

## 6) Equipos (crear, listar, miembros)

### Crear equipo
Backend: [app/api/teams/create/route.ts](app/api/teams/create/route.ts)
Frontend: [app/dashboard/components/MembersManager.tsx](app/dashboard/components/MembersManager.tsx)

Flujo:
1. `MembersManager` hace `POST /api/teams/create`.
2. El backend crea el equipo y pone al usuario como `admin`.

### Buscar usuarios para agregar
Backend: [app/api/users/route.ts](app/api/users/route.ts)
Frontend: [app/dashboard/components/MembersManager.tsx](app/dashboard/components/MembersManager.tsx)

Flujo:
1. El frontend busca por email o nombre con `GET /api/users?search=...&teamId=...`.
2. El backend devuelve una lista de usuarios que no estan en el equipo.

### Agregar miembro
Backend: [app/api/teams/add-member/route.ts](app/api/teams/add-member/route.ts)
Frontend: [app/dashboard/components/MembersManager.tsx](app/dashboard/components/MembersManager.tsx)

Flujo:
1. `POST /api/teams/add-member` con `teamId` y `userId`.
2. El backend valida que el usuario exista y no sea ya miembro.
3. Se crea el `TeamMember`.

### Eliminar miembro
Backend: [app/api/teams/[teamid]/members/[userid]/route.ts](app/api/teams/[teamid]/members/[userid]/route.ts)
Frontend: [app/dashboard/components/MembersManager.tsx](app/dashboard/components/MembersManager.tsx)

Flujo:
1. `DELETE /api/teams/{teamid}/members/{userid}`.
2. El backend borra la relacion de ese miembro.

## 7) Proyectos

### Crear proyecto
Backend: [app/api/projects/create/route.ts](app/api/projects/create/route.ts)
Frontend: [app/dashboard/components/ProjectsManager.tsx](app/dashboard/components/ProjectsManager.tsx)

Flujo:
1. `POST /api/projects/create` con `name` y `teamId`.
2. El backend valida que el usuario pertenece al equipo.
3. Se crea el proyecto.

### Listar proyectos por equipo
Backend: [app/api/projects/route.ts](app/api/projects/route.ts)
Frontend: [app/dashboard/components/ProjectsManager.tsx](app/dashboard/components/ProjectsManager.tsx)

Flujo:
1. `GET /api/projects?teamId=...`.
2. El backend devuelve proyectos del equipo.

### Eliminar proyecto
Backend: [app/api/projects/[projectid]/route.ts](app/api/projects/[projectid]/route.ts)
Frontend: [app/dashboard/components/ProjectsManager.tsx](app/dashboard/components/ProjectsManager.tsx)

Flujo:
1. `DELETE /api/projects/{projectid}`.
2. El backend borra tareas del proyecto y luego el proyecto.

## 8) Tareas

### Crear tarea
Backend: [app/api/tasks/create/route.ts](app/api/tasks/create/route.ts)
Frontend:
- [app/dashboard/components/TaskForm.tsx](app/dashboard/components/TaskForm.tsx)
- [app/dashboard/components/NewTaskForm.tsx](app/dashboard/components/NewTaskForm.tsx)

Flujo:
1. `POST /api/tasks/create` con `title`, `projectId` y opcionales (`assigneeId`, `priority`, `dueDate`).
2. El backend valida que el usuario pertenece al equipo del proyecto.
3. Se crea la tarea.

### Ver tareas por proyecto
Backend: [app/api/tasks/project/[projectid]/route.ts](app/api/tasks/project/[projectid]/route.ts)
Frontend:
- [app/dashboard/components/TasksManager.tsx](app/dashboard/components/TasksManager.tsx)
- [app/dashboard/components/ProjectsView.tsx](app/dashboard/components/ProjectsView.tsx)

Flujo:
1. `GET /api/tasks/project/{projectid}`.
2. El backend valida acceso y devuelve tareas.

### Cambiar estado o datos de una tarea
Backend: [app/api/tasks/[taskid]/route.ts](app/api/tasks/[taskid]/route.ts)
Frontend: [app/dashboard/components/TasksManager.tsx](app/dashboard/components/TasksManager.tsx)

Flujo:
1. `PATCH /api/tasks/{taskid}` con cambios (ej. `status`).
2. El backend valida acceso y actualiza la tarea.

### Borrar tarea
Backend: [app/api/tasks/[taskid]/route.ts](app/api/tasks/[taskid]/route.ts)
Frontend: [app/dashboard/components/TasksManager.tsx](app/dashboard/components/TasksManager.tsx)

Flujo:
1. `DELETE /api/tasks/{taskid}`.
2. El backend valida acceso y elimina la tarea.

## 9) Modelo de datos (que usa el backend)

Archivo: [prisma/schema.prisma](prisma/schema.prisma)

Entidades clave:
- `User` -> usuarios con email y password.
- `Team` -> equipos.
- `TeamMember` -> relacion usuario-equipo.
- `Project` -> proyectos dentro de un equipo.
- `Task` -> tareas dentro de un proyecto.

## 10) Ruta completa, paso a paso (resumen)

1. La app arranca en [app/layout.tsx](app/layout.tsx) y [app/page.tsx](app/page.tsx).
2. [app/dashboard/components/HomeClient.tsx](app/dashboard/components/HomeClient.tsx) decide si mostrar login/registro o dashboard.
3. Registro llama a [app/api/auth/register/route.ts](app/api/auth/register/route.ts).
4. Login llama a [app/api/auth/[...nextauth]/route.ts](app/api/auth/[...nextauth]/route.ts).
5. Con sesion activa, `DashboardClient` llama a [app/api/dashboard/route.ts](app/api/dashboard/route.ts).
6. Desde ahi el usuario puede crear equipos, proyectos y tareas con sus APIs.

Si quieres, puedo convertir este recorrido en un diagrama de flujo solo con nombres de archivos y rutas.
