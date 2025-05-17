
export const getActualUma = (): number => {
    const year = new Date().getFullYear();
    return umas[year];
}


const umas: any = {
    2025: 113.14,
    2026: 118.8,
    2027: 124.74,
    2028: 130.97,
    2029: 137.52,
    2030: 144.40,
}