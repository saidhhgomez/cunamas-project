package com.cunamas.repository;


import com.cunamas.entity.CategoriaDosificacionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface CategoriaDosificacionRepository
        extends JpaRepository<CategoriaDosificacionEntity,Integer> {


}