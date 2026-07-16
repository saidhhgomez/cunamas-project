package com.cunamas.service;

import com.cunamas.client.OpenAIClient;
import com.cunamas.dto.IAAlimentoDTO;
import com.cunamas.dto.IAAnalisisRequestDTO;
import com.cunamas.dto.IAAnalisisResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class IAServiceImpl
        implements IAService {

    private final OpenAIClient openAIClient;

    @Override
    public IAAnalisisResponseDTO analizar(
            IAAnalisisRequestDTO request
    ) {

        StringBuilder prompt =
                new StringBuilder();

        prompt.append("""
Eres una nutricionista especializada en el Programa Nacional Cuna Más del Ministerio de Desarrollo e Inclusión Social (MIDIS) del Perú.

Tu objetivo es analizar los alimentos recibidos considerando que están destinados a niños menores de 36 meses que viven en situación de pobreza y pobreza extrema.

Analiza:

- aporte nutricional
- proteínas
- hierro
- calcio
- vitaminas
- carbohidratos
- grasas saludables
- equilibrio nutricional
- posibles deficiencias
- recomendaciones
- posibles preparaciones utilizando los alimentos enviados

Los alimentos recibidos son:

""");

        for (IAAlimentoDTO alimento
                : request.getAlimentos()) {

            prompt.append("\n");

            prompt.append("Alimento: ")
                    .append(alimento.getNombre())
                    .append("\n");

            prompt.append("Cantidad por categoría:\n");

            prompt.append(alimento.getCategoriaEtaria());

            prompt.append("\n");

            prompt.append("Presentación:\n");

            prompt.append(alimento.getPresentacion());

            prompt.append("\n-------------------------\n");

        }

        log.info("Prompt construido correctamente.");

        String respuesta =
                openAIClient
                        .analizarAlimentos(
                                prompt.toString()
                        );

        return new IAAnalisisResponseDTO(

                "Prueba OpenAI",

                respuesta

        );

    }

}