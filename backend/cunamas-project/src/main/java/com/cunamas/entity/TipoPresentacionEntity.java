package com.cunamas.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "tipo_presentacion")
@Getter
@Setter
public class TipoPresentacionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo_presentacion")
    private Integer idTipoPresentacion;

    @Column(name = "nombre", nullable = false)
    private String nombre;
}