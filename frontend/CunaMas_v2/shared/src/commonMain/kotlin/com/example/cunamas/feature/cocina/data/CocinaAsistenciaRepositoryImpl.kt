package com.example.cunamas.feature.cocina.data

import com.example.cunamas.feature.cocina.domain.model.*
import com.example.cunamas.feature.cocina.domain.repository.CocinaAsistenciaRepository
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.get
import io.ktor.client.request.parameter

class CocinaAsistenciaRepositoryImpl(
    private val client: HttpClient
) : CocinaAsistenciaRepository {

    override suspend fun getResumenAsistencia(
        idServicioAlimentario: Int,
        fecha: String,
        correlativo: Int
    ): ResumenCocinaAsistencia {
        val dto = client.get("calculadora/resumen-servicio/$idServicioAlimentario") {
            parameter("fecha", fecha)
            parameter("correlativo", correlativo)
        }.body<ResumenServicioResponseDto>()

        return ResumenCocinaAsistencia(
            idServicioAlimentario = dto.idServicioAlimentario,
            servicioAlimentario = dto.servicioAlimentario,
            locales = dto.locales.map { localDto ->
                CocinaLocal(
                    idLocal = localDto.idLocal,
                    nombreLocal = localDto.nombreLocal,
                    modulos = localDto.modulos.map { moduloDto ->
                        CocinaModulo(
                            idModulo = moduloDto.idModulo,
                            nombreModulo = moduloDto.nombreModulo,
                            asistencia = moduloDto.asistencia.map { itemDto ->
                                CocinaItemAsistencia(
                                    idCategoriaGrupo = itemDto.idCategoriaGrupo,
                                    categoria = itemDto.categoria,
                                    cantidad = itemDto.cantidad
                                )
                            }
                        )
                    }
                )
            }
        )
    }
}
