package com.cunamas.client;

import com.cunamas.client.dto.Message;
import com.cunamas.client.dto.OpenAIRequest;
import com.cunamas.client.dto.OpenAIResponse;
import com.cunamas.config.OpenAIProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Slf4j
@Component
@RequiredArgsConstructor
public class OpenAIClientImpl
        implements OpenAIClient {

    private final OpenAIProperties properties;

    private final RestClient restClient =
            RestClient.builder()
                    .build();

    @Override
    public String analizarAlimentos(
            String prompt
    ) {

        log.info("==============================================");

        log.info("Inicializando cliente OpenAI...");

        log.info("Modelo: {}", properties.getModel());

        log.info("URL: {}", properties.getUrl());

        log.info("Timeout: {} segundos", properties.getTimeout());

        log.info("API KEY cargada: {}",
                properties.getApiKey() != null
        );

        log.info("----------------------------------------------");

        log.info("Enviando solicitud a OpenAI...");

        OpenAIRequest request =

                new OpenAIRequest(

                        properties.getModel(),

                        java.util.List.of(

                                new Message(

                                        "system",

                                        """
                                        Eres una nutricionista especializada
                                        en alimentación infantil del Programa
                                        Nacional Cuna Más del MIDIS Perú.
                                        """

                                ),

                                new Message(

                                        "user",

                                        prompt

                                )

                        )

                );

        OpenAIResponse response =

                restClient

                        .post()

                        .uri(properties.getUrl())

                        .contentType(
                                MediaType.APPLICATION_JSON
                        )

                        .header(
                                "Authorization",
                                "Bearer " + properties.getApiKey()
                        )

                        .body(request)

                        .retrieve()

                        .body(OpenAIResponse.class);

        if (response == null
                || response.getChoices() == null
                || response.getChoices().isEmpty()) {

            throw new RuntimeException(
                    "OpenAI no devolvió ninguna respuesta."
            );

        }

        String respuesta =

                response

                        .getChoices()

                        .getFirst()

                        .getMessage()

                        .getContent();

        log.info("----------------------------------------------");

        log.info("Respuesta recibida correctamente.");

        log.info("==============================================");

        return respuesta;

    }

}