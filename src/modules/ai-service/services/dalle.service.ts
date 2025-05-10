import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { AiServiceService } from "../ai-service.service";
import { OpenAI } from 'openai';

@Injectable()
export class DalleService {
    private openai: OpenAI;

    constructor(
        @Inject(forwardRef(() => AiServiceService))
        private aiService: AiServiceService,
    ) {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async dalleChat(conversationId: number | null, content: string) {
        let chat: string[] = [];
        if (conversationId) {
            const conversation = await this.aiService.getConversation(conversationId);
            if (conversation?.messages) {
                chat = [...chat, ...conversation.messages];
            }
        }

        const response = await this.openai.images.generate({
            prompt: `A hyper-realistic 3D render of ${content}, cinematic lighting, high resolution, detailed textures, 8K`,
            n: 1,
            size: '1024x1024',
        });

        if (!response.data || response.data.length === 0 || !response.data[0].url) {
            throw new Error('No image was generated.');
        }

        return response.data[0].url;
    }
}
