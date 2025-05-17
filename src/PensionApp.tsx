import { useEffect, useState } from 'react';
import { getActualUma } from './helpers/get-uma';
import { getPension } from './core/api/get-pension';
import './index.css';

interface IModalidad {
    startDate: string | null,
    endDate: string | null,
    cost: number | null
}

export default function PensionApp() {

    const [fecha, setFecha] = useState('');
    const [esValida, setEsValida] = useState<boolean | null>(null);
    const [calculateWeeks, setCalculateWeeks] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFecha(e.target.value);
        // Resetear la validación al cambiar la fecha
        setEsValida(null);
    };

    const validarFecha = () => {
        if (!fecha) return;

        const fechaIngresada = new Date(fecha);
        // Calcular fecha límite (hace 5 años desde hoy)
        const fechaLimite = new Date();
        fechaLimite.setFullYear(fechaLimite.getFullYear() - 5);

        setEsValida(fechaIngresada <= fechaLimite);
    };

    const calcularSemanasEntreFechas = (fechaInicio: string, fechaTerminacion: string) => {
        if (!fechaInicio || !fechaTerminacion) return 0;

        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaTerminacion);

        // Diferencia en milisegundos
        const diff = fin.getTime() - inicio.getTime();

        // Convertir a días (agregamos 1 para incluir ambos días extremos)
        const dias = (diff / (1000 * 60 * 60 * 24)) + 1;

        // Convertir a semanas con 2 decimales
        const semanas = Math.round((dias / 7) * 100) / 100;

        return semanas > 0 ? semanas : 0;
    };

    // En tu componente, agrega este estado para las semanas calculadas
    const [semanasCalculadas, setSemanasCalculadas] = useState(0);

    // Función para calcular todas las semanas
    const calcularTotalSemanas = () => {
        let total = 0;

        form.periods.forEach(period => {
            if (period.fechaInicio && period.fechaTerminacion) {
                total += calcularSemanasEntreFechas(period.fechaInicio, period.fechaTerminacion);
            }
        });

        // Redondear a 1 decimal para evitar errores de punto flotante
        total = Math.round(total * 10) / 10;

        setSemanasCalculadas(total);
        return total;
    };


    // Modifica tu función onSend para validar las semanas
    const onSend = () => {

        setError(false);
        if (form.name.length <= 0) {
            return alert("El nombre es requerido");
        } else if (form.nss.length <= 10) {
            return alert("El NSS debe tener 11 digitos")
        } else if (form.weeks <= 0) {
            return alert("Las semanas cotizadas son requeridas");
        } else if (form.birthdate.length <= 0) {
            return alert("La fecha de nacimiento es requerida");
        }

        const cleanedPeriods = form.periods.filter(period =>
            period.fechaInicio.trim() !== '' &&
            period.fechaTerminacion.trim() !== '' &&
            period.salarioDiario !== 0 &&
            +period.salarioDiario > 0
        );

        if (cleanedPeriods.length === 0) {
            alert('Debes llenar al menos un periodo completo.');
            return;
        }

        // Calcular semanas totales de los periodos
        const semanasPeriodos = calcularTotalSemanas();

        // Validar que sean al menos 250 semanas
        if (semanasPeriodos <= 249 || semanasPeriodos >= 251) {
            return alert(`Debes tener al menos 250 semanas cotizadas. Actualmente tienes ${semanasPeriodos} semanas.`);
        }

        const [year, month, day] = form.birthdate.split("-");
        const newBirth = `${day}/${month}/${year}`;

        let cleanedForm;

        cleanedForm = {
            name: form.name,
            nss: form.nss,
            periodos: cleanedPeriods,
            weekQuoted: form.weeks,
            birthdate: newBirth,
            uma: form.uma,
            children: form.children,
        };

        if (calculateWeeks) {
            cleanedForm = {
                ...cleanedForm,
                dischargeDate: fecha
            }
        }

        if (modalidad.cost && modalidad.endDate && modalidad.startDate) {
            cleanedForm = {
                ...cleanedForm,
                modalidad10: {
                    startDate: modalidad.startDate,
                    endDate: modalidad.endDate,
                    cost: modalidad.cost
                }
            }
        }
        
        onSetData(cleanedForm);
    }

    const [form, setForm] = useState({
        name: '',
        nss: '',
        weeks: 0,
        birthdate: '',
        children: '',
        periods: [
            { fechaInicio: '', fechaTerminacion: '', salarioDiario: 0 },
            { fechaInicio: '', fechaTerminacion: '', salarioDiario: 0 },
            { fechaInicio: '', fechaTerminacion: '', salarioDiario: 0 },
            { fechaInicio: '', fechaTerminacion: '', salarioDiario: 0 },

            { fechaInicio: '', fechaTerminacion: '', salarioDiario: 0 },
            { fechaInicio: '', fechaTerminacion: '', salarioDiario: 0 },
            { fechaInicio: '', fechaTerminacion: '', salarioDiario: 0 },
            { fechaInicio: '', fechaTerminacion: '', salarioDiario: 0 },

            { fechaInicio: '', fechaTerminacion: '', salarioDiario: 0 },
            { fechaInicio: '', fechaTerminacion: '', salarioDiario: 0 },
            { fechaInicio: '', fechaTerminacion: '', salarioDiario: 0 },
            { fechaInicio: '', fechaTerminacion: '', salarioDiario: 0 },

            { fechaInicio: '', fechaTerminacion: '', salarioDiario: 0 },
            { fechaInicio: '', fechaTerminacion: '', salarioDiario: 0 },
            { fechaInicio: '', fechaTerminacion: '', salarioDiario: 0 },
            { fechaInicio: '', fechaTerminacion: '', salarioDiario: 0 },

        ],
        salaryAdjustments: [
            { year: '', salary: 0 }
        ],
        annualInflation: 0,
        uma: getActualUma()
    });

    const [modalidad, setModalidad] = useState<IModalidad>({
        startDate: null,
        endDate: null,
        cost: null
    });


    const [error, setError] = useState(false);

    const onSetData = async (cleanedForm: any) => {
        const response = await getPension(cleanedForm);
        if (response === null) {
            setError(true);
            return;
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/pdf')) {
            // 3. Crear un blob y abrirlo en nueva pestaña
            const blob = await response.blob();
            const pdfUrl = URL.createObjectURL(blob);
            window.open(pdfUrl, '_blank');

            // Liberar memoria después de un tiempo
            setTimeout(() => URL.revokeObjectURL(pdfUrl), 10000);
        } else {
            // Si no es PDF, manejar como error
            const errorData = await response.json();
            console.error('Error al generar PDF:', errorData);
            setError(true);
            alert('Ocurrió un error al generar el PDF');
        }
    }

    useEffect(() => {
        calcularTotalSemanas();
    }, [form.periods]);

    return (
        <div>
            <h1>Calculadora de pensión</h1>

            <div className="input-div">
                <label htmlFor="name">Nombre: </label>
                <input type="text" placeholder='Nombre completo'
                    value={form.name}
                    onChange={({ target }) => setForm({ ...form, name: target.value })}
                    id="name" />
            </div>

            <div className="input-div">
                <label htmlFor="birthdate">Fecha de nacimiento: </label>
                <input type="date"
                    value={form.birthdate}
                    onChange={({ target }) => setForm({ ...form, birthdate: target.value })}
                    id="birthdate" />
            </div>

            <div className="input-div">
                <label htmlFor="nss">NSS: </label>
                <input type="text" id="nss" placeholder='Número de seguro social'
                    value={form.nss}
                    onChange={({ target }) => setForm({ ...form, nss: target.value })}
                />
            </div>

            <div className="input-div">
                <label htmlFor="weeks">Semanas cotizadas: </label>
                <input type="number" id="weeks" placeholder='571'
                    value={form.weeks}
                    onChange={({ target }) => setForm({ ...form, weeks: +target.value })}
                />
            </div>

            <div className="input-div">
                <label htmlFor="children">¿Hijos menores de edad? (Opcional): </label>
                <input type="number" placeholder='O que sigan estudiando hasta los 25'
                    value={form.children}
                    onChange={({ target }) => setForm({ ...form, children: target.value })}
                    id="children" />
            </div>


            <div className="inputs-wrapper margin">
                <div className="input-div">
                    <label htmlFor="adjust">¿Ajuste de salario? (Opcional): </label>
                    <input type="number" id="adjust" placeholder='2025'
                        value={form.salaryAdjustments[0].year}
                        onChange={({ target }) => {
                            const updatedSalaries = [...form.salaryAdjustments];
                            updatedSalaries[0].year = target.value;
                            setForm({ ...form, salaryAdjustments: updatedSalaries })
                        }} />
                </div>

                <div className="input-div">
                    <input type="number" placeholder='500'
                        value={form.salaryAdjustments[0].salary}
                        onChange={({ target }) => {
                            const updatedSalaries = [...form.salaryAdjustments];
                            updatedSalaries[0].salary = +target.value;
                            setForm({ ...form, salaryAdjustments: updatedSalaries })
                        }} />
                </div>
            </div>


            <div className="inputs-wrapper margin">

                <div className="input-div">
                    <label htmlFor="modal-10">Modalidad 10:</label>
                    <input type="date" id="modal-10" placeholder='10/12/2025'
                        value={modalidad.startDate!}
                        onChange={({ target }) => {
                            setModalidad({ ...modalidad, startDate: target.value })
                        }} />
                </div>

                <div className="input-div">
                    <input type="date" id="modal-10" placeholder='10/12/2027'
                        value={modalidad.endDate!}
                        onChange={({ target }) => {
                            setModalidad({ ...modalidad, endDate: target.value })
                        }} />
                </div>

                <div className="input-div">
                    <input type="number" id="modal-10-price" placeholder='Costo'
                        value={modalidad.cost!}
                        onChange={({ target }) => {
                            setModalidad({ ...modalidad, cost: +target.value })
                        }} />
                </div>

            </div>


            <div className="input-div">
                <label htmlFor="baja">Fecha de baja: </label>
                <input
                    type="date"
                    value={fecha}
                    onChange={handleChange}
                    id="baja"
                />
                <button onClick={validarFecha}>Validar</button>

                {esValida !== null && (
                    esValida ? (
                        <div className="recovery-options">
                            <p>¿Desea recuperar semanas?:</p>
                            <input
                                className="check"
                                checked={calculateWeeks}
                                onChange={() => setCalculateWeeks(!calculateWeeks)}
                                type="checkbox"
                                name="recoveryWeeks"
                                id="recoveryWeeks"
                            />
                        </div>
                    ) : (
                        <p className="not-applicable">No es aplicable para recuperar semanas</p>
                    )
                )}
            </div>





            <div className="input-div">
                <label htmlFor="inflation">¿Inflacion? (Opcional): </label>
                <input type="number" id="inflation" placeholder='3'
                    value={form.annualInflation}
                    onChange={({ target }) => setForm({ ...form, annualInflation: +target.value })}
                />
            </div>

            <h2> Periodos de fechas </h2>

            <div className="periody-dates">
                <div className="inputs-wrapper">

                    <div className="input-div">
                        <label htmlFor="inicio1">Inicio: </label>
                        <input type="date" placeholder="Fecha de Inicio" id="inicio1"
                            value={form.periods[0].fechaInicio}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[0].fechaInicio = target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                    <div className="input-div">
                        <label htmlFor="termino1">Termino: </label>
                        <input type="date" placeholder="Fecha de Terminación" id="termino1"
                            value={form.periods[0].fechaTerminacion}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[0].fechaTerminacion = target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                    <div className="input-div">
                        <label htmlFor="salario1">Salario: </label>
                        <input type="number" placeholder="Salario diario" id="salario1"
                            value={form.periods[0].salarioDiario}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[0].salarioDiario = +target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                </div>

                <div className="inputs-wrapper">

                    <div className="input-div">
                        <label htmlFor="inicio2">Inicio: </label>
                        <input type="date" placeholder="Fecha de Inicio" id="inicio2"
                            value={form.periods[1].fechaInicio}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[1].fechaInicio = target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                    <div className="input-div">
                        <label htmlFor="termino2">Termino: </label>
                        <input type="date" placeholder="Fecha de Terminación" id="termino2"
                            value={form.periods[1].fechaTerminacion}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[1].fechaTerminacion = target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                    <div className="input-div">
                        <label htmlFor="salario2">Salario: </label>
                        <input type="number" placeholder="Salario diario" id="salario2"
                            value={form.periods[1].salarioDiario}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[1].salarioDiario = +target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                </div>

                <div className="inputs-wrapper">

                    <div className="input-div">
                        <label htmlFor="inicio3">Inicio: </label>
                        <input type="date" placeholder="Fecha de Inicio" id="inicio3"
                            value={form.periods[2].fechaInicio}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[2].fechaInicio = target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                    <div className="input-div">
                        <label htmlFor="termino3">Termino: </label>
                        <input type="date" placeholder="Fecha de Terminación" id="termino3"
                            value={form.periods[2].fechaTerminacion}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[2].fechaTerminacion = target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                    <div className="input-div">
                        <label htmlFor="salario3">Salario: </label>
                        <input type="number" placeholder="Salario diario" id="salario3"
                            value={form.periods[2].salarioDiario}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[2].salarioDiario = +target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                </div>

                <div className="inputs-wrapper">

                    <div className="input-div">
                        <label htmlFor="inicio4">Inicio: </label>
                        <input type="date" placeholder="Fecha de Inicio" id="inicio4"
                            value={form.periods[3].fechaInicio}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[3].fechaInicio = target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                    <div className="input-div">
                        <label htmlFor="termino4">Termino: </label>
                        <input type="date" placeholder="Fecha de Terminación" id="termino4"
                            value={form.periods[3].fechaTerminacion}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[3].fechaTerminacion = target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                    <div className="input-div">
                        <label htmlFor="salario4">Salario: </label>
                        <input type="number" placeholder="Salario diario" id="salario4"
                            value={form.periods[3].salarioDiario}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[3].salarioDiario = +target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                </div>

                <div className="inputs-wrapper">

                    <div className="input-div">
                        <label htmlFor="inicio5">Inicio: </label>
                        <input type="date" placeholder="Fecha de Inicio" id="inicio5"
                            value={form.periods[4].fechaInicio}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[4].fechaInicio = target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                    <div className="input-div">
                        <label htmlFor="termino5">Termino: </label>
                        <input type="date" placeholder="Fecha de Terminación" id="termino5"
                            value={form.periods[4].fechaTerminacion}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[4].fechaTerminacion = target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                    <div className="input-div">
                        <label htmlFor="salario5">Salario: </label>
                        <input type="number" placeholder="Salario diario" id="salario5"
                            value={form.periods[4].salarioDiario}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[4].salarioDiario = +target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                </div>

                <div className="inputs-wrapper">

                    <div className="input-div">
                        <label htmlFor="inicio6">Inicio: </label>
                        <input type="date" placeholder="Fecha de Inicio" id="inicio6"
                            value={form.periods[5].fechaInicio}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[5].fechaInicio = target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                    <div className="input-div">
                        <label htmlFor="termino6">Termino: </label>
                        <input type="date" placeholder="Fecha de Terminación" id="termino6"
                            value={form.periods[5].fechaTerminacion}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[5].fechaTerminacion = target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                    <div className="input-div">
                        <label htmlFor="salario6">Salario: </label>
                        <input type="number" placeholder="Salario diario" id="salario6"
                            value={form.periods[5].salarioDiario}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[5].salarioDiario = +target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                </div>

                <div className="inputs-wrapper">

                    <div className="input-div">
                        <label htmlFor="inicio7">Inicio: </label>
                        <input type="date" placeholder="Fecha de Inicio" id="inicio7"
                            value={form.periods[6].fechaInicio}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[6].fechaInicio = target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                    <div className="input-div">
                        <label htmlFor="termino7">Termino: </label>
                        <input type="date" placeholder="Fecha de Terminación" id="termino7"
                            value={form.periods[6].fechaTerminacion}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[6].fechaTerminacion = target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                    <div className="input-div">
                        <label htmlFor="salario7">Salario: </label>
                        <input type="number" placeholder="Salario diario" id="salario7"
                            value={form.periods[6].salarioDiario}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[6].salarioDiario = +target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                </div>

                <div className="inputs-wrapper">

                    <div className="input-div">
                        <label htmlFor="inicio8">Inicio: </label>
                        <input type="date" placeholder="Fecha de Inicio" id="inicio8"
                            value={form.periods[7].fechaInicio}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[7].fechaInicio = target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                    <div className="input-div">
                        <label htmlFor="termino8">Termino: </label>
                        <input type="date" placeholder="Fecha de Terminación" id="termino8"
                            value={form.periods[7].fechaTerminacion}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[7].fechaTerminacion = target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                    <div className="input-div">
                        <label htmlFor="salario8">Salario: </label>
                        <input type="number" placeholder="Salario diario" id="salario8"
                            value={form.periods[7].salarioDiario}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[7].salarioDiario = +target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                </div>


                <div className="inputs-wrapper">

                    <div className="input-div">
                        <label htmlFor="inicio9">Inicio: </label>
                        <input type="date" placeholder="Fecha de Inicio" id="inicio9"
                            value={form.periods[8].fechaInicio}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[8].fechaInicio = target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                    <div className="input-div">
                        <label htmlFor="termino9">Termino: </label>
                        <input type="date" placeholder="Fecha de Terminación" id="termino9"
                            value={form.periods[8].fechaTerminacion}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[8].fechaTerminacion = target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                    <div className="input-div">
                        <label htmlFor="salario9">Salario: </label>
                        <input type="number" placeholder="Salario diario" id="salario9"
                            value={form.periods[8].salarioDiario}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[8].salarioDiario = +target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                </div>

                <div className="inputs-wrapper">

                    <div className="input-div">
                        <label htmlFor="inicio10">Inicio: </label>
                        <input type="date" placeholder="Fecha de Inicio" id="inicio10"
                            value={form.periods[9].fechaInicio}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[9].fechaInicio = target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                    <div className="input-div">
                        <label htmlFor="termino10">Termino: </label>
                        <input type="date" placeholder="Fecha de Terminación" id="termino10"
                            value={form.periods[9].fechaTerminacion}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[9].fechaTerminacion = target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                    <div className="input-div">
                        <label htmlFor="salario10">Salario: </label>
                        <input type="number" placeholder="Salario diario" id="salario10"
                            value={form.periods[9].salarioDiario}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[9].salarioDiario = +target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                </div>

                <div className="inputs-wrapper">

                    <div className="input-div">
                        <label htmlFor="inicio11">Inicio: </label>
                        <input type="date" placeholder="Fecha de Inicio" id="inicio11"
                            value={form.periods[10].fechaInicio}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[10].fechaInicio = target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                    <div className="input-div">
                        <label htmlFor="termino11">Termino: </label>
                        <input type="date" placeholder="Fecha de Terminación" id="termino11"
                            value={form.periods[10].fechaTerminacion}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[10].fechaTerminacion = target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                    <div className="input-div">
                        <label htmlFor="salario11">Salario: </label>
                        <input type="number" placeholder="Salario diario" id="salario11"
                            value={form.periods[10].salarioDiario}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[10].salarioDiario = +target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                </div>

                <div className="inputs-wrapper">

                    <div className="input-div">
                        <label htmlFor="inicio12">Inicio: </label>
                        <input type="date" placeholder="Fecha de Inicio" id="inicio12"
                            value={form.periods[11].fechaInicio}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[11].fechaInicio = target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                    <div className="input-div">
                        <label htmlFor="termino12">Termino: </label>
                        <input type="date" placeholder="Fecha de Terminación" id="termino12"
                            value={form.periods[11].fechaTerminacion}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[11].fechaTerminacion = target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                    <div className="input-div">
                        <label htmlFor="salario12">Salario: </label>
                        <input type="number" placeholder="Salario diario" id="salario12"
                            value={form.periods[11].salarioDiario}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[11].salarioDiario = +target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                </div>

                <div className="inputs-wrapper">

                    <div className="input-div">
                        <label htmlFor="inicio13">Inicio: </label>
                        <input type="date" placeholder="Fecha de Inicio" id="inicio13"
                            value={form.periods[12].fechaInicio}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[12].fechaInicio = target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                    <div className="input-div">
                        <label htmlFor="termino13">Termino: </label>
                        <input type="date" placeholder="Fecha de Terminación" id="termino13"
                            value={form.periods[12].fechaTerminacion}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[12].fechaTerminacion = target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                    <div className="input-div">
                        <label htmlFor="salario13">Salario: </label>
                        <input type="number" placeholder="Salario diario" id="salario13"
                            value={form.periods[12].salarioDiario}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[12].salarioDiario = +target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                </div>

                <div className="inputs-wrapper">

                    <div className="input-div">
                        <label htmlFor="inicio14">Inicio: </label>
                        <input type="date" placeholder="Fecha de Inicio" id="inicio14"
                            value={form.periods[13].fechaInicio}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[13].fechaInicio = target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                    <div className="input-div">
                        <label htmlFor="termino14">Termino: </label>
                        <input type="date" placeholder="Fecha de Terminación" id="termino14"
                            value={form.periods[13].fechaTerminacion}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[13].fechaTerminacion = target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                    <div className="input-div">
                        <label htmlFor="salario14">Salario: </label>
                        <input type="number" placeholder="Salario diario" id="salario14"
                            value={form.periods[13].salarioDiario}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[13].salarioDiario = +target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                </div>

                <div className="inputs-wrapper">

                    <div className="input-div">
                        <label htmlFor="inicio15">Inicio: </label>
                        <input type="date" placeholder="Fecha de Inicio" id="inicio15"
                            value={form.periods[14].fechaInicio}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[14].fechaInicio = target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                    <div className="input-div">
                        <label htmlFor="termino15">Termino: </label>
                        <input type="date" placeholder="Fecha de Terminación" id="termino15"
                            value={form.periods[14].fechaTerminacion}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[14].fechaTerminacion = target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                    <div className="input-div">
                        <label htmlFor="salario15">Salario: </label>
                        <input type="number" placeholder="Salario diario" id="salario15"
                            value={form.periods[14].salarioDiario}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[14].salarioDiario = +target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                </div>

                <div className="inputs-wrapper">

                    <div className="input-div">
                        <label htmlFor="inicio16">Inicio: </label>
                        <input type="date" placeholder="Fecha de Inicio" id="inicio16"
                            value={form.periods[15].fechaInicio}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[15].fechaInicio = target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                    <div className="input-div">
                        <label htmlFor="termino16">Termino: </label>
                        <input type="date" placeholder="Fecha de Terminación" id="termino16"
                            value={form.periods[15].fechaTerminacion}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[15].fechaTerminacion = target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                    <div className="input-div">
                        <label htmlFor="salario16">Salario: </label>
                        <input type="number" placeholder="Salario diario" id="salario16"
                            value={form.periods[15].salarioDiario}
                            onChange={({ target }) => {
                                const updatedPeriods = [...form.periods];
                                updatedPeriods[15].salarioDiario = +target.value;
                                setForm({ ...form, periods: updatedPeriods })
                            }} />
                    </div>

                </div>

            </div>

            {
                error && <h3>Hubo un error. Vuelva a intentarlo</h3>
            }
            <div className="semanas-info">
                <h3>Semanas acumuladas: {semanasCalculadas.toFixed(1)}</h3>
                {semanasCalculadas < 250 && (
                    <p className="warning-text">Se necesitan al menos 250 semanas</p>
                )}
            </div>

            <div className="button-div">
                <button onClick={onSend}>
                    Generar PDF
                </button>
            </div>

        </div>
    )
}
