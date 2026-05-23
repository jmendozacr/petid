# Google OAuth — Pasos Manuales Pendientes

Antes de que el login con Google funcione de punta a punta, hay dos pasos manuales que completar.

## 1. Google Cloud Console

1. Ir a [console.cloud.google.com](https://console.cloud.google.com)
2. Crear un proyecto (o usar uno existente)
3. Ir a **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
4. Tipo de aplicación: **Web application**
5. En **Authorized redirect URIs**, agregar:
   - `https://<tu-ref>.supabase.co/auth/v1/callback`
6. Guardar → copiar el **Client ID** y **Client Secret**

## 2. Supabase Dashboard

1. Ir a [supabase.com/dashboard](https://supabase.com/dashboard) → proyecto **Pet ID**
2. **Authentication → Providers → Google**
3. Habilitar el provider
4. Pegar el **Client ID** y **Client Secret** obtenidos en el paso anterior
5. Guardar

## 3. Vercel — Authorized Redirect URIs

Agregar también en Google Cloud Console:
- `https://petid.app/auth/callback` (producción)
- `http://localhost:3000/auth/callback` (desarrollo local)

## Estado

- [ ] Google Cloud Console — OAuth credentials creadas
- [ ] Supabase Dashboard — provider Google habilitado
- [ ] URLs de callback registradas (prod + local)
