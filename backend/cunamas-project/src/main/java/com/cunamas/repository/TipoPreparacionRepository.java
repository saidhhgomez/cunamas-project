package com.cunamas.repository;


import com.cunamas.entity.TipoPreparacionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface TipoPreparacionRepository
        extends JpaRepository<TipoPreparacionEntity,Integer> {


    List<TipoPreparacionEntity>
    findByCategoriaAlimento_IdCategoriaAlimento(
            Integer idCategoriaAlimento
    );

}