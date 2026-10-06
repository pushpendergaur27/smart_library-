package com.smartlibrary.controller;

import com.smartlibrary.dto.ChatRequest;
import com.smartlibrary.dto.ChatResponse;
import com.smartlibrary.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        String reply = chatService.answer(request.getMessage() == null ? "" : request.getMessage());
        return ResponseEntity.ok(new ChatResponse(reply));
    }
}
