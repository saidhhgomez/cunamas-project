package com.cunamas.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "cuenta_acceso")
@Getter
@Setter
public class CuentaAccesoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cuenta")
    private Integer idCuenta;

    @OneToOne
    @JoinColumn(name = "id_persona", nullable = false)
    private PersonaEntity persona;

    @Column(name = "correo_electronico", nullable = false, unique = true)
    private String correoElectronico;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "estado_cuenta")
    private Boolean estadoCuenta;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_modificacion")
    private LocalDateTime fechaModificacion;

    @Column(name = "id_usuario_modificacion")
    private Integer idUsuarioModificacion;
}