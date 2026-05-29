package com.cunamas.repository;

import com.cunamas.dto.ModuloListadoDTO;
import com.cunamas.entity.ModuloEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ModuloRepository
        extends JpaRepository<ModuloEntity, Integer> {

    boolean existsByNombreModuloIgnoreCaseAndLocal_IdLocal(
            String nombreModulo,
            Integer idLocal
    );

    @Query("""
        SELECT new com.cunamas.dto.ModuloListadoDTO(
            m.idModulo,
            m.nombreModulo
        )

        FROM ModuloEntity m

        WHERE m.local.idLocal = :idLocal

        ORDER BY m.nombreModulo ASC
    """)
    List<ModuloListadoDTO> listarModulosPorLocal(
            Integer idLocal
    );

}