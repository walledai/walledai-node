export interface Mapping {
    [key: string]: string;
}

export interface TextInput {
    role: string;
    content: string;
}

export interface PIIResponse {
    success: boolean;
    statusCode: number;
    message?: string;
    errorCode?: string
    details?: any;
    data?: {
        success: boolean;
        statusCode: number;
        remark: string;
        input: string | TextInput[];
        masked_text: string | TextInput[];
        mapping: Mapping;
        error: string | null;
    };
    error?: Error | string;
}