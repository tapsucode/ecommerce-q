package com.inventorypro.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "name", unique = true)
    private RoleName name;

    @Size(max = 255)
    @Column(name = "description")
    private String description;

    public Role(RoleName name) {
        this.name = name;
    }

    public enum RoleName {
        ROLE_ADMIN,
        ROLE_MANAGER,
        ROLE_EMPLOYEE
    }
}