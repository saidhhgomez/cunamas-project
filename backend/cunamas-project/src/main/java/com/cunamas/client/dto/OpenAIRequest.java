package com.cunamas.client.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class OpenAIRequest {

    private String model;

    private List<Message> messages;

}