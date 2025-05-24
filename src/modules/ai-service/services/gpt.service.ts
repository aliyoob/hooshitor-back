import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { AiServiceService } from "../ai-service.service";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { InjectRepository } from "@nestjs/typeorm";
import { threadEntity } from "../entities/threads.entity";
import { Repository } from "typeorm";
import { UserEntity } from "src/modules/user/entities/user.entity";
import * as fs from 'fs';
import * as FormData from 'form-data';

@Injectable()
export class GptService {
    private readonly baseUrl = 'https://api.openai.com/v1';
    constructor(
        @InjectRepository(threadEntity)
        private threads: Repository<threadEntity>,
        @Inject(forwardRef(() => AiServiceService))
        private aiService: AiServiceService,
        private readonly http: HttpService
    ) { }

    private headers() {
        return {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
            'OpenAI-Beta': 'assistants=v2',
        };
    }


    async createThread(content: string, user: UserEntity): Promise<string> {
        const response = await firstValueFrom(
            this.http.post(`${this.baseUrl}/threads`, {}, { headers: this.headers() }),
        );
        const threadId = response.data.id;
        const newTread = this.threads.create({ threadIds: [], user });
        newTread.threadIds.push(threadId);
        const sunbject = await this.shortenContent(content);
        newTread.subject = sunbject;
        await this.threads.save(newTread);
        return threadId;
    }

    async addMessage(threadId: string, content: string) {
        await firstValueFrom(
            this.http.post(
                `${this.baseUrl}/threads/${threadId}/messages`,
                { role: 'user', content },
                { headers: this.headers() },
            ),
        );
    }

    async runAssistant(threadId: string): Promise<string> {
        const response = await firstValueFrom(
            this.http.post(
                `${this.baseUrl}/threads/${threadId}/runs`,
                { assistant_id: process.env.ASSISTANT_ID },
                { headers: this.headers() },
            ),
        );
        return response.data.id;
    }

    async waitForRunCompletion(threadId: string, runId: string): Promise<void> {
        let status = 'in_progress';
        while (status === 'in_progress' || status === 'queued') {
            await new Promise((res) => setTimeout(res, 1000));
            const response = await firstValueFrom(
                this.http.get(`${this.baseUrl}/threads/${threadId}/runs/${runId}`, {
                    headers: this.headers(),
                }),
            );
            status = response.data.status;
        }
    }

    async getLatestAssistantMessage(threadId: string): Promise<string> {
        const response = await firstValueFrom(
            this.http.get(`${this.baseUrl}/threads/${threadId}/messages`, {
                headers: this.headers(),
            }),
        );
        const messages = response.data.data;
        const assistantMsg = messages.find((msg) => msg.role === 'assistant');
        return assistantMsg?.content?.[0]?.text?.value || '[No response]';
    }

    async getThreads(user: UserEntity) {
        return this.threads.findOne({ where: { user: user } });
    }

    async getThreadMessages(threadId: string): Promise<any[]> {
        try {
            const response = await firstValueFrom(
                this.http.get(`${this.baseUrl}/threads/${threadId}/messages`, {
                    headers: this.headers(),
                }),
            );
            return response.data.data;
        } catch (error) {
            console.error('Error fetching messages:', error.response?.data || error);
            throw error;
        }
    }

    // voice to text

    async transcribeAudio(filePath: string): Promise<string> {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath));
        formData.append('model', 'whisper-1'); // مدل فعلی فقط whisper-1 هست
        formData.append('language', 'fa'); // یا 'en' یا هر زبان دیگه

        try {
            const response = await firstValueFrom(
                this.http.post('https://api.openai.com/v1/audio/transcriptions', formData, {
                    headers: {
                        ...formData.getHeaders(),
                        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    },
                }),
            );
            return response.data.text;
        } catch (error) {
            console.error('Transcription error:', error.response?.data || error);
            throw error;
        }
    }


    async shortenContent(content: string): Promise<string> {
        if (content.length <= 23) {
            return content;
        } else {
            return content.slice(0, 23) + '...';
        }
    }

}