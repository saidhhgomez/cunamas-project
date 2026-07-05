package com.cunamas.service;

import com.cunamas.dto.RegisterRequestDTO;
import com.cunamas.dto.RegisterResponseDTO;
import com.cunamas.entity.CuentaAccesoEntity;
import com.cunamas.entity.DocumentoEntity;
import com.cunamas.entity.GeneroEntity;
import com.cunamas.entity.PersonaEntity;
import com.cunamas.repository.CuentaAccesoRepository;
import com.cunamas.repository.DocumentoRepository;
import com.cunamas.repository.GeneroRepository;
import com.cunamas.repository.PersonaRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final PersonaRepository personaRepository;

    private final CuentaAccesoRepository cuentaRepository;

    private final GeneroRepository generoRepository;

    private final DocumentoRepository documentoRepository;

    private final PasswordEncoder passwordEncoder;

    private static final Pattern REGEX_DNI =
            Pattern.compile("^[0-9]{8}$");

    private static final Pattern REGEX_CE =
            Pattern.compile("^[A-Za-z0-9]{9}$");

    private static final Pattern REGEX_EMAIL =
            Pattern.compile(
                    "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
            );

    private static final Pattern REGEX_PASSWORD =
            Pattern.compile(
                    "^(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&.#_-]).{8,}$"
            );

    @Override
    @Transactional
    public RegisterResponseDTO register(
            RegisterRequestDTO request
    ) {

        validarDocumento(

                request.getPersona().getIdDocumento(),

                request.getPersona().getNumeroDocumento()

        );

        validarCorreo(

                request.getCuenta().getCorreoElectronico()

        );

        validarPassword(

                request.getCuenta().getPassword()

        );

        if (personaRepository.existsByNumeroDocumento(

                request.getPersona().getNumeroDocumento()

        )) {

            throw new RuntimeException(
                    "El número de documento ya se encuentra registrado."
            );

        }

        if (cuentaRepository.existsByCorreoElectronicoIgnoreCase(

                request.getCuenta().getCorreoElectronico()

        )) {

            throw new RuntimeException(
                    "El correo electrónico ya se encuentra registrado."
            );

        }

        GeneroEntity genero =

                generoRepository.findById(

                        request.getPersona().getIdGenero()

                ).orElseThrow(() ->

                        new RuntimeException(
                                "El género no existe."
                        )

                );

        DocumentoEntity documento =

                documentoRepository.findById(

                        request.getPersona().getIdDocumento()

                ).orElseThrow(() ->

                        new RuntimeException(
                                "El tipo de documento no existe."
                        )

                );

        String numeroDocumento =
                request.getPersona()
                        .getNumeroDocumento()
                        .trim();

        if (documento.getIdDocumento() == 1) {

            if (!numeroDocumento.matches("^[0-9]{8}$")) {

                throw new RuntimeException(
                        "El DNI debe contener exactamente 8 dígitos"
                );
            }

        } else if (documento.getIdDocumento() == 2) {

            if (!numeroDocumento.matches("^[A-Za-z0-9]{9}$")) {

                throw new RuntimeException(
                        "El Carnet de Extranjería debe contener 9 caracteres alfanuméricos"
                );
            }
        }

        // Validar unicidad del documento

        if (personaRepository.existsByNumeroDocumento(numeroDocumento)) {

            throw new RuntimeException(
                    "El número de documento ya se encuentra registrado"
            );
        }

        // ===============================
        // Validar correo
        // ===============================

        String correo =
                request.getCuenta()
                        .getCorreoElectronico()
                        .trim()
                        .toLowerCase();

        Pattern correoPattern =
                Pattern.compile(
                        "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
                );

        if (!correoPattern.matcher(correo).matches()) {

            throw new RuntimeException(
                    "Correo electrónico inválido"
            );
        }

        if (cuentaRepository.existsByCorreoElectronicoIgnoreCase(correo)) {

            throw new RuntimeException(
                    "El correo electrónico ya se encuentra registrado"
            );
        }

        // Validar contraseña

        String password =
                request.getCuenta()
                        .getPassword();

        Pattern passwordPattern =
                Pattern.compile(
                        "^(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&.#_-])[A-Za-z\\d@$!%*?&.#_-]{8,}$"
                );

        if (!passwordPattern.matcher(password).matches()) {

            throw new RuntimeException(
                    "La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial"
            );
        }

        // Crear Persona

        LocalDateTime ahora =
                LocalDateTime.now();

        PersonaEntity persona =
                new PersonaEntity();

        persona.setDocumento(documento);

        persona.setGenero(genero);

        persona.setNumeroDocumento(numeroDocumento);

        persona.setNombres(
                request.getPersona()
                        .getNombres()
                        .trim()
        );

        persona.setApPaterno(
                request.getPersona()
                        .getApPaterno()
                        .trim()
        );

        persona.setApMaterno(
                request.getPersona()
                        .getApMaterno()
        );

        persona.setFechaCreacion(ahora);

        persona.setFechaModificacion(ahora);

        persona.setIdUsuarioModificacion(null);

        persona =
                personaRepository.save(persona);

        // Crear Cuenta de Acceso

        CuentaAccesoEntity cuenta =
                new CuentaAccesoEntity();

        cuenta.setPersona(persona);

        cuenta.setCorreoElectronico(correo);

        cuenta.setPassword(
                passwordEncoder.encode(password)
        );

        cuenta.setEstadoCuenta(false);

        cuenta.setFechaCreacion(ahora);

        cuenta.setFechaModificacion(ahora);

        cuenta.setIdUsuarioModificacion(null);

        cuentaRepository.save(cuenta);

        return new RegisterResponseDTO(

                "Registro realizado correctamente. Su cuenta se encuentra pendiente de aprobación."

        );
    }

    private void validarDocumento(
                Integer idDocumento,
                String numeroDocumento
        ) {

            if (idDocumento == 1) {

                if (!REGEX_DNI.matcher(numeroDocumento).matches()) {

                    throw new RuntimeException(
                            "El DNI debe contener exactamente 8 dígitos."
                    );

                }

            }

            else if (idDocumento == 2) {

                if (!REGEX_CE.matcher(numeroDocumento).matches()) {

                    throw new RuntimeException(
                            "El Carnet de Extranjería debe contener 9 caracteres alfanuméricos."
                    );

                }

            }

            else {

                throw new RuntimeException(
                        "Tipo de documento no válido."
                );

            }

        }

        private void validarCorreo(
                String correo
        ) {

            if (!REGEX_EMAIL.matcher(correo).matches()) {

                throw new RuntimeException(
                        "El correo electrónico no tiene un formato válido."
                );

            }

        }

        private void validarPassword(
                String password
        ) {

            if (!REGEX_PASSWORD.matcher(password).matches()) {

                throw new RuntimeException(
                        "La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial."
                );

            }

        }

    }
