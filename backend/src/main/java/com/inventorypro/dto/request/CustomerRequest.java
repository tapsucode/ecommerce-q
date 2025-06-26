package com.inventorypro.dto.request;

import com.inventorypro.model.Customer;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CustomerRequest {
    
    @NotBlank
    @Size(max = 255)
    private String name;
    
    @NotBlank
    @Email
    @Size(max = 100)
    private String email;
    
    @Size(max = 20)
    private String phone;
    
    private String address;
    
    @Size(max = 100)
    private String country;
    
    private Customer.CustomerType customerType;
    
    @Size(max = 3)
    private String currency;
    
    // Constructors
    public CustomerRequest() {}
    
    // Getters and Setters
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public String getAddress() {
        return address;
    }
    
    public void setAddress(String address) {
        this.address = address;
    }
    
    public String getCountry() {
        return country;
    }
    
    public void setCountry(String country) {
        this.country = country;
    }
    
    public Customer.CustomerType getCustomerType() {
        return customerType;
    }
    
    public void setCustomerType(Customer.CustomerType customerType) {
        this.customerType = customerType;
    }
    
    public String getCurrency() {
        return currency;
    }
    
    public void setCurrency(String currency) {
        this.currency = currency;
    }
}