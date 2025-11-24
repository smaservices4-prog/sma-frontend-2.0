# 📚 Design Context Documentation

## ¿Qué es esto?

Esta carpeta contiene la **documentación completa de diseño y arquitectura** para la modernización de SMA Frontend. Son archivos de contexto que debes proporcionar a una IA (Claude, GPT-4, etc.) para que entienda exactamente cómo debe diseñar e implementar la nueva UI.

---

## 📂 Estructura de Archivos

```
design-context/
├── 00-MAIN_PROMPT.md              ⭐ EMPIEZA AQUÍ
├── 01-DESIGN_SYSTEM.md            🎨 Sistema de diseño
├── 02-COMPONENT_LIBRARY.md        🧩 Biblioteca de componentes
├── 03-PAGE_SPECIFICATIONS.md      📄 Especificaciones de páginas
├── 04-USER_FLOWS.md               🔄 Flujos de usuario
├── 05-TECHNICAL_STACK.md          🛠️ Stack técnico
├── 06-API_INTEGRATION.md          🔌 Integración con backend
├── 07-RESPONSIVE_BREAKPOINTS.md   📱 Diseño responsive
└── README.md                      📖 Este archivo
```

---

## 🚀 Cómo Usar Esta Documentación

### Opción 1: Todo de Una (IA con contexto grande)

Si usas Claude 3.5 Sonnet, GPT-4, o similar con contexto grande (100K+ tokens):

```
Prompt:
"Lee todos los archivos en la carpeta design-context/ y luego 
moderniza [ComponentName] siguiendo todas las especificaciones."
```

### Opción 2: Modular (Cualquier IA)

Para IAs con contexto limitado o para iterar más fino:

**Paso 1:** Siempre empieza con el prompt principal
```
Prompt:
"Lee 00-MAIN_PROMPT.md y confírmame que entendiste el objetivo."
```

**Paso 2:** Agrega los archivos relevantes según lo que vayas a hacer

| Tarea | Archivos Necesarios |
|-------|-------------------|
| Cambiar colores/tipografía | 00, 01 |
| Crear/modificar componente | 00, 01, 02 |
| Diseñar página nueva | 00, 01, 02, 03 |
| Implementar flujo de usuario | 00, 04, 05, 06 |
| Hacer responsive | 00, 07 |
| Todo lo anterior | 00-07 (todos) |

**Paso 3:** Da la instrucción específica
```
Prompt:
"Ahora moderniza el componente ReportCard siguiendo las specs."
```

---

## 📖 Guía Rápida de Cada Archivo

### 🌟 00-MAIN_PROMPT.md
**Cuando usar:** SIEMPRE (es el punto de entrada)
**Qué contiene:** 
- Objetivo del proyecto
- Instrucciones generales
- Reglas estrictas
- Checklist de implementación

**Ejemplo de uso:**
```
"Lee 00-MAIN_PROMPT.md y dime qué es lo primero que 
debo modernizar según las prioridades."
```

---

### 🎨 01-DESIGN_SYSTEM.md
**Cuando usar:** Para cualquier cambio visual
**Qué contiene:**
- Paleta de colores completa
- Tipografía (tamaños, weights, line heights)
- Spacing system (8px grid)
- Shadows y elevación
- Border radius
- Transiciones

**Ejemplo de uso:**
```
"Según el Design System (01-DESIGN_SYSTEM.md), 
¿qué color y tamaño debe tener un botón primario?"
```

**Tip:** Este archivo es tu "single source of truth" visual. Todo debe salir de aquí.

---

### 🧩 02-COMPONENT_LIBRARY.md
**Cuando usar:** Al crear o modificar un componente
**Qué contiene:**
- Specs de cada componente (buttons, cards, forms, etc.)
- Estados (hover, active, disabled, loading)
- Dimensiones exactas
- Variantes
- Accesibilidad por componente

**Ejemplo de uso:**
```
"Quiero crear el ReportCard. Muéstrame las specs 
completas de 02-COMPONENT_LIBRARY.md."
```

**Tip:** No inventes componentes desde cero. Usa estas specs como blueprint.

---

### 📄 03-PAGE_SPECIFICATIONS.md
**Cuando usar:** Al diseñar o modificar una página completa
**Qué contiene:**
- Layout de cada página (HomePage, CartPage, LoginPage, etc.)
- Estructura de componentes
- Jerarquía visual
- Estados de página (loading, error, empty)
- Responsive behavior específico

**Ejemplo de uso:**
```
"Dame el layout completo de CartPage según 
03-PAGE_SPECIFICATIONS.md para desktop."
```

**Tip:** Sigue estos layouts al píxel. Están optimizados para UX.

---

### 🔄 04-USER_FLOWS.md
**Cuando usar:** Al implementar interacciones o flujos de usuario
**Qué contiene:**
- Flujos completos (registro, compra, admin upload, etc.)
- Decision points
- Estados intermedios
- Edge cases y error handling
- Feedback esperado

**Ejemplo de uso:**
```
"Muéstrame el flujo completo de compra desde 
04-USER_FLOWS.md y ayúdame a implementarlo."
```

**Tip:** Este archivo te dice CÓMO debe sentirse la app, no solo cómo se ve.

---

### 🛠️ 05-TECHNICAL_STACK.md
**Cuando usar:** Al escribir código o configurar el proyecto
**Qué contiene:**
- Stack completo (React, MUI, TypeScript, etc.)
- State management (Contexts)
- Estructura de archivos
- Naming conventions
- Security best practices
- Build & deployment

**Ejemplo de uso:**
```
"Según 05-TECHNICAL_STACK.md, ¿cómo debo estructurar 
el state management para el carrito?"
```

**Tip:** No uses herramientas fuera de este stack sin aprobación.

---

### 🔌 06-API_INTEGRATION.md
**Cuando usar:** Al conectar con el backend
**Qué contiene:**
- Todos los endpoints documentados
- Request/Response formats
- Error handling
- Authentication flow
- Ejemplos de uso

**Ejemplo de uso:**
```
"Necesito crear una orden de pago. Muéstrame el endpoint 
correcto de 06-API_INTEGRATION.md con un ejemplo."
```

**Tip:** NO inventes endpoints. Usa solo los documentados aquí.

---

### 📱 07-RESPONSIVE_BREAKPOINTS.md
**Cuando usar:** Al hacer responsive cualquier componente
**Qué contiene:**
- Breakpoints (mobile, tablet, desktop)
- Comportamiento por viewport
- Grid system
- Touch targets
- Platform-specific considerations
- Testing guidelines

**Ejemplo de uso:**
```
"¿Cómo debe verse el HomePage en mobile según 
07-RESPONSIVE_BREAKPOINTS.md?"
```

**Tip:** Mobile-first es ley. Empieza con 320px y escala hacia arriba.

---

## 💡 Ejemplos de Prompts Completos

### Ejemplo 1: Modernizar un componente existente
```
Prompt completo:
"Lee estos archivos:
- 00-MAIN_PROMPT.md
- 01-DESIGN_SYSTEM.md
- 02-COMPONENT_LIBRARY.md
- 07-RESPONSIVE_BREAKPOINTS.md

Ahora moderniza el componente ReportCard ubicado en 
src/components/ReportCard.tsx siguiendo todas las 
especificaciones. Asegúrate de:
1. Aplicar colores del Design System
2. Seguir specs de Component Library
3. Ser completamente responsive
4. Mantener la funcionalidad actual"
```

### Ejemplo 2: Crear una página nueva
```
Prompt completo:
"Lee estos archivos en orden:
- 00-MAIN_PROMPT.md (contexto general)
- 01-DESIGN_SYSTEM.md (sistema de diseño)
- 02-COMPONENT_LIBRARY.md (componentes)
- 03-PAGE_SPECIFICATIONS.md (layout)
- 04-USER_FLOWS.md (flujos)
- 05-TECHNICAL_STACK.md (tech stack)

Necesito crear la página de [NombrePágina]. Muéstrame:
1. El layout completo
2. Los componentes necesarios
3. El flujo de usuario
4. El código TypeScript + MUI"
```

### Ejemplo 3: Implementar un flujo completo
```
Prompt completo:
"Lee:
- 00-MAIN_PROMPT.md
- 04-USER_FLOWS.md (Flow 1: Nuevo Usuario - Registro y Primera Compra)
- 06-API_INTEGRATION.md

Ayúdame a implementar el flujo completo de registro y primera compra.
Incluye manejo de errores, loading states, y feedback visual."
```

---

## 🎯 Orden Recomendado de Implementación

### Fase 1: Fundamentos (Semana 1)
1. ✅ Leer toda la documentación
2. ✅ Aplicar Design System globalmente (theme, tokens)
3. ✅ Modernizar TopBar (impacto inmediato)
4. ✅ Modernizar ReportCard (componente clave)

### Fase 2: Páginas Principales (Semana 2)
5. ✅ HomePage (grid + filtros + search)
6. ✅ CartPage (summary + checkout)
7. ✅ Payment Success/Error pages

### Fase 3: Auth & Admin (Semana 3)
8. ✅ LoginPage + SignUpPage
9. ✅ AdminUploadPage
10. ✅ Password reset flow

### Fase 4: Polish & Testing (Semana 4)
11. ✅ Animaciones y transiciones
12. ✅ Empty states & error pages
13. ✅ Responsive testing completo
14. ✅ Accesibilidad audit
15. ✅ Performance optimization

---

## ⚠️ Advertencias Importantes

### ❌ NO HAGAS ESTO:
1. **No uses estos archivos como "sugerencias"** → Son especificaciones estrictas
2. **No mezcles estilos antiguos con nuevos** → Transición completa o nada
3. **No ignores accesibilidad** → WCAG AA es requisito
4. **No skippees mobile** → Mobile-first es mandatorio
5. **No agregues dependencias** sin consultar

### ✅ SÍ HAZ ESTO:
1. **Lee primero, codea después** → Entender antes de ejecutar
2. **Usa la checklist** del MAIN_PROMPT
3. **Pregunta si hay duda** → Mejor preguntar que asumir
4. **Itera componente por componente** → No todo de una
5. **Testea en cada paso** → Especialmente responsive

---

## 🔄 Actualizar Esta Documentación

Si necesitas agregar o modificar specs:

1. Edita el archivo correspondiente
2. Mantén el mismo formato
3. Agrega ejemplos si es necesario
4. Actualiza este README si cambia la estructura
5. Versiona los cambios (Git)

---

## 📞 Soporte

Si tienes preguntas o encuentras inconsistencias:

1. **Revisa primero:** Busca en todos los archivos
2. **Consulta al equipo:** Pregunta antes de cambiar specs
3. **Documenta decisiones:** Si se toma una decisión nueva, actualiza los docs

---

## 🎉 ¡Listo para Empezar!

Tienes todo lo necesario para crear una UI moderna y profesional. 

**Siguiente paso:**
1. Ve al archivo `00-MAIN_PROMPT.md`
2. Léelo completo
3. Elige un componente para empezar
4. ¡A codear! 🚀

---

**Versión:** 2.0  
**Última actualización:** Noviembre 2025  
**Mantenedor:** Equipo SMA

