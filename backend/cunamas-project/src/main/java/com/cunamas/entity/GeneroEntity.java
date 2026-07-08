package com.cunamas.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "cat_genero")
@Getter
@Setter
public class GeneroEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_genero")
    private Integer idGenero;

    @Column(name = "nombre_genero", nullable = false)
    private String nombreGenero;

}