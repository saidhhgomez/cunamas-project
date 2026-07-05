package com.cunamas.repository;

import com.cunamas.entity.PersonaRolEntity;
import com.cunamas.entity.PersonaRolId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PersonaRolRepository
        extends JpaRepository<PersonaRolEntity, PersonaRolId> {

}