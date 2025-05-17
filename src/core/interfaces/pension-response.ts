export interface PensionResponse {
    age:           number;
    year:          number;
    type:          Type;
    currentUma:    number;
    averageSalary: number;
    details:       Details;
    pension?:      number;
    umaX25Used?:   number;
    nextYearUma?:  number;
}

export interface Details {
    averageSalaryCalculation: AverageSalaryCalculation;
    pensionCalculation?:      PensionCalculation;
}

export interface AverageSalaryCalculation {
    semanasCotizadas:  number;
    semanasAcumuladas: number;
    salarioTotal:      number;
    salarioPromedio:   number;
    semanasFaltantes:  number;
    esExacto:          boolean;
    detalleSemanas:    DetalleSemana[];
}

export interface DetalleSemana {
    semanas:       number;
    salarioDiario: number;
}

export interface PensionCalculation {
    birthdate:          string;
    diaryPromedySalary: number;
    porcentIncrement:   number;
    monthly:            number;
    uma:                number;
    umaX25:             number;
    weekQuoted:         number;
    anualIncrement:     number;
    incrementCuentia:   number;
    subtotalBefore:     number;
    wifeAssign:         number;
    subtotal:           number;
    factorAgeArise:     number;
    decret:             number;
    monthlyPension:     number;
    aguinald:           number;
    childAssign:        number;
    childrenCount:      number;
}

export enum Type {
    FirstYear = "first-year",
    Pension = "pension",
    Projection = "projection",
}
