import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const CrearProgramada: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    numero_servicio: '',
    observacion_inicial: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await axios.post(
        '/programadas',
        form,
        {
          headers: {
            'Content-Type': 'application/json'
          },
        }
      );
      navigate('/activas');
    } catch (error: any) {
      setError(error.response?.data?.msg || 'Error al crear la programada');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Crear Nueva Programada</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <div>
          <label
            htmlFor="numero_servicio"
            className="block text-sm font-medium text-gray-700"
          >
            Número de Servicio
          </label>
          <input
            type="text"
            id="numero_servicio"
            name="numero_servicio"
            required
            value={form.numero_servicio}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="observacion_inicial"
            className="block text-sm font-medium text-gray-700"
          >
            Observación
          </label>
          <textarea
            id="observacion_inicial"
            name="observacion_inicial"
            rows={4}
            required
            value={form.observacion_inicial}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Crear Programada
          </button>
        </div>
      </form>
    </div>
  );
};

export default CrearProgramada; 