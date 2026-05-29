package com.cunamas.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "modulo")
@Getter
@Setter
public class ModuloEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_modulo")
    private Integer idModulo;

    @Column(name = "nombre_modulo", nullable = false)
    private String nombreModulo;

    @ManyToOne
    @JoinColumn(name = "id_local", nullable = false)
    private LocalEntity local;
}