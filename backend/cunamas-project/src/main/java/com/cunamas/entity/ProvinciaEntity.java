package com.cunamas.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "provincia")
@Data
public class ProvinciaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_provincia")
    private Integer idProvincia;

    @Column(name = "nombre_provincia", nullable = false)
    private String nombreProvincia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_departamento", nullable = false)
    private DepartamentoEntity departamento;
}