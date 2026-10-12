package com.example.cunamas.feature.gestion.domain.repository

import com.example.cunamas.core.common.CentroAlimentario
import com.example.cunamas.core.common.PaginaCentros
import com.example.cunamas.feature.gestion.data.dto.response.CrearCentroAlimentarioResponseDto
import com.example.cunamas.feature.gestion.domain.model.Distrito

interface CentrosAlimentariosRepository {
    suspend fun getCentros(distrito: String, page: Int, size: Int): PaginaCentros
    suspend fun getCentroById(id: Int): CentroAlimentario

    suspend fun buscarDistritos(query: String): List<Distrito>
    suspend fun crearDireccion(idDistrito: Int, nombreDireccion: String): Int  // devuelve idGenerado
    suspend fun crearCentroAlimentario(idDireccion: Int, nombreCentro: String, nombreComite: String): CrearCentroAlimentarioResponseDto // devuelve idCentroAlimentario

}