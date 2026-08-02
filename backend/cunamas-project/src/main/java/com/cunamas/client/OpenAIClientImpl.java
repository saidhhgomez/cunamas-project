package com.cunamas.client;

import com.cunamas.client.dto.Message;
import com.cunamas.client.dto.OpenAIRequest;
import com.cunamas.client.dto.OpenAIResponse;
import com.cunamas.config.OpenAIProperties;
import com.cunamas.dto.IAAnalisisResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class OpenAIClientImpl
        implements OpenAIClient {

    private final ObjectMapper objectMapper;

    private final OpenAIProperties properties;

    private final RestClient restClient =
            RestClient.builder()
                    .build();

    @Override
    public IAAnalisisResponseDTO analizarAlimentos(
            String prompt
    ) {

        log.info("==============================================");
        log.info("Inicializando cliente OpenAI...");

        OpenAIRequest request =

                new OpenAIRequest(

                        properties.getModel(),

                        List.of(

                                new Message(
                                        "system",
                                        """
                                        Eres una nutricionista del Programa Nacional Cuna Más.
    
                                        Responde SIEMPRE únicamente JSON válido.
    
                                        No uses markdown.
    
                                        No uses ```json.
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

                        .contentType(MediaType.APPLICATION_JSON)

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
                    "OpenAI no devolvió respuesta."
            );

        }

        String json =

                response.getChoices()

                        .getFirst()

                        .getMessage()

                        .getContent();

        try {

            return objectMapper.readValue(

                    json,

                    IAAnalisisResponseDTO.class

            );

        }

        catch (Exception e) {

            log.error(json);

            throw new RuntimeException(
                    "No fue posible convertir el JSON de OpenAI.",
                    e
            );

        }

    }

}