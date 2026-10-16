# HistoriaYa: puesta en marcha (cobro automático con Mercado Pago)

1. SUPABASE: crear proyecto. SQL Editor > pegar supabase.sql > Run.
   Settings > API: copiar Project URL, clave anon y clave service_role (secreta).
2. En index.html reemplazar SB_URL, SB_KEY y PRECIO (texto que ve el médico). MODO_PAGO ya está en 'mp'.
3. MERCADO PAGO (mercadopago.com.ar/developers): crear aplicación Checkout Pro y copiar el Access Token
   (de prueba al principio, de producción después).
4. NETLIFY: subir la carpeta a GitHub y conectarla (Import an existing project).
   Site configuration > Environment variables:
   SUPABASE_URL, SUPABASE_SERVICE_KEY, MP_ACCESS_TOKEN, SITE_URL (https://tu-sitio, sin barra final),
   PRECIO (número, ej. 15000), DIAS_ACCESO (vacío = de por vida; 365 = un año). Volver a desplegar.
5. Supabase > Authentication > URL Configuration: poner la dirección de Netlify en Site URL.
   Authentication > SMTP: configurar un correo propio.
6. Probar con usuarios y credenciales de prueba de Mercado Pago antes de pasar a producción.

## Cuenta libre (para que alguien pruebe y recomiende la app)
1. La persona crea su cuenta normalmente en la app (con su nombre y matrícula).
2. Supabase > Table Editor > profiles > buscar su fila y editar:
   - subscription_status = active
   - current_period_end = vacío (libre sin vencimiento) o una fecha (prueba de, por ejemplo, 14 días)
3. Para quitarle el acceso: subscription_status = inactive.
Esta cuenta no pasa por Mercado Pago, así que los pagos automáticos no la afectan.
