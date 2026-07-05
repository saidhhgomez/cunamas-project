package com.cunamas.config;

import com.cunamas.entity.*;
import com.cunamas.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataInitializer
        implements CommandLineRunner {

    private static final Integer ID_GENERO_MASCULINO = 1;

    private static final Integer ID_DNI = 1;

    private static final Integer ID_ROL_AT = 1;

    private final PersonaRepository personaRepository;

    private final CuentaAccesoRepository cuentaRepository;

    private final PersonaRolRepository personaRolRepository;

    private final DocumentoRepository documentoRepository;

    private final GeneroRepository generoRepository;

    private final RolRepository rolRepository;

    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        if (personaRepository.existsByNumeroDocumento("00000000") || cuentaRepository.existsByCorreoElectronicoIgnoreCase("admin@cunamas.gob.pe")) {

            return;

        }

        DocumentoEntity documento =
                documentoRepository.findById(
                        ID_DNI
                ).orElseThrow(() ->
                        new RuntimeException(
                                "No existe el tipo de documento DNI."
                        )
                );

        GeneroEntity genero =
                generoRepository.findById(
                        ID_GENERO_MASCULINO
                ).orElseThrow(() ->
                        new RuntimeException(
                                "No existe el género."
                        )
                );

        RolEntity rol =
                rolRepository.findById(
                        ID_ROL_AT
                ).orElseThrow(() ->
                        new RuntimeException(
                                "No existe el rol Asistente Técnico."
                        )
                );

        LocalDateTime ahora =
                LocalDateTime.now();

        PersonaEntity persona =
                new PersonaEntity();

        persona.setGenero(genero);

        persona.setDocumento(documento);

        persona.setNumeroDocumento(
                "00000000"
        );

        persona.setNombres(
                "ADMINISTRADOR"
        );

        persona.setApPaterno(
                "SISTEMA"
        );

        persona.setFechaCreacion(
                ahora
        );

        persona.setFechaModificacion(
                ahora
        );

        persona.setIdUsuarioModificacion(
                null
        );

        persona =
                personaRepository.save(
                        persona
                );

        CuentaAccesoEntity cuenta =
                new CuentaAccesoEntity();

        cuenta.setPersona(
                persona
        );

        cuenta.setCorreoElectronico(
                "admin@cunamas.gob.pe"
        );

        cuenta.setPassword(

                passwordEncoder.encode(
                        "CunaMas2026!"
                )

        );

        cuenta.setEstadoCuenta(
                true
        );

        cuenta.setFechaCreacion(
                ahora
        );

        cuenta.setFechaModificacion(
                ahora
        );

        cuenta.setIdUsuarioModificacion(
                persona.getIdPersona()
        );

        cuentaRepository.save(
                cuenta
        );

        PersonaRolEntity personaRol =
                new PersonaRolEntity();

        personaRol.setPersona(
                persona
        );

        personaRol.setRol(
                rol
        );

        personaRolRepository.save(
                personaRol
        );

        System.out.println(
                "=========================================="
        );

        System.out.println(
                "ADMINISTRADOR INICIAL CREADO"
        );

        System.out.println(
                "Usuario : 00000000"
        );

        System.out.println(
                "Password: CunaMas2026!"
        );

        System.out.println(
                "=========================================="
        );

    }

}