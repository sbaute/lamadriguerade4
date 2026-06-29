# Despliegue en GitHub Pages 🚀

Este proyecto está configurado para desplegarse automáticamente en **GitHub Pages** mediante **GitHub Actions**.

* **URL del sitio web:** [https://sbaute.github.io/lamadriguerade4/](https://sbaute.github.io/lamadriguerade4/)
* **Rama de desarrollo:** `develop`
* **Rama de producción (despliegue):** `main`

---

## 📋 Flujo de Trabajo Recomendado

Para realizar cambios y publicarlos de manera segura, seguí estos pasos:

### 1. Trabajar en la rama de desarrollo
Todo el código nuevo, correcciones y pruebas deben realizarse en la rama `develop`.

```bash
# Asegurate de estar en develop
git checkout develop

# Realizá tus cambios, agregalos y hacé commits
git add .
git commit -m "feat: descripción de tu cambio"

# Subí tus cambios a GitHub (esto NO publica nada en producción)
git push origin develop
```

### 2. Probar y verificar
Una vez que subas a `develop` y valides que todo funciona correctamente de forma local, es momento de lanzar a producción.

### 3. Fusionar a `main` y publicar (Despliegue automático)
Cuando hagas push a la rama `main`, GitHub Actions interceptará el evento, compilará tu aplicación y la desplegará en GitHub Pages automáticamente.

```bash
# 1. Cambiá a la rama main
git checkout main

# 2. Traé los últimos cambios de develop a main
git merge develop

# 3. Subí los cambios a GitHub (Esto activa el despliegue automático 🚀)
git push origin main

# 4. Regresá a develop para seguir trabajando en el día a día
git checkout develop
```

---

## 🛠️ Detalles de la Configuración del Workflow

El despliegue está controlado por el archivo de configuración del workflow en [.github/workflows/deploy.yml](file:///c:/Users/sofi/Desktop/la_madriuera_de_4/.github/workflows/deploy.yml).

Este archivo automatiza lo siguiente en los servidores de GitHub cada vez que se detecta un push en `main`:
1. **Descarga el código** y configura Node.js v20.
2. **Instala las dependencias** limpias del proyecto (`npm ci`).
3. **Compila la aplicación Angular** con configuración de producción y el base-href correcto (`/lamadriguerade4/`).
4. **Resuelve el problema de rutas SPA**: Copia el archivo `index.html` como `404.html` en el build final. De esta forma, si un usuario refresca páginas como `/login` o `/admin` directamente en el navegador, GitHub Pages no devolverá error 404, sino que servirá el enrutador de la aplicación.
5. **Sube y publica** el build final de la carpeta `dist/la-madriguera/browser` en los servidores de GitHub Pages.

---

## 🔍 Monitoreo del Despliegue
Podés seguir el proceso de compilación y publicación en tiempo real desde la sección **Actions** de tu repositorio en GitHub:
👉 [Ver ejecuciones de GitHub Actions](https://github.com/sbaute/lamadriguerade4/actions)
