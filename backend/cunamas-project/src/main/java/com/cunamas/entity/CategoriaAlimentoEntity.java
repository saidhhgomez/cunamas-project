package com.cunamas.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "categoria_alimento")
@Data
public class CategoriaAlimentoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_categoria_alimento")
    private Integer idCategoriaAlimento;


    @Column(name = "nombre_categoria_alimento")
    private String nombreCategoriaAlimento;

}