package com.cunamas.repository;

import com.cunamas.entity.DocumentoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentoRepository
        extends JpaRepository<DocumentoEntity, Integer> {

}