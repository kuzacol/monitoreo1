import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Programada } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const Archivadas: React.FC = () => {
  const { user } = useAuth();
  const [programadas, setProgramadas] = useState<Programada[]>([]);
  const [error, setError] = useState('');
  const [fechas, setFechas] = useState({
    desde: format(new Date(), 'yyyy-MM-dd'),
    hasta: format(new Date(), 'yyyy-MM-dd'),
  });

  const fetchProgramadas = async () => {
    try {
      const params = new URLSearchParams();
      if (fechas.desde && fechas.hasta) {
        params.append('desde', fechas.desde);
        params.append('hasta', fechas.hasta);
      }

      const { data } = await axios.get(
        `/programadas/archived?${params.toString()}`
      );
      setProgramadas(data.programadas);
    } catch (error: any) {
      setError(error.response?.data?.msg || 'Error al cargar las programadas');
    }
  };

  useEffect(() => {
    fetchProgramadas();
  }, [fechas]);

  const handleExportar = async () => {
    try {
      const params = new URLSearchParams();
      if (fechas.desde && fechas.hasta) {
        params.append('desde', fechas.desde);
        params.append('hasta', fechas.hasta);
      }

      const response = await axios.get(
        `/programadas/export?${params.toString()}`,
        {
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'programadas.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      setError('Error al exportar las programadas');
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
      case 'finalizado_sin_contacto':
        return <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">No Responde</span>;
      case 'archivada':
        return <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">Finalizado</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">{estado}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Programadas Archivadas</h2>
        <button
          onClick={handleExportar}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Exportar Excel
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={fechas.desde}
              onChange={(e) =>
                setFechas((prev) => ({ ...prev, desde: e.target.value }))
              }
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              value={fechas.hasta}
              onChange={(e) =>
                setFechas((prev) => ({ ...prev, hasta: e.target.value }))
              }
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 pl-10"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creador</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gestor</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observación</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observación Final</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Gestión</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Archivado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {programadas.map((programada) => (
                <tr key={programada.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(programada.fecha_creacion)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatTime(programada.fecha_creacion)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getEstadoLabel(programada.estado)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{programada.creador_nombre || 'Sin asignar'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{programada.gestor_nombre || 'Sin gestor'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{programada.observacion_inicial}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{programada.observacion_final}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {programada.inicio_gestion ? formatDate(programada.inicio_gestion) + ' ' + formatTime(programada.inicio_gestion) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {programada.fin_gestion ? formatDate(programada.fin_gestion) + ' ' + formatTime(programada.fin_gestion) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Archivadas; 