package com.cunamas.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "registro_asistencia_ciai",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {
                                "fecha",
                                "id_modulo",
                                "id_categoria_nino",
                                "registro_correlativo"
                        }
                )
        }
)
@Getter
@Setter
public class RegistroAsistenciaCIAIEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_registro_ninos")
    private Integer idRegistroNinos;

    @ManyToOne
    @JoinColumn(name = "id_categoria_nino")
    private CategoriaDosificacionEntity categoria;

    @ManyToOne
    @JoinColumn(
            name = "id_modulo",
            nullable = false
    )
    private ModuloEntity modulo;

    @Column(name = "registro_correlativo")
    private Integer registroCorrelativo;

    @Column(name = "fecha")
    private LocalDate fecha;

    @Column(name = "cantidad")
    private Integer cantidad;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "id_usuario_creacion")
    private Integer idUsuarioCreacion;

    @Column(name = "fecha_modificacion")
    private LocalDateTime fechaModificacion;

    @Column(name = "id_usuario_modificacion")
    private Integer idUsuarioModificacion;
}