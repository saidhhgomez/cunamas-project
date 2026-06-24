package com.cunamas.entity;

import jakarta.persistence.*;
import lombok.Data;


@Entity
@Table(name = "tipo_preparacion")
@Data
public class TipoPreparacionEntity {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo_preparacion")
    private Integer idTipoPreparacion;


    @Column(name = "id_persona")
    private Integer idPersona;


    @ManyToOne
    @JoinColumn(name = "id_categoria_alimento")
    private CategoriaAlimentoEntity categoriaAlimento;


    @Column(name = "nombre_preparacion")
    private String nombrePreparacion;


    @Column(name = "porcion_comestible")
    private Double porcionComestible;

}