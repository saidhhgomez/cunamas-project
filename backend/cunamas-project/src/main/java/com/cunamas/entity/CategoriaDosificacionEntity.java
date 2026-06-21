package com.cunamas.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "categorias_dosificacion")
@Data
public class CategoriaDosificacionEntity {


    @Id
    @Column(name = "id_categoria_grupo")
    private Integer idCategoriaGrupo;


    @Column(name = "nombre_categoria")
    private String nombreCategoria;

}