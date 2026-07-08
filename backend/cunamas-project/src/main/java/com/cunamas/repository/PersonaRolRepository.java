package com.cunamas.repository;

import com.cunamas.entity.PersonaRolEntity;
import com.cunamas.entity.PersonaRolId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PersonaRolRepository
        extends JpaRepository<PersonaRolEntity, PersonaRolId> {

    List<PersonaRolEntity> findByPersona_IdPersona(
            Integer idPersona
    );

    boolean existsByPersona_IdPersona(
            Integer idPersona
    );

}