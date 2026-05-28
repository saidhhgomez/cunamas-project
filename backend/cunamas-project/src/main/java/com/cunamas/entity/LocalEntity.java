package com.cunamas.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "locales")
@Data
public class LocalEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_local")
    private Integer idLocal;

    @Column(name = "local_nombre", nullable = false, unique = true)
    private String localNombre;

    @ManyToOne
    @JoinColumn(name = "id_direccion", nullable = false)
    private DireccionEntity direccion;

    @ManyToOne
    @JoinColumn(name = "id_tipo_centro", nullable = false)
    private TipoCentroEntity tipoCentro;
}