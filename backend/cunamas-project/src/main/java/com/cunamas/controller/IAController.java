package com.cunamas.controller;

import com.cunamas.dto.request.IAAnalisisRequestDTO;
import com.cunamas.dto.response.IAAnalisisResponseDTO;
import com.cunamas.service.IAService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ia")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class IAController {

    private final IAService iaService;

    @PostMapping("/analizar-alimentos")
    public IAAnalisisResponseDTO analizar(

            @Valid
            @RequestBody
            IAAnalisisRequestDTO request

    ) {

        return iaService.analizar(request);

    }

}