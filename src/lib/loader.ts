import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { Sale, Product, Customer, DateRecord } from "./types";

const DATA_DIR = path.join(process.cwd(), "public", "data");

// Helper to read CSV with Stream
async function readCSV<T>(filename: string): Promise<T[]> {
    const filePath = path.join(DATA_DIR, filename);
    const fileStream = fs.createReadStream(filePath);

    return new Promise((resolve, reject) => {
        Papa.parse(fileStream, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true, // Automatically parse numbers
            complete: (results) => resolve(results.data as T[]),
            error: (error: Error) => reject(error),
        });
    });
}

export async function getSalesData(): Promise<Sale[]> {
    return readCSV<Sale>("fact_sales.csv");
}

export async function getProductData(): Promise<Product[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await readCSV<any>("dim_product.csv");
    // Map raw usage to Product interface
    return raw.map(p => ({
        prd_key: p.prd_key,
        prd_nm: p.prd_nm,
        cat_key: p.cat_key,
        CAT: p.CAT,
        SUBCAT: p.SUBCAT,
        prd_cost: p.prd_cost,
        prd_color: p.COLOR || "Unknown", // Handle implicit columns
        prd_status: p.STATUS || "Current" // Handle implicit columns
    }));
}

export async function getCustomerData(): Promise<Customer[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await readCSV<any>("dim_customer.csv");
    // Map raw usage to Customer interface
    return raw.map(c => ({
        customer_id: c.customer_id,
        firstname: c.firstname,
        lastname: c.lastname,
        gender: c.gender,
        country: c.country,
        marital_status: c.marital_status || "S", // Default if missing
        birth_date: c.birth_date,
        email: c.email
    }));
}

export async function getDateData(): Promise<DateRecord[]> {
    return readCSV<DateRecord>("dim_date.csv");
}
