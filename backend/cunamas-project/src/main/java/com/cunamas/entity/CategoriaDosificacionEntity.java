package com.cunamas.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "categorias_dosificacion")
@Getter
@Setter
public class CategoriaDosificacionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_categoria_grupo")
    private Integer idCategoriaGrupo;

    @Column(name = "nombre_categoria")
    private String nombreCategoria;
}