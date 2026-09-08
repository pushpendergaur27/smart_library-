package com.smartlibrary.dto;

public class StudentResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String course;
    private String year;
    private long activeBorrows;
    private String createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getCourse() { return course; }
    public void setCourse(String course) { this.course = course; }
    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }
    public long getActiveBorrows() { return activeBorrows; }
    public void setActiveBorrows(long activeBorrows) { this.activeBorrows = activeBorrows; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
