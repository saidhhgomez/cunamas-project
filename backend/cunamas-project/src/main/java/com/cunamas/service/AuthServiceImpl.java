package com.cunamas.service;

import com.cunamas.dto.*;
import com.cunamas.entity.*;
import com.cunamas.repository.*;
import com.cunamas.security.JwtService;
import com.cunamas.security.JwtUtils;
import com.cunamas.security.SecurityUtils;
import com.cunamas.util.PasswordGenerator;
import io.jsonwebtoken.Claims;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final PersonaRepository personaRepository;

    private final CuentaAccesoRepository cuentaRepository;

    private final GeneroRepository generoRepository;

    private final DocumentoRepository documentoRepository;

    private final PasswordEncoder passwordEncoder;

    private final PersonaRolRepository personaRolRepository;

    private final JwtService jwtService;

    private final SecurityUtils securityUtils;

    private final RolRepository rolRepository;

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

    @Override
    @Transactional(readOnly = true)
    public LoginResponseDTO login(
            LoginRequestDTO request
    ) {

        PersonaEntity persona =

                personaRepository
                        .findByNumeroDocumento(
                                request.getNumeroDocumento().trim()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Credenciales inválidas."
                                )
                        );

        CuentaAccesoEntity cuenta =

                cuentaRepository
                        .findByPersona_IdPersona(
                                persona.getIdPersona()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Credenciales inválidas."
                                )
                        );

        if (!Boolean.TRUE.equals(
                cuenta.getEstadoCuenta()
        )) {

            throw new RuntimeException(
                    "Su cuenta aún no ha sido aprobada."
            );

        }

        boolean passwordCorrecto =

                passwordEncoder.matches(

                        request.getPassword(),

                        cuenta.getPassword()

                );

        if (!passwordCorrecto) {

            throw new RuntimeException(
                    "Credenciales inválidas."
            );

        }

        List<String> roles =

                personaRolRepository

                        .findByPersona_IdPersona(
                                persona.getIdPersona()
                        )

                        .stream()

                        .map(r ->

                                r.getRol()
                                        .getNombreRol()

                        )

                        .toList();

        String distrito = null;

        boolean tieneDireccion = false;

        if (persona.getDireccion() != null) {

            tieneDireccion = true;

            distrito =

                    persona.getDireccion()

                            .getDistrito()

                            .getNombreDistrito();

        }

        String token =

                jwtService.generarToken(
                        persona,
                        roles
                );

        return new LoginResponseDTO(

                token,

                "Bearer",

                jwtService.getExpirationSeconds(),

                persona.getIdPersona(),

                persona.getNombres()

                        + " "

                        + persona.getApPaterno(),

                roles,

                distrito,

                tieneDireccion

        );

    }

    @Override
    @Transactional
    public AdminRegisterResponseDTO registrarUsuarioPorAdministrador(

            AdminRegisterRequestDTO request
    ) {

        // ======================================================
        // 1. VALIDAR JWT
        // ======================================================

        Integer idAdministrador =
                securityUtils.getIdPersona();

        if (!securityUtils.puedeAdministrarUsuarios()) {

            throw new RuntimeException(
                    "No tiene permisos para realizar esta operación."
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
                                "Tipo de documento no existe."
                        )

                );

        String numeroDocumento =

                request.getPersona()
                        .getNumeroDocumento()
                        .trim();

        if (documento.getIdDocumento() == 1) {

            if (!numeroDocumento.matches("^[0-9]{8}$")) {

                throw new RuntimeException(
                        "El DNI debe contener exactamente 8 dígitos."
                );
            }

        } else if (documento.getIdDocumento() == 2) {

            if (!numeroDocumento.matches("^[A-Za-z0-9]{9}$")) {

                throw new RuntimeException(
                        "Carnet de extranjería inválido."
                );
            }

        }

        if (personaRepository.existsByNumeroDocumento(numeroDocumento)) {

            throw new RuntimeException(
                    "El número de documento ya existe."
            );
        }

        String correo =

                request.getCuenta()
                        .getCorreoElectronico()
                        .trim()
                        .toLowerCase();

        if (cuentaRepository.existsByCorreoElectronicoIgnoreCase(correo)) {

            throw new RuntimeException(
                    "El correo ya existe."
            );
        }

        List<RolEntity> roles =

                rolRepository.findAllById(

                        request.getRoles()

                );

        if (roles.size() != request.getRoles().size()) {

            throw new RuntimeException(
                    "Existe un rol inválido."
            );
        }

        String passwordTemporal =

                PasswordGenerator.generarPasswordTemporal();

        String passwordHash =

                passwordEncoder.encode(passwordTemporal);

        PersonaEntity persona =

                new PersonaEntity();

        persona.setGenero(genero);

        persona.setDocumento(documento);

        persona.setNumeroDocumento(numeroDocumento);

        persona.setNombres(
                request.getPersona().getNombres()
        );

        persona.setApPaterno(
                request.getPersona().getApPaterno()
        );

        persona.setApMaterno(
                request.getPersona().getApMaterno()
        );

        persona.setFechaCreacion(
                LocalDateTime.now()
        );

        persona.setFechaModificacion(
                LocalDateTime.now()
        );

        persona.setIdUsuarioModificacion(
                idAdministrador
        );

        personaRepository.save(persona);

        CuentaAccesoEntity cuenta =

                new CuentaAccesoEntity();

        cuenta.setPersona(persona);

        cuenta.setCorreoElectronico(correo);

        cuenta.setPassword(passwordHash);

        cuenta.setEstadoCuenta(true);

        cuenta.setFechaCreacion(
                LocalDateTime.now()
        );

        cuenta.setFechaModificacion(
                LocalDateTime.now()
        );

        cuenta.setIdUsuarioModificacion(
                idAdministrador
        );

        cuentaRepository.save(cuenta);

        for (RolEntity rol : roles) {

            PersonaRolEntity personaRol =
                    new PersonaRolEntity();

            personaRol.setPersona(persona);

            personaRol.setRol(rol);

            personaRolRepository.save(personaRol);

        }

        return new AdminRegisterResponseDTO(

                "Usuario registrado correctamente.",

                persona.getIdPersona(),

                passwordTemporal

        );

    }

    @Override
    @Transactional
    public List<UsuarioPendienteListadoDTO>
    obtenerSolicitudesPendientes() {

        List<CuentaAccesoEntity> cuentas =
                cuentaRepository
                        .findAllByEstadoCuentaFalseOrderByFechaCreacionDesc();

        return cuentas.stream()

                .map(cuenta -> {

                    PersonaEntity persona =
                            cuenta.getPersona();

                    String nombresCompletos =

                            persona.getNombres()

                                    + " "

                                    + persona.getApPaterno()

                                    + (

                                    persona.getApMaterno() != null

                                            ? " " + persona.getApMaterno()

                                            : ""

                            );

                    return new UsuarioPendienteListadoDTO(

                            persona.getIdPersona(),

                            persona.getNumeroDocumento(),

                            nombresCompletos,

                            cuenta.getCorreoElectronico(),

                            cuenta.getFechaCreacion(),

                            cuenta.getEstadoCuenta()

                    );

                })

                .toList();

    }

    @Override
    @Transactional
    public UsuarioPendienteDetalleDTO
    obtenerDetalleSolicitud(Integer idPersona) {

        CuentaAccesoEntity cuenta =

                cuentaRepository

                        .findWithPersonaByPersona_IdPersona(idPersona)

                        .orElseThrow(() ->

                                new RuntimeException(
                                        "Solicitud no encontrada"
                                )

                        );

        if (Boolean.TRUE.equals(
                cuenta.getEstadoCuenta())) {

            throw new RuntimeException(
                    "La cuenta ya fue aprobada"
            );

        }

        PersonaEntity persona =
                cuenta.getPersona();

        UsuarioPendienteDetalleDTO dto =
                new UsuarioPendienteDetalleDTO();

        dto.setIdPersona(
                persona.getIdPersona()
        );

        dto.setIdGenero(
                persona.getGenero().getIdGenero()
        );

        dto.setGenero(
                persona.getGenero().getNombreGenero()
        );

        dto.setIdDocumento(
                persona.getDocumento().getIdDocumento()
        );

        dto.setTipoDocumento(
                persona.getDocumento().getNombreDocumento()
        );

        dto.setNumeroDocumento(
                persona.getNumeroDocumento()
        );

        dto.setNombres(
                persona.getNombres()
        );

        dto.setApPaterno(
                persona.getApPaterno()
        );

        dto.setApMaterno(
                persona.getApMaterno()
        );

        dto.setTelefono(
                persona.getTelefono()
        );

        dto.setFechaNacimiento(
                persona.getFechaNacimiento()
        );

        if (persona.getDireccion() != null) {

            dto.setIdDireccion(
                    persona.getDireccion().getIdDireccion()
            );

            dto.setDireccion(
                    persona.getDireccion()
                            .getNombreDireccion()
            );

            dto.setDistrito(

                    persona.getDireccion()

                            .getDistrito()

                            .getNombreDistrito()

            );

        }

        dto.setCorreoElectronico(
                cuenta.getCorreoElectronico()
        );

        dto.setFechaRegistro(
                cuenta.getFechaCreacion()
        );

        return dto;

    }

    @Override
    @Transactional
    public AprobarUsuarioResponseDTO aprobarSolicitud(
            AprobarUsuarioRequestDTO request
    ) {

        Integer idAdministrador =
                securityUtils.getIdPersona();

        if (!securityUtils.puedeAdministrarUsuarios()) {

            throw new RuntimeException(
                    "No tiene permisos para realizar esta operación."
            );

        }

        CuentaAccesoEntity cuenta =

                cuentaRepository

                        .findWithPersonaByPersona_IdPersona(
                                request.getIdPersona()
                        )

                        .orElseThrow(() ->

                                new RuntimeException(
                                        "Solicitud no encontrada."
                                )

                        );

        if (Boolean.TRUE.equals(
                cuenta.getEstadoCuenta())) {

            throw new RuntimeException(
                    "La cuenta ya fue aprobada."
            );

        }

        if (personaRolRepository.existsByPersona_IdPersona(
                request.getIdPersona())) {

            throw new RuntimeException(
                    "La persona ya posee roles asignados."
            );

        }

        for (Integer idRol : request.getRoles()) {

            RolEntity rol =

                    rolRepository

                            .findById(idRol)

                            .orElseThrow(() ->

                                    new RuntimeException(
                                            "Rol inexistente."
                                    )

                            );

            PersonaRolEntity personaRol =
                    new PersonaRolEntity();

            personaRol.setPersona(
                    cuenta.getPersona()
            );

            personaRol.setRol(
                    rol
            );

            personaRolRepository.save(
                    personaRol
            );

        }

        cuenta.setEstadoCuenta(true);

        cuenta.setIdUsuarioModificacion(
                idAdministrador
        );

        cuenta.setFechaModificacion(
                LocalDateTime.now()
        );

        cuentaRepository.save(cuenta);

        PersonaEntity persona =
                cuenta.getPersona();

        persona.setIdUsuarioModificacion(
                idAdministrador
        );

        persona.setFechaModificacion(
                LocalDateTime.now()
        );

        personaRepository.save(persona);

        return new AprobarUsuarioResponseDTO(

                "Usuario aprobado correctamente."

        );
    }

}
