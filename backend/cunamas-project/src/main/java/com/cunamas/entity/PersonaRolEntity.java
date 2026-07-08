package com.cunamas.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "persona_rol")
@IdClass(PersonaRolId.class)
@Getter
@Setter
public class PersonaRolEntity {

    @Id
    @ManyToOne
    @JoinColumn(name = "id_persona")
    private PersonaEntity persona;

    @Id
    @ManyToOne
    @JoinColumn(name = "id_rol")
    private RolEntity rol;
}