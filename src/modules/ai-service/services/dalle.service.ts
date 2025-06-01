import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { AiServiceService } from "../ai-service.service";
import { OpenAI } from 'openai';
const fs = require("fs"); // تغییر نحوه وارد کردن ماژول fs
import axios, { AxiosResponse } from "axios";
import * as FormData from "form-data";
import { response } from "express";
import { writeFile } from "fs/promises";
const Replicate = require("replicate");
import fetch from "node-fetch";
import * as path from 'path';


// Define interfaces outside the class
interface Prediction {
    id: string;
    model: string;
    version: string;
    input: { prompt: string };
    logs: string;
    output: string | null;
    data_removed: boolean;
    error: string | null;
    status: string;
    created_at: string;
    urls: {
        cancel: string;
        get: string;
        stream: string;
    };
}

interface StatusResult {
    status: string;
    output?: string[];
}

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
            model: "dall-e-3",
            prompt: `A hyper-realistic 3D render of ${content}, cinematic lighting, high resolution, detailed textures, 8K`,
            n: 1,
            size: '1024x1024',
        });

        if (!response.data || response.data.length === 0 || !response.data[0].url) {
            throw new Error('No image was generated.');
        }

        // Download the image from OpenAI URL
        const imageUrl = response.data[0].url;
        const imageResponse = await axios({
            url: imageUrl,
            method: 'GET',
            responseType: 'arraybuffer'
        });

        // Create uploads directory if it doesn't exist
        const uploadPath = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        // Generate unique filename and save the image
        const fileName = `dalle-${Date.now()}.png`;
        const filePath = path.join(uploadPath, fileName);

        await writeFile(filePath, Buffer.from(imageResponse.data));

        // Return URL to the saved image on your server
        const publicUrl = `http://${process.env.DOMAIN}/uploads/${fileName}`;

        return publicUrl;
    }

    async stabilityImage(conversationId: number | null, content: string) {
        let chat: string[] = [];
        if (conversationId) {
            const conversation = await this.aiService.getConversation(conversationId);
            if (conversation?.messages) {
                chat = [...chat, ...conversation.messages];
            }
        }

        const payload = {
            prompt: content, // استفاده از پارامتر content به عنوان prompt
            output_format: "jpeg"
        };

        const response = await axios.postForm(
            `https://api.stability.ai/v2beta/stable-image/generate/sd3`,
            axios.toFormData(payload, new FormData()),
            {
                validateStatus: undefined,
                responseType: "arraybuffer",
                headers: {
                    Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
                    Accept: "image/*"
                },
            },
        );

        if (response.status === 200) {
            // ذخیره تصویر در فولدر uploads
            const filePath = `./uploads/output-${Date.now()}.jpeg`;
            fs.writeFileSync(filePath, Buffer.from(response.data));
            return filePath; // بازگرداندن مسیر فایل ذخیره شده
        } else {
            throw new Error(`${response.status}: ${response.data.toString()}`);
        }
    }

    async replicateImage(conversationId: number | null, content: string): Promise<string> {
        let chat: string[] = [];
        if (conversationId) {
            const conversation = await this.aiService.getConversation(conversationId);
            if (conversation?.messages) {
                chat = [...chat, ...conversation.messages];
            }
        }

        const model = "black-forest-labs/flux-schnell";
        const version = "MODEL_VERSION_ID"; // 👈 باید نسخه مدل را دستی وارد کنی
        const API_TOKEN = process.env.REPLICATE_API_TOKEN;

        // Step 1: Create prediction
        const predictionResponse = await fetch("https://api.replicate.com/v1/predictions", {
            method: "POST",
            headers: {
                Authorization: `Token ${API_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                version: "bf53bdb93d739c9c915091cfa5f49ca662d11273a5eb30e7a2ec1939bcf27a00",
                input: { prompt: content }
            }),
        });

        const prediction = (await predictionResponse.json()) as Prediction;

        console.log("Prediction response:", prediction);

        if (prediction.error) {
            throw new Error(`Prediction failed: ${prediction.error}`);
        }

        const streamUrl = prediction.urls.stream;
        const fileName = `${prediction.id}.webp`;
        const uploadPath = path.join(process.cwd(), 'uploads');

        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        const filePath = path.join(uploadPath, fileName);


        // ایجاد پوشه uploads در صورت عدم وجود
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        const response: AxiosResponse = await axios({
            url: streamUrl,
            method: 'GET',
            responseType: 'stream',
        });

        const writer = fs.createWriteStream(filePath);

        return new Promise((resolve, reject) => {
            response.data.pipe(writer);
            let error: Error | null = null;

            writer.on('error', err => {
                error = err;
                writer.close();
                reject(err);
            });

            writer.on('close', () => {
                if (!error) {
                    const publicUrl = `http://${process.env.DOMAIN}/uploads/${fileName}`;
                    resolve(publicUrl);  // آدرس فایل ذخیره‌شده برگردانده می‌شود
                    console.log('__dirname:', __dirname);
                    console.log('Upload Path:', uploadPath);
                }
            });
        });
    }
}
