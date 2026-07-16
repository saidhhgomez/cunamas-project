package com.cunamas.controller;

import com.cunamas.dto.*;
import com.cunamas.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/usuarios")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdminUsuarioController {

    private final AuthService authService;

    @PostMapping
    public AdminRegisterResponseDTO registrarUsuario(
            @Valid
            @RequestBody
            AdminRegisterRequestDTO request
    ) {

        return authService.registrarUsuarioPorAdministrador(
                request
        );

    }

    @GetMapping("/pendientes")
    public List<UsuarioPendienteListadoDTO>
    obtenerPendientes() {

        return authService
                .obtenerSolicitudesPendientes();

    }

    @GetMapping("/pendientes/{idPersona}")
    public UsuarioPendienteDetalleDTO
    obtenerDetalle(

            @PathVariable
            Integer idPersona
    ) {

        return authService
                .obtenerDetalleSolicitud(
                        idPersona
                );

    }

    @PutMapping("/aprobar")
    public AprobarUsuarioResponseDTO aprobar(
            @Valid
            @RequestBody
            AprobarUsuarioRequestDTO request
    ) {

        return authService.aprobarSolicitud(
                request
        );

    }

}