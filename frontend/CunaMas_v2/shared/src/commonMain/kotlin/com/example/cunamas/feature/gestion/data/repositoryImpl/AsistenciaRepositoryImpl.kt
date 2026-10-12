package com.example.cunamas.feature.gestion.data.repositoryImpl

import com.example.cunamas.feature.gestion.data.dto.response.AsistenciaResponseDto
import com.example.cunamas.feature.gestion.domain.model.Asistencia
import com.example.cunamas.feature.gestion.domain.model.RegistroCategoria
import com.example.cunamas.feature.gestion.domain.repository.AsistenciaRepository
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.get
import io.ktor.client.request.parameter
class AsistenciaRepositoryImpl(
    private val client: HttpClient
) : AsistenciaRepository {

    override suspend fun getAsistencia(idModulo: Int, fecha: String, correlativo: Int?): Asistencia {
        // 1. Petición corregida apuntando directo a "asistencia-ciai" y usando parámetros
        val dto = client.get("asistencia-ciai") {
            parameter("idModulo", idModulo)
            parameter("fecha", fecha)
            if (correlativo != null) {
                parameter("correlativo", correlativo)
            }
        }.body<AsistenciaResponseDto>()

        // 2. Mapeo de tu DTO al modelo de dominio
        return Asistencia(
            fecha = dto.fecha,
            idModulo = dto.idModulo,
            registroManana = dto.registroManana?.map {
                RegistroCategoria(
                    id = it.idCategoriaGrupo,
                    categoria = it.categoria,
                    cantidad = it.cantidad
                )
            } ?: emptyList(),
            registroTarde = dto.registroTarde?.map {
                RegistroCategoria(
                    id = it.idCategoriaGrupo,
                    categoria = it.categoria,
                    cantidad = it.cantidad
                )
            } ?: emptyList()
        )
    }
}