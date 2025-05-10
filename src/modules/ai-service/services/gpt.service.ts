import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { AiServiceService } from "../ai-service.service";

@Injectable()
export class GptService {
    constructor(
        @Inject(forwardRef(() => AiServiceService))
        private aiService: AiServiceService,
    ) { }

    async gptChat(conversationId: number | null, content: string) {
        let chat: string[] = [];
        if (conversationId) {
            const conversation = await this.aiService.getConversation(conversationId);
            if (conversation && conversation.messages) {
                chat = [...chat, ...conversation.messages];
            }
        }

        // Add the new content to the chat if it's empty
        if (chat.length === 0 && content) {
            chat.push(content);
        }

        // ساختن payload برای ارسال به OpenAI
        const payload = {
            model: "gpt-4",
            messages: chat.map((message) => ({ role: "user", content: message })),
        };

        // Log the payload for debugging
        console.log("Payload:", JSON.stringify(payload, null, 2));

        // ارسال درخواست به OpenAI API
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify(payload),
        });
        console.log("Response status:", response.status);

        if (!response.ok) {
            const errorDetails = await response.text();
            console.error("Error details:", errorDetails);
            throw new Error(`OpenAI API error: ${response.statusText} - ${errorDetails}`);
        }

        const data = await response.json();

        // دریافت پاسخ از OpenAI و بازگشت آن
        const gptResponse = data.choices[0].message.content;
        return gptResponse
    }


}