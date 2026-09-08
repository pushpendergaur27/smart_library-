package com.smartlibrary.dto;

public class AuthResponse {
    private String token;
    private String role;
    private String name;
    private String email;
    private Long id;

    public AuthResponse() {}
    public AuthResponse(String token, String role, String name, String email, Long id) {
        this.token = token; this.role = role; this.name = name; this.email = email; this.id = id;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
}
