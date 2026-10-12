package com.example.cunamas.feature.gestion.data.remote

import com.example.cunamas.feature.gestion.data.dto.request.AprobarUsuarioRequestDto
import com.example.cunamas.feature.gestion.data.dto.request.CrearUsuarioRequestDto
import com.example.cunamas.feature.gestion.data.dto.response.CrearUsuarioResponseDto
import com.example.cunamas.feature.gestion.data.dto.response.DetalleUsuarioDto
import com.example.cunamas.feature.gestion.data.dto.response.UsuarioPendienteDto
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.get
import io.ktor.client.request.post
import io.ktor.client.request.put
import io.ktor.client.request.setBody

class GestionApi(
    private val client: HttpClient
) {

    // Equivalente a @GET para listar usuarios pendientes
    suspend fun getUsuariosPendientes(): List<UsuarioPendienteDto> {
        return client.get("admin/usuarios/pendientes").body()
    }

    // Equivalente a @GET con @Path para el detalle de un usuario
    suspend fun getUsuarioDetalle(id: Int): DetalleUsuarioDto {
        return client.get("admin/usuarios/pendientes/$id").body()
    }

    // Equivalente a @PUT para aprobar un usuario (recibe un request y devuelve un Map)
    suspend fun aprobarUsuario(request: AprobarUsuarioRequestDto): Map<String, String> {
        return client.put("admin/usuarios/aprobar") {
            setBody(request)
        }.body()
    }

    // Equivalente a @POST para crear un nuevo usuario
    suspend fun crearUsuario(request: CrearUsuarioRequestDto): CrearUsuarioResponseDto {
        return client.post("admin/usuarios") {
            setBody(request)
        }.body()
    }
}