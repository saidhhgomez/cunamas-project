package com.cunamas.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "centro_atencion_infantil")
@Getter
@Setter
public class CentroAtencionInfantilEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_local")
    private Integer idLocal;

    @ManyToOne
    @JoinColumn(name = "id_direccion")
    private DireccionEntity direccion;

    @ManyToOne
    @JoinColumn(name = "id_centro_alimentario")
    private ServicioAlimentarioEntity servicioAlimentario;

    @Column(name = "local_nombre")
    private String localNombre;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_modificacion")
    private LocalDateTime fechaModificacion;

    @Column(name = "id_usuario_modificacion")
    private Integer idUsuarioModificacion;
}