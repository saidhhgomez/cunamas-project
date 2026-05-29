package com.cunamas.repository;

import com.cunamas.dto.LocalListadoDTO;
import com.cunamas.entity.LocalEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface LocalRepository
        extends JpaRepository<LocalEntity, Integer> {

    boolean existsByLocalNombreIgnoreCase(String localNombre);

    @Query("""
        SELECT new com.cunamas.dto.LocalListadoDTO(
            l.idLocal,
            l.localNombre,

            CONCAT(
                d.nombreDistrito,
                ', ',
                dir.nombreDireccion
            ),

            tc.nombreTipoCentro
        )

        FROM LocalEntity l

        JOIN l.direccion dir
        JOIN dir.distrito d
        JOIN l.tipoCentro tc

        ORDER BY l.idLocal ASC
    """)
    List<LocalListadoDTO> listarLocales();
}