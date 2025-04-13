import { GoogleGenerativeAI } from "@google/generative-ai";
import User from "../models/user.schema.js";
import fs from 'fs';
import pdf from 'pdf-parse'

const apiKey = '';
const genAI = new GoogleGenerativeAI(apiKey);


export const askLLM = async (req, res) => {

    try {
        const { prompt } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.send(text);
    } catch (error) {
        console.log('Error in askLLM', error)
    }

}

export const summarizeLLM = async (req, res) => {

    try {
        const { file_id } = req.body

        const admin = await User.findOne({ role: 'superAdmin' })
        const file = admin.files.filter((file) => { return file.file_id === file_id })

        const data = await pdf(file[0].file_data);
        const extractedText = data.text;

        const prompt = `This is the data of a research paper or an article, summarize the information: ${extractedText}`;
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.send(text);
    } catch (error) {
        console.log('Error in summarizeLLM', error)
    }
}

export const findPlagiarism = async (req, res) => {

    try {
        const { file_id } = req.body

        const admin = await User.findOne({ role: 'superAdmin' })
        const file = admin.files.filter((file) => { return file.file_id === file_id })

        const data = await pdf(file[0].file_data);
        const extractedText = data.text;

        const prompt = `This is the data of a research paper or an article, Find the plagiarism percentage and the reason, display it in this format only: Plagiarism percentage: Reason for plagiarism percentage: : ${extractedText}`;
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.send(text);
    } catch (error) {
        console.log('Error in findPlagiarism', error)
    }
}


