package com.focusloop.session;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients
@SpringBootApplication
public class FocusSessionApplication {
  public static void main(String[] args) {
    SpringApplication.run(FocusSessionApplication.class, args);
  }
}
