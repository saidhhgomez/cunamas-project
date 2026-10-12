# Fix Koin InstanceCreationException for UsuariosPendientesViewModel

The application is crashing when trying to create `UsuariosPendientesViewModel` because its dependency `GetUsuariosPendientesUseCase` is not registered in the Koin `gestionModule`.

Upon investigation, it appears that **none** of the UseCases in the `feature/gestion` module are registered in Koin, which will cause similar crashes in other ViewModels (like `CalculadoraDosificadoraViewModel`, `DetalleUsuarioViewModel`, etc.).

## User Review Required

> [!IMPORTANT]
> This change will register all 18 UseCases found in the `feature/gestion` module. While this is necessary for the app to function, please ensure that no other module was intended to hold these registrations.

## Proposed Changes

### [feature/gestion]

#### [MODIFY] [gestionModule.kt](file:///C:/cunamas-project/frontend/CunaMas_v2/shared/src/commonMain/kotlin/com/example/cunamas/feature/gestion/di/gestionModule.kt)

- Add imports for all UseCases.
- Add a new section `// 3. UseCases` to register all UseCases using `factory { UseCase(get()) }`.
- Ensure all ViewModels in the `// 4. ViewModels` section (previously 3) correctly use `get()` to resolve their UseCase dependencies.

## Verification Plan

### Automated Tests
- I will attempt to build the project to ensure no syntax errors were introduced.
- *Note: Since I cannot run the app to verify the fix, manual verification is required.*

### Manual Verification
- Deploy the app and navigate to the "Usuarios Pendientes" screen.
- Verify that the `UsuariosPendientesViewModel` is created successfully and the screen loads without crashing.
- Verify other screens that use ViewModels with UseCases (e.g., Calculadora, Detalle Usuario).
