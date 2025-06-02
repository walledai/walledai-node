
export interface Mapping {
    [key: string]: string;
}

export interface PIIResponse {
    success: boolean;
    data?: {
        success: boolean;
        remark: string;
        input: string;
        masked_text: string;
        mapping: Mapping;
    },
    error?: Error | string;
}
