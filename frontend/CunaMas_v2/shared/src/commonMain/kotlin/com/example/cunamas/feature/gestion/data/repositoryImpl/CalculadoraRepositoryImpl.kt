package com.example.cunamas.feature.gestion.data.repositoryImpl


import com.example.cunamas.core.common.dto.request.CalcularRequestDto
import com.example.cunamas.core.common.dto.request.CategoriaCantidadDto
import com.example.cunamas.feature.gestion.data.remote.CalculadoraApi
import com.example.cunamas.feature.gestion.domain.model.RangoPreparacion
import com.example.cunamas.feature.gestion.domain.model.ResultadoCalculo
import com.example.cunamas.feature.gestion.domain.model.ResumenServicio
import com.example.cunamas.feature.gestion.domain.model.TotalCategoria
import com.example.cunamas.feature.gestion.domain.repository.CalculadoraRepository

class CalculadoraRepositoryImpl(
    private val apiService: CalculadoraApi // 👈 Recibe el cliente Ktor en lugar de la interfaz de Retrofit
) : CalculadoraRepository {

    override suspend fun getRangos(idPreparacion: Int): List<RangoPreparacion> {
        return apiService.getRangos(idPreparacion).map {
            RangoPreparacion(
                idCatNino = it.idCatNino,
                rangoEdad = it.rangoEdad,
                gramosOMl = it.gramosOMl
            )
        }
    }

    override suspend fun getResumenServicio(
        idServicioAlimentario: Int,
        fecha: String,
        correlativo: Int
    ): ResumenServicio {
        val dto = apiService.getResumenServicio(idServicioAlimentario, fecha, correlativo)
        return ResumenServicio(
            servicioAlimentario = dto.servicioAlimentario,
            totales = dto.totales?.map {
                TotalCategoria(
                    id = it.idCategoriaGrupo,
                    categoria = it.categoria,
                    cantidad = it.cantidad
                )
            } ?: emptyList() // Si viene null, devuelve lista vacía de forma segura
        )
    }

    override suspend fun calcular(idPreparacion: Int, categorias: List<Pair<Int, Int>>): ResultadoCalculo {
        val body = CalcularRequestDto(
            categorias = categorias.map { (id, cantidad) -> CategoriaCantidadDto(id, cantidad) }
        )
        val dto = apiService.calcular(idPreparacion, body)
        return ResultadoCalculo(
            alimento = dto.alimento,
            empaquesSugeridos = dto.empaquesSugeridos,
            totalGramosOMl = dto.totalGramosO_Ml,
            unidad = dto.unidad
        )
    }
}