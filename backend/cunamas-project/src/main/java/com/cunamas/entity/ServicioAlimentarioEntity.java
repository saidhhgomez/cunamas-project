package com.cunamas.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "servicio_alimentario")
@Getter
@Setter
public class ServicioAlimentarioEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_centro_alimentario")
    private Integer idCentroAlimentario;

    @ManyToOne
    @JoinColumn(name = "id_direccion")
    private DireccionEntity direccion;

    @Column(name = "nombre_centro")
    private String nombreCentro;

    @Column(name = "nombre_comite")
    private String nombreComite;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_modificacion")
    private LocalDateTime fechaModificacion;

    @Column(name = "id_usuario_modificacion")
    private Integer idUsuarioModificacion;
}