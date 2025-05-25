import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Programada } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ProgramadasActivas: React.FC = () => {
  const { user } = useAuth();
  const [programadas, setProgramadas] = useState<Programada[]>([]);
  const [error, setError] = useState('');
  const [observacionFinal, setObservacionFinal] = useState('');
  const [programadaSeleccionada, setProgramadaSeleccionada] = useState<Programada | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [tipoFinalizacion, setTipoFinalizacion] = useState<'archivada' | 'finalizado_sin_contacto'>('archivada');
  const [observacionEdicion, setObservacionEdicion] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchProgramadas = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get('/programadas');
      console.log('Programadas actualizadas:', data.programadas);
      setProgramadas(data.programadas);
    } catch (error: any) {
      console.error('Error al cargar programadas:', error);
      setError(error.response?.data?.msg || 'Error al cargar las programadas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchProgramadas, 30000);
    fetchProgramadas();
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (programadas.length > 0) {
      console.log('Estado actual:', {
        programadas: programadas.map(p => ({
          id: p.id,
          estado: p.estado,
          gestor_id: p.gestor_id,
          gestor_nombre: p.gestor_nombre
        })),
        usuario_actual: {
          uid: user?.uid,
          nombre: user?.nombre
        }
      });
    }
  }, [programadas, user]);

  const handleTomar = async (id: number) => {
    try {
      console.log('Intentando tomar programada:', id);
      const { data } = await axios.put(`/programadas/${id}/take`);
      console.log('Respuesta al tomar programada:', data);

      // Actualizar la programada en el estado local
      setProgramadas(prevProgramadas => 
        prevProgramadas.map(prog => {
          if (prog.id === id) {
            return {
              ...prog,
              estado: 'en_gestion',
              gestor_id: user?.uid || null,
              gestor_nombre: user?.nombreCompleto || null,
              inicio_gestion: new Date().toISOString()
            };
          }
          return prog;
        })
      );

      // Recargar las programadas inmediatamente
      await fetchProgramadas();

    } catch (error: any) {
      console.error('Error al tomar programada:', error);
      setError(error.response?.data?.msg || 'Error al tomar la programada');
    }
  };

  const handleArchivar = async () => {
    if (!programadaSeleccionada) return;

    try {
      await axios.put(
        `/programadas/${programadaSeleccionada.id}/archive`,
        { 
          observacionFinal,
          estado: tipoFinalizacion
        }
      );

      // Remover la programada del estado local
      setProgramadas(prevProgramadas => 
        prevProgramadas.filter(prog => prog.id !== programadaSeleccionada.id)
      );

      // Log para depuración
      console.log('Programada archivada:', {
        id: programadaSeleccionada.id,
        estado: tipoFinalizacion,
        observacionFinal
      });

      setShowModal(false);
      setProgramadaSeleccionada(null);
      setObservacionFinal('');
      setTipoFinalizacion('archivada');

      // Recargar las programadas después de archivar
      fetchProgramadas();
    } catch (error: any) {
      console.error('Error al archivar programada:', error);
      setError(error.response?.data?.msg || 'Error al archivar la programada');
    }
  };

  const handleEditar = async () => {
    if (!programadaSeleccionada) return;

    try {
      const { data } = await axios.put(
        `/programadas/${programadaSeleccionada.id}`,
        { observacion: observacionEdicion }
      );
      
      // Mantener el estado y el gestor actual
      setProgramadas(prevProgramadas => 
        prevProgramadas.map(prog => 
          prog.id === programadaSeleccionada.id 
            ? {
                ...prog, // Mantener los datos originales
                observacion_inicial: observacionEdicion // Solo actualizar la observación
              }
            : prog
        )
      );

      // Log para depuración
      console.log('Programada editada:', {
        id: programadaSeleccionada.id,
        observacion: observacionEdicion,
        estado: programadaSeleccionada.estado,
        gestor_id: programadaSeleccionada.gestor_id
      });

      setShowEditModal(false);
      setProgramadaSeleccionada(null);
      setObservacionEdicion('');
    } catch (error: any) {
      console.error('Error al editar programada:', error);
      setError(error.response?.data?.msg || 'Error al editar la programada');
    }
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd/MM/yyyy', { locale: es });
  };

  const formatTime = (date: string) => {
    return format(new Date(date), 'HH:mm', { locale: es });
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">Pendiente</span>;
      case 'en_gestion':
        return <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">En Gestión</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">{estado}</span>;
    }
  };

  // Renderizado de botones de acción
  const renderBotonesAccion = (programada: Programada) => {
    const esPendiente = programada.estado === 'pendiente';
    const esEnGestion = programada.estado === 'en_gestion';

    // Log para depuración
    console.log('Estado de programada:', {
      id: programada.id,
      estado: programada.estado,
      gestor_id: programada.gestor_id,
      user_id: user?.uid
    });

    if (esPendiente) {
      return (
        <button
          onClick={() => handleTomar(programada.id)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Tomar
        </button>
      );
    }

    if (esEnGestion) {
      return (
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => {
              setProgramadaSeleccionada(programada);
              setObservacionEdicion(programada.observacion_inicial);
              setShowEditModal(true);
            }}
            className="inline-flex items-center px-2 py-2 border border-gray-300 rounded-full text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            title="Editar"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => {
              setProgramadaSeleccionada(programada);
              setShowModal(true);
            }}
            className="inline-flex items-center px-2 py-2 border border-gray-300 rounded-full text-green-600 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            title="Finalizar"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Programadas Activas</h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            Última actualización: {format(new Date(), 'HH:mm', { locale: es })}
          </span>
          <button
            onClick={fetchProgramadas}
            disabled={isLoading}
            className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <svg className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError('')}>
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Cerrar</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servicio</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creador</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gestor</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observación</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {programadas.map((programada) => (
              <tr key={programada.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{programada.numero_servicio}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(programada.fecha_creacion)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatTime(programada.fecha_creacion)}</td>
                <td className="px-6 py-4 whitespace-nowrap">{getEstadoLabel(programada.estado)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{programada.creador_nombre || 'Sin asignar'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{programada.gestor_nombre || 'Sin gestor'}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{programada.observacion_inicial}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {renderBotonesAccion(programada)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Archivo */}
      {showModal && programadaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-medium mb-4">Finalizar Programada</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado Final
              </label>
              <div className="grid grid-cols-1 gap-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    name="tipoFinalizacion"
                    value="archivada"
                    checked={tipoFinalizacion === 'archivada'}
                    onChange={(e) => setTipoFinalizacion('archivada')}
                  />
                  <span className="ml-2">Finalizado</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    name="tipoFinalizacion"
                    value="finalizado_sin_contacto"
                    checked={tipoFinalizacion === 'finalizado_sin_contacto'}
                    onChange={(e) => setTipoFinalizacion('finalizado_sin_contacto')}
                  />
                  <span className="ml-2">Sin Contacto</span>
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observación Final
              </label>
              <textarea
                value={observacionFinal}
                onChange={(e) => setObservacionFinal(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setProgramadaSeleccionada(null);
                  setObservacionFinal('');
                  setTipoFinalizacion('archivada');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleArchivar}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Finalizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-medium mb-4">Editar Programada</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observación
              </label>
              <textarea
                rows={4}
                value={observacionEdicion}
                onChange={(e) => setObservacionEdicion(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setProgramadaSeleccionada(null);
                  setObservacionEdicion('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditar}
                disabled={!observacionEdicion.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramadasActivas; 