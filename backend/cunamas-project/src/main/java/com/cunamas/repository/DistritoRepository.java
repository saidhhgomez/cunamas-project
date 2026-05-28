package com.cunamas.repository;

import com.cunamas.entity.DistritoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DistritoRepository extends JpaRepository<DistritoEntity, Integer> {

    List<DistritoEntity> findByNombreDistritoContainingIgnoreCase(String nombreDistrito);

}