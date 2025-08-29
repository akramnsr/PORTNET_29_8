package com.a.portnet_back.DTO;

public class AgentActivationRequest {
    private String token;
    private String password;

    public AgentActivationRequest() {}

    public AgentActivationRequest(String token, String password) {
        this.token = token;
        this.password = password;
    }


    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
