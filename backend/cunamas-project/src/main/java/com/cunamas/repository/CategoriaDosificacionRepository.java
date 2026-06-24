package com.cunamas.repository;

import com.cunamas.dto.CategoriaDosificacionDTO;
import com.cunamas.entity.CategoriaDosificacionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CategoriaDosificacionRepository
        extends JpaRepository<CategoriaDosificacionEntity, Integer> {

    @Query("""
    SELECT new com.cunamas.dto.CategoriaDosificacionDTO(
        c.idCategoriaGrupo,
        c.nombreCategoria
    )
    FROM CategoriaDosificacionEntity c
    ORDER BY c.idCategoriaGrupo
""")
    List<CategoriaDosificacionDTO> listarCategorias();
}