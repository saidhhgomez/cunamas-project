package com.cunamas.repository;


import com.cunamas.entity.RacionDosificacionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface RacionDosificacionRepository
        extends JpaRepository<RacionDosificacionEntity,Integer> {


    List<RacionDosificacionEntity>
    findByTipoPreparacion_IdTipoPreparacion(
            Integer idTipoPreparacion
    );

}