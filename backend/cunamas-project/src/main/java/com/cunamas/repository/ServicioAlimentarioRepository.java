package com.cunamas.repository;

import com.cunamas.entity.ServicioAlimentarioEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ServicioAlimentarioRepository
        extends JpaRepository<ServicioAlimentarioEntity, Integer> {

    boolean existsByNombreCentroIgnoreCase(
            String nombreCentro
    );

    @Query("""
        SELECT sa

        FROM ServicioAlimentarioEntity sa

        JOIN sa.direccion dir
        JOIN dir.distrito d

        WHERE UPPER(d.nombreDistrito)
              LIKE UPPER(CONCAT('%', :distrito, '%'))
    """)
    Page<ServicioAlimentarioEntity> buscarPorDistrito(
            String distrito,
            Pageable pageable
    );
}