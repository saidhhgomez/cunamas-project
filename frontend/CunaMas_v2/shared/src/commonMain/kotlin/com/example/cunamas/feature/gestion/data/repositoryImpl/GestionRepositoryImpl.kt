package com.example.cunamas.feature.gestion.data.repositoryImpl

import com.example.cunamas.feature.gestion.data.dto.request.AprobarUsuarioRequestDto
import com.example.cunamas.feature.gestion.data.dto.request.CrearUsuarioRequestDto
import com.example.cunamas.feature.gestion.data.dto.request.CuentaCrearDto
import com.example.cunamas.feature.gestion.data.dto.request.PersonaCrearDto
import com.example.cunamas.feature.gestion.data.remote.GestionApi
import com.example.cunamas.feature.gestion.domain.model.DetalleUsuario
import com.example.cunamas.feature.gestion.domain.model.CredencialCreada
import com.example.cunamas.feature.gestion.domain.model.UsuarioPendiente
import com.example.cunamas.feature.gestion.domain.repository.GestionRepository
import io.ktor.client.plugins.ClientRequestException
import io.ktor.client.statement.bodyAsText
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

class GestionRepositoryImpl(
    private val apiService: GestionApi // 👈 Recibe el servicio Ktor sin @Inject
) : GestionRepository {

    override suspend fun getUsuariosPendientes(): Result<List<UsuarioPendiente>> {
        return try {
            val dtos = apiService.getUsuariosPendientes()
            Result.success(dtos.map {
                UsuarioPendiente(
                    idPersona = it.idPersona,
                    numeroDocumento = it.numeroDocumento,
                    nombresCompletos = it.nombresCompletos,
                    correoElectronico = it.correoElectronico,
                    fechaRegistro = it.fechaRegistro,
                    estadoCuenta = it.estadoCuenta
                )
            })
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun getUsuarioDetalle(id: Int): Result<DetalleUsuario> {
        return try {
            val dto = apiService.getUsuarioDetalle(id)
            Result.success(
                DetalleUsuario(
                    idPersona = dto.idPersona,
                    nombreCompleto = "${dto.nombres} ${dto.apPaterno} ${dto.apMaterno}",
                    numeroDocumento = dto.numeroDocumento,
                    tipoDocumento = dto.tipoDocumento,
                    correoElectronico = dto.correoElectronico,
                    telefono = dto.telefono,
                    genero = dto.genero,
                    direccion = dto.direccion,
                    distrito = dto.distrito,
                    fechaRegistro = dto.fechaRegistro
                )
            )
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun aprobarUsuario(idPersona: Int, rolesIds: List<Int>): Result<String> {
        return try {
            val response = apiService.aprobarUsuario(AprobarUsuarioRequestDto(idPersona, rolesIds))
            val mensaje = response["mensaje"] ?: response.values.firstOrNull() ?: "Usuario aprobado correctamente"
            Result.success(mensaje)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun crearUsuario(
        idDocumento: Int,
        numeroDocumento: String,
        nombres: String,
        apPaterno: String,
        apMaterno: String,
        idGenero: Int,
        correoElectronico: String,
        rolesIds: List<Int>
    ): Result<CredencialCreada> {
        return try {
            val request = CrearUsuarioRequestDto(
                persona = PersonaCrearDto(
                    idDocumento,
                    numeroDocumento,
                    nombres,
                    apPaterno,
                    apMaterno,
                    idGenero
                ),
                cuenta = CuentaCrearDto(correoElectronico),
                roles = rolesIds
            )
            val response = apiService.crearUsuario(request)
            Result.success(
                CredencialCreada(
                    mensaje = response.mensaje,
                    idPersona = response.idPersona,
                    passwordTemporal = response.passwordTemporal
                )
            )
        } catch (e: ClientRequestException) {
            // Manejo de errores HTTP 4xx en Ktor de forma multiplataforma
            val errorBody = try {
                e.response.bodyAsText()
            } catch (ex: Exception) { null }

            val mensajeFinal = errorBody?.let {
                try {
                    val jsonElement = Json.parseToJsonElement(it)
                    jsonElement.jsonObject["mensaje"]?.jsonPrimitive?.content
                } catch (ex: Exception) { null }
            } ?: "No se pudo crear el usuario. Intenta nuevamente."

            Result.failure(Exception(mensajeFinal))
        } catch (e: io.ktor.utils.io.errors.IOException) { // 👈 O simplemente puedes omitir este catch específico si ya atrapas el general
            Result.failure(Exception("Sin conexión. Verifica tu internet e intenta de nuevo."))
        } catch (e: Exception) {
            Result.failure(Exception("Ocurrió un error inesperado. Intenta nuevamente."))
        }
    }
}