import { PensionResponse } from "../interfaces/pension-response";

interface IData {
    name: string;
    nss: string;
    weekQuoted: string;
    birthdate: string;
    children: string;
    periodos: {
        fechaInicio: string;
        fechaTerminacion: string;
        salarioDiario: number;
    }[];
    uma: number;
}

export const getPension = async(dataToSend: IData) => {
    try {
        const res = await fetch("https://pension-calculator-xoak.onrender.com/api/calculator/complete", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dataToSend),

        });
        return res;
    } catch (error) {
        console.log(error);
        return null;
    }
}