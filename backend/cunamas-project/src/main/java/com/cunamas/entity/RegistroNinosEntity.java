package com.cunamas.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(
        name = "registro_ninos",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {
                                "fecha",
                                "id_modulo",
                                "id_categoria_nino"
                        }
                )
        }
)
@Getter
@Setter
public class RegistroNinosEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_registro_ninos")
    private Integer idRegistroNinos;

    @ManyToOne
    @JoinColumn(name = "id_modulo", nullable = false)
    private ModuloEntity modulo;

    @ManyToOne
    @JoinColumn(name = "id_categoria_nino", nullable = false)
    private CategoriaNinoEntity categoriaNino;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;
}