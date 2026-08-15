# Contributing

¡Gracias por querer colaborar con SIM! Este documento te guía sobre cómo contribuir al repositorio.

## Flujo de trabajo

1. Crea una rama desde `main` con un nombre descriptivo (`fix/xyz`, `feat/xyz`).
2. Realiza tus cambios siguiendo el estilo del código existente.
3. Antes de abrir un Pull Request a `main`, ejecuta los checks del proyecto:

   ```bash
   npm run typecheck
   npm test
   npm run build
   ```

4. Abre el Pull Request describiendo qué cambia y por qué, y qué pruebas hiciste.

## Convenciones

- No se agregan comentarios al código salvo que el propio cambio los requiera.
- Los strings visibles al usuario van en el diccionario de `src/contexts/LanguageContext.jsx`, siempre en los **tres idiomas** (es/en/qu). Si añades una clave nueva, añádela en los tres.
- Las nuevas utilidades deben ir acompañadas de tests en `src/utils/*.test.js`.
- Los secretos (API keys) **nunca** van en el frontend ni con prefijo `VITE_`. Van solo en el backend/proxy.
- No rompas el soporte offline (PWA): revisa `vite.config.js` si tocas el service worker.

## Estructura

El proyecto tiene TypeScript incremental (`allowJs`). Al migrar un módulo a `.tsx`, mantenlo coherente con `tsconfig.json`.