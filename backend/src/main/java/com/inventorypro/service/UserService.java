package com.inventorypro.service;

import com.inventorypro.dto.request.SignUpRequest;
import com.inventorypro.model.User;

import java.util.List;
import java.util.Optional;

public interface UserService {
    
    User createUser(SignUpRequest signUpRequest);
    
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    List<User> getAllActiveUsers();
    
    Boolean existsByUsername(String username);
    
    Boolean existsByEmail(String email);
    
    User updateUser(Long id, User user);
    
    void deleteUser(Long id);
}