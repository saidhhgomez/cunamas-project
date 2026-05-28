package com.cunamas.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "cat_tipo_centro")
@Data
public class TipoCentroEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo_centro")
    private Integer idTipoCentro;

    @Column(name = "nombre_tipo_centro", nullable = false)
    private String nombreTipoCentro;
}