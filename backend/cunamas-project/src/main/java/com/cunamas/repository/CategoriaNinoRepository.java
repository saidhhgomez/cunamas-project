package com.cunamas.repository;

import com.cunamas.entity.CategoriaNinoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoriaNinoRepository extends JpaRepository<CategoriaNinoEntity, Integer> {
}