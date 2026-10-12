# Corregir errores en AdministradorNavGraph.kt

Se han identificado tres errores principales en `AdministradorNavGraph.kt`:
1.  **Falta de `viewModel` en `UsuariosPendientesScreen`**: La pantalla requiere un `UsuariosPendientesViewModel` que no se está pasando.
2.  **Referencias no resueltas a `getInt` y `getString`**: En Compose Multiplatform, el acceso a los argumentos del `NavBackStackEntry` puede requerir importaciones específicas o el uso de métodos compatibles con el `Bundle` multiplataforma.

## Cambios Propuestos

### [Componente: Gestión de Navegación]

#### [MODIFICAR] [AdministradorNavGraph.kt](file:///C:/cunamas-project/frontend/CunaMas_v2/shared/src/commonMain/kotlin/com/example/cunamas/feature/gestion/navigation/AdministradorNavGraph.kt)
- Importar `UsuariosPendientesViewModel`.
- Importar las funciones de extensión `getInt` y `getString` de `androidx.core.bundle` (o usar una alternativa compatible).
- Instanciar el `viewModel` para `UsuariosPendientesScreen` usando `koinViewModel()`.
- Corregir las llamadas a `getInt` para que incluyan un valor por defecto si es necesario, o usar `get(key) as? Type`.

## Plan de Verificación

### Pruebas Automatizadas
- Ejecutar `analyze_file` nuevamente para asegurar que los errores de compilación hayan desaparecido.

### Verificación Manual
- Solicitar al usuario que verifique la navegación en la aplicación.
