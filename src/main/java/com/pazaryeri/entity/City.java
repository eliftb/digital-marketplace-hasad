package com.pazaryeri.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.ArrayList;
import java.util.List;

@Entity @Table(name = "cities")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class City {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private String name;
    private String code;
    @OneToMany(mappedBy = "city", fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default private List<District> districts = new ArrayList<>();
}
