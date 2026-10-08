# Deploy del frontend: S3 + CloudFront (RNF03)

La SPA es un build estático (`dist/`) servido desde un bucket S3 detrás de CloudFront, con el dominio
`app.tiburonshark.me`. Hace falta AWS CLI con credenciales de la cuenta donde están el bucket y la
distribución (hoy, la de Esteban). Los nombres se obtienen con:

```bash
aws s3 ls                                   # el bucket del front
aws cloudfront list-distributions --query "DistributionList.Items[].[Id,Aliases.Items[0]]" --output table
```

## 1. Build con las variables de producción

Vite mete las `VITE_*` **dentro del bundle al construir**: un `.env` local o vacío produce una app
que no funciona en producción.

```bash
git pull origin main
npm ci
```
`.env` de producción (son los valores públicos que ya van en el bundle desplegado):
```
VITE_AUTH0_DOMAIN=<tenant>.us.auth0.com
VITE_AUTH0_CLIENT_ID=<client id de la SPA>
VITE_AUTH0_AUDIENCE=https://api.energyshark.internal
VITE_API_BASE_URL=https://api.tiburonshark.me
```
⚠️ `VITE_API_BASE_URL` **no puede quedar vacío**: vacío solo sirve en local (proxy de Vite).

```bash
npm run build
```

## 2. Revisar el build antes de subirlo

```bash
grep -l "https://api.tiburonshark.me" dist/assets/*.js && echo "API OK" || echo "FALTA VITE_API_BASE_URL"
grep -l "api.energyshark.internal" dist/assets/*.js && echo "Auth0 OK" || echo "FALTAN VITE_AUTH0_*"
```
El nombre del bundle (`dist/assets/index-<hash>.js`) cambia cuando cambia el código. Si sale igual que
el desplegado, el `git pull` no trajo nada nuevo.

## 3. Subir a S3

```bash
aws s3 sync dist/ s3://<bucket> --delete
# index.html sin caché: así CloudFront siempre pide la versión vigente (los assets llevan hash).
aws s3 cp dist/index.html s3://<bucket>/index.html --cache-control "no-cache"
```

## 4. Invalidar CloudFront (obligatorio)

Sin esto, CloudFront sigue sirviendo el `index.html` anterior, que apunta al bundle anterior, aunque
el S3 ya tenga el nuevo.
```bash
aws cloudfront create-invalidation --distribution-id <id> --paths "/*"
aws cloudfront get-invalidation --distribution-id <id> --id <id-de-la-invalidación>   # hasta "Completed"
```

## 5. Verificar en producción

1. En incógnito, abrir `https://app.tiburonshark.me` e iniciar sesión.
2. **Historial de ciclos** carga datos.
3. **F5:** sigue con la sesión iniciada.
4. En DevTools → *Network*, el `/assets/index-<hash>.js` es el del build nuevo.

## Requisitos en Auth0 (una vez; ya están configurados)

- En la app SPA: `https://app.tiburonshark.me` en *Allowed Callback URLs*, *Allowed Logout URLs* y
  *Allowed Web Origins* (y `http://localhost:5173` para desarrollo).
- En la SPA: *Refresh Token Rotation*. En la API: *Allow Offline Access* y *Allow Skipping User Consent*.
- En el API Gateway: `https://app.tiburonshark.me` en los orígenes permitidos de CORS.
