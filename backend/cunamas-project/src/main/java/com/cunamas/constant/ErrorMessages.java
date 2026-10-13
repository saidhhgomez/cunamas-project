package com.cunamas.constant;

public final class ErrorMessages {

    private ErrorMessages() {
    }

    // Autenticación y Autorización
    public static final String INVALID_CREDENTIALS =
            "Credenciales inválidas.";

    public static final String INVALID_LOGIN =
            "Su cuenta aún no ha sido aprobada.";

    public static final String ACCESS_DENIED =
            "No tiene permisos para realizar esta operación.";

    public static final String ACCOUNT_INACTIVE =
            "La cuenta se encuentra inactiva.";

    // Validaciones de formato y parámetros (Bad Request)
    public static final String INVALID_REQUEST =
            "La solicitud contiene datos inválidos.";

    public static final String INVALID_REQUEST_BODY =
            "El cuerpo de la solicitud es inválido o está incompleto.";

    public static final String INVALID_DNI_FORMAT =
            "El DNI debe contener exactamente 8 dígitos.";

    public static final String INVALID_CE_FORMAT =
            "El Carnet de Extranjería debe contener 9 caracteres alfanuméricos.";

    public static final String INVALID_EMAIL_FORMAT =
            "El correo electrónico no tiene un formato válido.";

    public static final String INVALID_PASSWORD_FORMAT =
            "La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial.";

    public static final String INVALID_DOCUMENT_TYPE =
            "Tipo de documento no válido.";

    public static final String INVALID_ROLE =
            "Existe un rol inválido.";

    // Recursos no encontrados (Not Found)
    public static final String RESOURCE_NOT_FOUND =
            "El recurso solicitado no existe.";

    public static final String GENDER_NOT_FOUND =
            "El género no existe.";

    public static final String DOCUMENT_TYPE_NOT_FOUND =
            "El tipo de documento no existe.";

    public static final String REQUEST_NOT_FOUND =
            "Solicitud no encontrada.";

    public static final String ROLE_NOT_FOUND =
            "Rol inexistente.";

    public static final String ACCOUNT_NOT_FOUND =
            "La cuenta no existe.";

    // Conflictos de datos (Conflict)
    public static final String DATA_CONFLICT =
            "La operación entra en conflicto con los datos existentes.";

    public static final String DOCUMENT_ALREADY_EXISTS =
            "El número de documento ya se encuentra registrado.";

    public static final String EMAIL_ALREADY_EXISTS =
            "El correo electrónico ya se encuentra registrado.";

    public static final String ACCOUNT_ALREADY_APPROVED =
            "La cuenta ya fue aprobada.";

    public static final String ROLES_ALREADY_ASSIGNED =
            "La persona ya posee roles asignados.";

    // Errores generales
    public static final String INTERNAL_SERVER_ERROR =
            "Ocurrió un error interno. Inténtalo más tarde.";

    public static final String CATEGORY_NOT_FOUND =
            "La categoría de alimento solicitada no existe.";

    public static final String PREPARATION_NOT_FOUND =
            "El tipo de preparación solicitado no existe.";

    public static final String CATEGORY_DOSIFICATION_NOT_FOUND =
            "No se encontraron categorías de dosificación registradas.";

    // Centro de Atención Infantil y Módulos
    public static final String LOCAL_NAME_REQUIRED =
            "El nombre del local es obligatorio.";

    public static final String CIAI_ALREADY_EXISTS =
            "Ya existe un centro con ese nombre.";

    public static final String ADDRESS_NOT_FOUND =
            "Dirección no encontrada.";

    public static final String FOOD_SERVICE_NOT_FOUND =
            "Servicio alimentario no encontrado.";

    public static final String MODULES_REQUIRED =
            "Debe enviar al menos un módulo.";

    public static final String EMPTY_MODULE_NAME =
            "Existe un módulo vacío.";

    // Direcciones y Ubicación
    public static final String EMPTY_ADDRESS_NAME =
            "El nombre de la dirección es obligatorio.";

    public static final String DUPLICATE_ADDRESS =
            "La dirección ya se encuentra registrada.";

    public static final String DISTRICT_NOT_FOUND =
            "El distrito no existe.";

    public static final String PERSON_NOT_FOUND =
            "La persona no existe.";

    public static final String SEARCH_TERM_REQUIRED =
            "El término de búsqueda es obligatorio.";

    // Inteligencia Artificial (IA)
    public static final String FOOD_LIST_REQUIRED =
            "Debe proporcionar al menos un alimento para realizar el análisis.";

    public static final String INVALID_FOOD_DATA =
            "La información de los alimentos enviada está incompleta o es inválida.";

    public static final String IA_PROCESSING_ERROR =
            "Ocurrió un error al procesar el análisis nutricional con la IA.";

    // Módulos
    public static final String MODULE_NAME_REQUIRED =
            "El nombre del módulo no puede estar vacío.";

    public static final String CIAI_NOT_FOUND =
            "Centro de atención infantil no encontrado.";

    public static final String INVALID_LOCAL_ID =
            "El identificador del centro de atención infantil es inválido.";

    // Refresh Tokens y Sesiones
    public static final String REFRESH_TOKEN_NOT_FOUND =
            "Refresh Token no encontrado.";

    public static final String REFRESH_TOKEN_INVALID =
            "Refresh Token inválido.";

    public static final String SESSION_DISABLED =
            "La sesión se encuentra deshabilitada.";

    public static final String REFRESH_TOKEN_EXPIRED =
            "El Refresh Token ha expirado.";

    // Registro de Asistencia CIAI
    public static final String INVALID_CORRELATIVO =
            "El registro correlativo solo puede ser 1 o 2.";

    public static final String CATEGORIES_REQUIRED =
            "Debe enviar al menos una categoría.";

    public static final String MODULE_NOT_FOUND =
            "Módulo no encontrado.";

    public static final String CATEGORY_NOT_FOUND_ID =
            "Categoría no encontrada: %d";

    public static final String ATTENDANCE_ALREADY_EXISTS_FORMAT =
            "Ya existe asistencia para la categoría %s en el correlativo %d del día de hoy.";

    public static final String QUANTITY_CANNOT_BE_NEGATIVE =
            "La cantidad no puede ser negativa.";

    public static final String INVALID_MODULE_ID =
            "El identificador del módulo es inválido.";

    public static final String DATE_REQUIRED =
            "La fecha es obligatoria.";

    // Servicio Alimentario
    public static final String FOOD_SERVICE_NAME_REQUIRED =
            "El nombre del centro es obligatorio.";

    public static final String FOOD_SERVICE_ALREADY_EXISTS =
            "Ya existe un servicio alimentario con ese nombre.";

    // Autenticación de Endpoints y Seguridad JWT
    public static final String MISSING_TOKEN =
            "Se requiere un token de autenticación válido para acceder a este recurso.";

    public static final String UNAUTHENTICATED_USER =
            "Usuario no autenticado.";

    public static final String ACCESS_DENIED_RESOURCE =
            "No tiene los permisos necesarios para acceder a este recurso.";

    public static final String UBIGEO_NOT_FOUND =
            "No existe un distrito para el ubigeo enviado.";

    // Generación de Reportes PDF
    public static final String REPORT_DATA_REQUIRED =
            "No hay información disponible para generar el reporte PDF.";

    public static final String PDF_GENERATION_ERROR =
            "Ocurrió un error al generar el archivo PDF del reporte.";
}