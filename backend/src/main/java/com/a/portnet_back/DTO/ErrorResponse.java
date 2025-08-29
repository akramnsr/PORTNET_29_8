package com.a.portnet_back.DTO;

public class ErrorResponse {
    private String message;

    public ErrorResponse(String message) {
        this.message = message;
    }

    public ErrorResponse(String uneErreurEstSurvenue, String message, String string) {
    }

    public String getMessage() { return message; }
}