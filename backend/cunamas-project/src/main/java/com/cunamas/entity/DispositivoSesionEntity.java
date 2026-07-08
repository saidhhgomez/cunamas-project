package com.cunamas.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "dispositivo_sesion")
@Getter
@Setter
public class DispositivoSesionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_sesion")
    private Integer idSesion;

    @ManyToOne
    @JoinColumn(name = "id_persona", nullable = false)
    private PersonaEntity persona;

    @Column(name = "refresh_token", nullable = false, unique = true)
    private String refreshToken;

    @Column(name = "nombre_dispositivo")
    private String nombreDispositivo;

    @Column(name = "uuid_dispositivo")
    private String uuidDispositivo;

    @Column(name = "activo")
    private Boolean activo;

    @Column(name = "fecha_expiracion")
    private LocalDateTime fechaExpiracion;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "ultima_conexion")
    private LocalDateTime ultimaConexion;
}