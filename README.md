# Vitalia Beauty Experience

Aplicación React + TypeScript + Vite + Tailwind CSS, preparada para desplegarse en Vercel. Incluye la experiencia visual y los módulos interactivos del archivo original, junto con conexión preparada a Supabase para catálogo, reservas y autenticación administrativa.

## Requisitos

- Node.js 20.19+ o 22.12+
- npm
- Proyecto Supabase
- Cuenta Vercel para publicar

## 1. Abrir en Visual Studio Code

1. Descomprime la carpeta del proyecto.
2. Abre Visual Studio Code.
3. Selecciona **Archivo → Abrir carpeta** y elige `vitalia-web`.
4. Abre la terminal integrada.

## 2. Instalar y ejecutar

```bash
npm install
cp .env.example .env.local
npm run dev
```

En Windows PowerShell, copia `.env.example` como `.env.local` manualmente. Completa las variables antes de probar los servicios conectados. Vite mostrará la dirección local en la terminal.

## 3. Configurar Supabase

1. Crea un proyecto en Supabase.
2. En **SQL Editor**, ejecuta el contenido completo de `supabase/schema.sql`.
3. En **Project Settings → API**, copia la Project URL y la clave pública `anon`.
4. Pega esos valores en `.env.local`:

```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_CLAVE_ANON_PUBLICA
VITE_WHATSAPP_NUMBER=57XXXXXXXXXX
```

No coloques `service_role`, contraseñas ni claves privadas en variables `VITE_`. Las variables con prefijo `VITE_` se incluyen en el navegador.

### Crear el usuario administrador

1. En Supabase → Authentication → Users, crea el usuario administrador con el correo y una contraseña robusta.
2. En SQL Editor, asigna el rol desde un entorno administrativo seguro, sustituyendo el correo:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where email = 'CORREO_ADMINISTRADOR';
```

3. Cierra sesión y vuelve a iniciar sesión desde el panel de Vitalia.

La aplicación valida `app_metadata.role = admin`; las políticas RLS del esquema restringen las operaciones de administración. Nunca asignes el rol desde `user_metadata` ni desde el navegador.

### Datos comerciales

El catálogo inicia vacío intencionalmente: no se publican las tarifas ni servicios de demostración que venían en el archivo fuente. Inicia sesión como administradora y crea los servicios y precios reales desde el panel. Los testimonios ficticios también fueron retirados. La galería que queda está rotulada como inspiración visual, no como evidencia de trabajos realizados por el salón.

## 4. Configurar WhatsApp

Reemplaza `57XXXXXXXXXX` en `VITE_WHATSAPP_NUMBER` por el número real, con indicativo de país y solo dígitos. Si no se configura, la interfaz no inventa un número comercial.

## 5. Desplegar en Vercel

1. Sube esta carpeta a un repositorio privado o público de GitHub.
2. En Vercel, importa el repositorio.
3. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
4. En Project Settings → Environment Variables, agrega `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` y `VITE_WHATSAPP_NUMBER`.
5. Despliega y prueba la URL que Vercel entregue.

`vercel.json` contiene la reescritura para el enrutamiento SPA. El título, descripción, Open Graph y favicon están configurados.

## Estado y limitaciones antes de publicación

- La estructura del frontend, estilos, componentes originales, simulador, galería, preguntas frecuentes, carrito, panel y formularios están integrados.
- El catálogo, altas/ediciones/activación de servicios, creación de reservas, consulta de horarios ocupados y acceso administrativo usan Supabase cuando se configura.
- La base de datos impide dos reservas para la misma fecha y hora mediante una restricción única. La solicitud queda en estado `Pendiente`; la confirmación final la realiza la administración.
- La lista pública de horarios ocupados se consulta mediante una función SQL que devuelve solo las horas, no datos personales. La restricción única en la base es la protección definitiva contra carreras de reserva.
- No se ha realizado despliegue: no se proporcionaron credenciales ni acceso a las cuentas de Supabase, GitHub o Vercel.
- No se pudo ejecutar `npm install` en el entorno de trabajo por falta de respuesta del registro de paquetes; por tanto, el build de producción no está verificado aquí. Ejecuta `npm install` y `npm run build` en un equipo con conexión a internet antes de publicar.
- Antes de anunciar la web, revisa y aprueba el texto institucional, imágenes, servicios, precios, horarios, políticas de cancelación y el número de WhatsApp. El archivo original contiene afirmaciones comerciales y fotografías de referencia que requieren validación de Vitalia.

## Actualización: catálogo y panel sin Supabase
- El catálogo de 28 servicios está en `src/data/catalog.ts` (precios de demostración editables).
- Sin Supabase, la web y el panel funcionan en **modo demostración local** (datos solo en el navegador).
- Con Supabase, el panel exige login real; si la tabla `services` está vacía aparece el botón **Cargar catálogo inicial (28)**.
