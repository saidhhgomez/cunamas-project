package com.cunamas.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "categoria_nino")
@Data
public class CategoriaNinoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_categoria_nino")
    private Integer idCategoriaNino;

    @Column(name = "categoria", nullable = false)
    private String categoria;

    @Column(name = "edad_inicio_meses", nullable = false)
    private Integer edadInicioMeses;

    @Column(name = "edad_fin_meses", nullable = false)
    private Integer edadFinMeses;
}