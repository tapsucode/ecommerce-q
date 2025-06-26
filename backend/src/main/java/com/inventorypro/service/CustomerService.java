package com.inventorypro.service;

import com.inventorypro.dto.request.CustomerRequest;
import com.inventorypro.model.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface CustomerService {
    
    Customer createCustomer(CustomerRequest customerRequest);
    
    Optional<Customer> findById(Long id);
    
    Optional<Customer> findByEmail(String email);
    
    List<Customer> getAllActiveCustomers();
    
    Page<Customer> searchCustomers(String keyword, Pageable pageable);
    
    List<Customer> getCustomersByType(Customer.CustomerType customerType);
    
    Customer updateCustomer(Long id, CustomerRequest customerRequest);
    
    void deleteCustomer(Long id);
    
    Boolean existsByEmail(String email);
}