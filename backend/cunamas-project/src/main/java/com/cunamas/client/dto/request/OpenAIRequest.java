package com.cunamas.client.dto.request;

import com.cunamas.client.dto.response.Message;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class OpenAIRequest {

    private String model;

    private List<Message> messages;

}