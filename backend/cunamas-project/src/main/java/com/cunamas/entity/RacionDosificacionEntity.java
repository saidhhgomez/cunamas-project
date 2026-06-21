package com.cunamas.entity;


import jakarta.persistence.*;
import lombok.Data;


@Entity
@Table(name = "racion_dosificacion")
@Data
public class RacionDosificacionEntity {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_racion_dosificacion")
    private Integer idRacionDosificacion;


    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_tipo_preparacion")
    private TipoPreparacionEntity tipoPreparacion;


    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_categoria_grupo")
    private CategoriaDosificacionEntity categoriaGrupo;


    @Column(name = "gr_ml")
    private Double grMl;

}