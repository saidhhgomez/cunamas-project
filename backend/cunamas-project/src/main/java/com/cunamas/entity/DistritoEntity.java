package com.cunamas.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "distrito")
@Data
public class DistritoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_distrito")
    private Integer idDistrito;

    @Column(name = "nombre_distrito", nullable = false)
    private String nombreDistrito;

    @Column(name = "ubigeo")
    private Integer ubigeo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_provincia", nullable = false)
    private ProvinciaEntity provincia;
}