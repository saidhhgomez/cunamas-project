package com.cunamas.repository;

import com.cunamas.entity.PersonaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PersonaRepository
        extends JpaRepository<PersonaEntity, Integer> {

    boolean existsByNumeroDocumento(
            String numeroDocumento
    );

}