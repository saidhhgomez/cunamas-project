package com.cunamas.repository;

import com.cunamas.dto.ActualizarCantidadRequestDTO;
import com.cunamas.dto.ActualizarCantidadResponseDTO;
import com.cunamas.dto.RegistroNinosResumenDTO;
import com.cunamas.entity.RegistroNinosEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface RegistroNinosRepository
        extends JpaRepository<RegistroNinosEntity, Integer> {

    boolean existsByFechaAndModulo_IdModuloAndCategoriaNino_IdCategoriaNino(
            LocalDate fecha,
            Integer idModulo,
            Integer idCategoriaNino
    );

    @Query("""
        SELECT new com.cunamas.dto.RegistroNinosResumenDTO(
            c.categoria,
            r.cantidad
        )
        FROM RegistroNinosEntity r
        JOIN r.categoriaNino c
        WHERE r.fecha = :fecha
        AND r.modulo.idModulo = :idModulo
    """)
    List<RegistroNinosResumenDTO> obtenerResumenPorFechaYModulo(
            LocalDate fecha,
            Integer idModulo
    );
}