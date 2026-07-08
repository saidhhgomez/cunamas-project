package com.cunamas.entity;

import lombok.Data;

import java.io.Serializable;

@Data
public class PersonaRolId implements Serializable {

    private Integer persona;

    private Integer rol;
}