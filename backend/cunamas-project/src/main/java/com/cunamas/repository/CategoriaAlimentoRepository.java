package com.cunamas.repository;


import com.cunamas.entity.CategoriaAlimentoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface CategoriaAlimentoRepository
        extends JpaRepository<CategoriaAlimentoEntity,Integer> {

}