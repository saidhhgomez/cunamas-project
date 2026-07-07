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

    @Query("""
    SELECT new com.cunamas.dto.AsistenciaCategoriaDTO(

        c.idCategoriaGrupo,

        c.nombreCategoria,

        SUM(r.cantidad)

    )

    FROM RegistroAsistenciaCIAIEntity r

    JOIN r.categoria c
    JOIN r.modulo m
    JOIN m.local l
    JOIN l.servicioAlimentario s

    WHERE s.idCentroAlimentario = :idServicio
    AND r.fecha = :fecha
    AND r.registroCorrelativo = :correlativo

    GROUP BY
        c.idCategoriaGrupo,
        c.nombreCategoria

    ORDER BY
        c.idCategoriaGrupo
    """)
    List<AsistenciaCategoriaDTO> obtenerTotalServicioAlimentario(
            Integer idServicio,
            LocalDate fecha,
            Integer correlativo
    );

    @Query("""
SELECT r
FROM RegistroAsistenciaCIAIEntity r
JOIN FETCH r.modulo m
JOIN FETCH m.local l
JOIN FETCH l.servicioAlimentario s
JOIN FETCH r.categoria c
WHERE s.idCentroAlimentario = :idServicio
AND r.fecha = :fecha
AND r.registroCorrelativo = :correlativo
ORDER BY
l.localNombre,
m.nombreModulo,
c.idCategoriaGrupo
""")
    List<RegistroAsistenciaCIAIEntity> obtenerResumenServicio(
            Integer idServicio,
            LocalDate fecha,
            Integer correlativo
    );
}