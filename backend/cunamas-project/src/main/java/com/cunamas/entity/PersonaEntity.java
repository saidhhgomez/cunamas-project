package com.cunamas.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "persona")
@Getter
@Setter
public class PersonaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_persona")
    private Integer idPersona;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_genero", nullable = false)
    private GeneroEntity genero;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_documento", nullable = false)
    private DocumentoEntity documento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_direccion")
    private DireccionEntity direccion;

    @Column(name = "numero_documento", nullable = false, unique = true)
    private String numeroDocumento;

    @Column(name = "nombres", nullable = false)
    private String nombres;

    @Column(name = "ap_paterno", nullable = false)
    private String apPaterno;

    @Column(name = "ap_materno")
    private String apMaterno;

    @Column(name = "telefono")
    private String telefono;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_modificacion")
    private LocalDateTime fechaModificacion;

    @Column(name = "id_usuario_modificacion")
    private Integer idUsuarioModificacion;
}