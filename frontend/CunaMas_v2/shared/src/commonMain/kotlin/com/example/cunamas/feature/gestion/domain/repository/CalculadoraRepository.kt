package com.example.cunamas.feature.gestion.domain.repository

import com.example.cunamas.feature.gestion.domain.model.RangoPreparacion
import com.example.cunamas.feature.gestion.domain.model.ResultadoCalculo
import com.example.cunamas.feature.gestion.domain.model.ResumenServicio

interface CalculadoraRepository {
    suspend fun getRangos(idPreparacion: Int): List<RangoPreparacion>
    suspend fun getResumenServicio(idServicioAlimentario: Int, fecha: String, correlativo: Int): ResumenServicio
    suspend fun calcular(idPreparacion: Int, categorias: List<Pair<Int, Int>>): ResultadoCalculo
}