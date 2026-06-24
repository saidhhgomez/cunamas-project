package com.cunamas.repository;

import com.cunamas.dto.AsistenciaCategoriaDTO;
import com.cunamas.entity.RegistroAsistenciaCIAIEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface RegistroAsistenciaCIAIRepository
        extends JpaRepository<RegistroAsistenciaCIAIEntity, Integer> {

    boolean existsByFechaAndModulo_IdModuloAndCategoria_IdCategoriaGrupoAndRegistroCorrelativo(
            LocalDate fecha,
            Integer idModulo,
            Integer idCategoriaNino,
            Integer registroCorrelativo
    );

    @Query("""
    SELECT new com.cunamas.dto.AsistenciaCategoriaDTO(
    
        c.idCategoriaGrupo,
    
        c.nombreCategoria,
    
        r.cantidad
    
    )
    
    FROM RegistroAsistenciaCIAIEntity r
    
    JOIN r.categoria c
    
    WHERE r.modulo.idModulo = :idModulo
    AND r.fecha = :fecha
    AND r.registroCorrelativo = :correlativo
    
    ORDER BY c.idCategoriaGrupo
    """)
    List<AsistenciaCategoriaDTO> obtenerAsistencia(
            Integer idModulo,
            LocalDate fecha,
            Integer correlativo
    );
}